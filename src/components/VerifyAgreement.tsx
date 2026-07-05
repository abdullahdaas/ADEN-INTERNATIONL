
import React, { useState, useEffect } from "react";
import {
  Search,
  FileCheck,
  AlertTriangle,
  XCircle,
  Loader2,
  Printer
} from "lucide-react";
import { ElectronicAgreement } from "../types";
import { QRCodeSVG } from "qrcode.react";
import Barcode from "react-barcode";

export default function VerifyAgreement({
  lang,
  initialSerialNumber,
}: {
  lang: "ar" | "en" | "ku";
  initialSerialNumber?: string | null;
}) {
  const [serialNumber, setSerialNumber] = useState(initialSerialNumber || "");
  const [status, setStatus] = useState<"idle" | "loading" | "found" | "not-found" | "cancelled" | "deleted">("idle");
  const [agreement, setAgreement] = useState<ElectronicAgreement | null>(null);

  useEffect(() => {
    if (initialSerialNumber) {
      handleVerify(initialSerialNumber);
    }
  }, [initialSerialNumber]);

  const recordScan = (serial: string) => {
    fetch('/api/agreements/scan-history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serialNumber: serial,
        device: navigator.userAgent,
        browser: navigator.vendor || 'Unknown'
      })
    }).catch(console.error);
  };

  const handleVerify = (forceSerial?: string) => {
    const sn = forceSerial || serialNumber;
    if (!sn) return;
    setStatus("loading");
    
    // Always record scan attempt
    recordScan(sn);

    const fetchVerification = async () => {
      try {
        const res = await fetch(`/api/agreements/verify/${sn}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'deleted') {
            setStatus("deleted");
          } else if (data.status === 'cancelled') {
            setAgreement(data);
            setStatus("cancelled");
          } else {
            setAgreement(data);
            setStatus("found");
          }
        } else {
          setStatus("not-found");
        }
      } catch (err) {
        setStatus("not-found");
      }
    };
    fetchVerification();
  };

  const getStatusText = (st: string) => {
    switch (st) {
      case 'pending_approval': return 'قيد المراجعة';
      case 'pending_payment': return 'بانتظار الدفع';
      case 'active': return 'نشط / ساري';
      case 'completed': return 'مكتمل';
      case 'cancelled': return 'ملغى';
      case 'rejected': return 'مرفوض';
      case 'archived': return 'مؤرشف';
      case 'deleted': return 'محذوف';
      case 'expired': return 'منتهي الصلاحية';
      default: return st;
    }
  };

  const getStatusColor = (st: string) => {
    switch (st) {
      case 'active':
      case 'completed': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'pending_approval':
      case 'pending_payment': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'cancelled':
      case 'rejected':
      case 'deleted':
      case 'expired': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      case 'archived': return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div
      className="min-h-screen bg-royal-dark text-slate-300 py-12 px-4 sm:px-6 print:bg-white print:text-black"
      dir={lang === "ar" || lang === "ku" ? "rtl" : "ltr"}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Verification Input (Hidden in print) */}
        <div className="text-center space-y-4 print:hidden">
          <div className="mx-auto w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center">
            <FileCheck className="h-8 w-8 text-[#F27D26]" />
          </div>
          <h1 className="text-2xl font-bold text-white">
            نظام التحقق من المراسلات الرسمية
          </h1>
          <p className="text-slate-400 text-sm">
            أدخل الرقم الرسمي للمراسلة للتحقق من صحتها وحالتها
          </p>
        </div>

        <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/10 print:hidden">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="الرقم الرسمي (مثال: ADN-2026-000001)"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-center sm:text-right text-white text-lg font-mono tracking-wider focus:border-[#F27D26] outline-none"
              dir="ltr"
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
            />
            <button
              onClick={() => handleVerify()}
              disabled={!serialNumber || status === "loading"}
              className="bg-[#F27D26] hover:bg-[#d96a1a] disabled:opacity-50 text-[#ffffff] px-8 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
            >
              {status === "loading" ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Search className="h-5 w-5" />
                  تحقق
                </>
              )}
            </button>
          </div>
        </div>

        {/* Status Responses */}
        {status === "not-found" && (
          <div className="bg-slate-900/50 border border-white/10 p-12 rounded-2xl flex flex-col items-center justify-center gap-4 text-center print:hidden">
            <XCircle className="h-16 w-16 text-slate-500" />
            <h3 className="font-bold text-2xl text-slate-300">This correspondence does not exist.</h3>
            <p className="text-slate-400">هذه المراسلة غير موجودة في النظام.</p>
          </div>
        )}

        {status === "deleted" && (
          <div className="bg-rose-500/10 border border-rose-500/20 p-12 rounded-2xl flex flex-col items-center justify-center gap-4 text-center print:hidden">
            <AlertTriangle className="h-16 w-16 text-rose-500" />
            <h3 className="font-bold text-2xl text-rose-500">This correspondence is no longer valid.</h3>
            <p className="text-rose-400">هذه المراسلة لم تعد صالحة (تم حذفها).</p>
          </div>
        )}

        {status === "cancelled" && (
          <div className="bg-rose-500/10 border border-rose-500/20 p-12 rounded-2xl flex flex-col items-center justify-center gap-4 text-center print:hidden">
            <AlertTriangle className="h-16 w-16 text-rose-500" />
            <h3 className="font-bold text-2xl text-rose-500">This correspondence has been cancelled.</h3>
            <p className="text-rose-400">تم إلغاء هذه المراسلة الرسمية.</p>
          </div>
        )}

        {status === "found" && agreement && (
          <div className="bg-slate-900/50 border border-white/10 p-8 sm:p-12 rounded-3xl animate-fade-in relative print:bg-white print:border-none print:shadow-none print:p-0">
            
            <button 
              onClick={() => window.print()}
              className="absolute top-8 left-8 bg-white/10 hover:bg-white/20 p-3 rounded-xl transition-all print:hidden"
              title="Print Document"
            >
              <Printer className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center justify-center gap-4 border-b border-white/10 pb-8 mb-8 print:border-slate-200">
              <FileCheck className="h-16 w-16 text-emerald-500 print:text-emerald-700" />
              <h2 className="font-black text-3xl text-white print:text-black">مراسلة رسمية موثقة</h2>
              <div className={`px-6 py-2 rounded-full border ${getStatusColor(agreement.status)} text-sm font-bold`}>
                الحالة: {getStatusText(agreement.status)}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 mb-12">
              <div>
                <span className="block text-slate-500 text-sm mb-2 print:text-slate-600">الرقم الرسمي (Official Number)</span>
                <span className="font-mono font-bold text-xl text-white print:text-black tracking-widest">{agreement.serialNumber}</span>
              </div>
              
              <div>
                <span className="block text-slate-500 text-sm mb-2 print:text-slate-600">الجهة المصدرة (Issuing Department)</span>
                <span className="font-bold text-lg text-white print:text-black">منصة عدن للوساطة العقارية</span>
              </div>

              <div>
                <span className="block text-slate-500 text-sm mb-2 print:text-slate-600">تاريخ الإصدار (Issue Date)</span>
                <span className="font-bold text-lg text-white print:text-black">
                  {new Date(agreement.createdAt).toLocaleDateString("en-GB")}
                </span>
              </div>

              <div>
                <span className="block text-slate-500 text-sm mb-2 print:text-slate-600">وقت الإصدار (Issue Time)</span>
                <span className="font-bold text-lg text-white print:text-black" dir="ltr">
                  {new Date(agreement.createdAt).toLocaleTimeString("en-GB")}
                </span>
              </div>

              <div className="md:col-span-2">
                <span className="block text-slate-500 text-sm mb-2 print:text-slate-600">الموضوع (Subject)</span>
                <span className="font-bold text-lg text-white print:text-black leading-relaxed">
                  {agreement.propertyDetails || 'مراسلة وتوثيق معاملة عقارية رسمية'}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-8 pt-8 border-t border-white/10 print:border-slate-200">
              <div className="flex flex-col items-center gap-4 bg-white p-4 rounded-xl">
                <QRCodeSVG 
                  value={`https://adenintl.site/verify/${agreement.serialNumber}`} 
                  size={120}
                  level="H"
                />
                <span className="text-xs font-mono text-slate-500 font-bold">امسح للتحقق</span>
              </div>

              <div className="flex-1 flex justify-end">
                <div className="bg-white p-4 rounded-xl flex items-center justify-center">
                  <Barcode 
                    value={agreement.serialNumber} 
                    width={2} 
                    height={60} 
                    displayValue={false}
                    background="#ffffff"
                    lineColor="#000000"
                  />
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
