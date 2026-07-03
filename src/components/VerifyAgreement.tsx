import React, { useState } from "react";
import {
  Search,
  FileCheck,
  AlertTriangle,
  FileSignature,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { ElectronicAgreement } from "../types";

export default function VerifyAgreement({
  lang,
}: {
  lang: "ar" | "en" | "ku";
}) {
  const [serialNumber, setSerialNumber] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "found" | "not-found"
  >("idle");
  const [agreement, setAgreement] = useState<ElectronicAgreement | null>(null);

  const handleVerify = () => {
    setStatus("loading");
    
    const fetchVerification = async () => {
      try {
        const res = await fetch(`/api/agreements/verify/${serialNumber}`);
        if (res.ok) {
          const data = await res.json();
          setAgreement(data);
          setStatus("found");
        } else {
          setStatus("not-found");
        }
      } catch (err) {
        setStatus("not-found");
      }
    };
    fetchVerification();
  };

  return (
    <div
      className="min-h-screen bg-[#050505] text-slate-300 py-12 px-4 sm:px-6"
      dir={lang === "ar" || lang === "ku" ? "rtl" : "ltr"}
    >
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center">
            <FileCheck className="h-8 w-8 text-[#F27D26]" />
          </div>
          <h1 className="text-2xl font-bold text-white">
            التحقق من المكاتبة الإلكترونية
          </h1>
          <p className="text-slate-400 text-sm">
            أدخل الرقم التسلسلي للمكاتبة للتحقق من صحتها وحالتها الحالية في منصة
            عدن
          </p>
        </div>

        <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/10">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="رقم المكاتبة (مثال: ADN-2024-XXXXXX)"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-center sm:text-right text-white text-lg font-mono tracking-wider focus:border-[#F27D26] outline-none"
              dir="ltr"
            />
            <button
              onClick={handleVerify}
              disabled={!serialNumber || status === "loading"}
              className="bg-[#F27D26] hover:bg-[#d96a1a] disabled:opacity-50 text-white px-8 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
            >
              {status === "loading" ? (
                <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
              ) : (
                <>
                  <Search className="h-5 w-5" />
                  تحقق
                </>
              )}
            </button>
          </div>
        </div>

        {status === "not-found" && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl flex flex-col items-center justify-center gap-3 animate-fade-in">
            <XCircle className="h-10 w-10" />
            <h3 className="font-bold text-lg">لم يتم العثور على مكاتبة</h3>
            <p className="text-sm opacity-80">
              يرجى التأكد من الرقم التسلسلي والمحاولة مرة أخرى.
            </p>
          </div>
        )}

        {status === "found" && agreement && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-8 rounded-2xl animate-fade-in space-y-6">
            <div className="flex flex-col items-center justify-center gap-3 border-b border-emerald-500/20 pb-6">
              <CheckCircle className="h-12 w-12" />
              <h3 className="font-bold text-2xl">المكاتبة صحيحة وسارية</h3>
              <p className="font-mono text-sm tracking-widest">
                {agreement.serialNumber}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-slate-300">
              <div>
                <span className="block text-emerald-500/70 mb-1">
                  تاريخ الإصدار
                </span>
                <span className="font-bold text-white">
                  {new Date(agreement.createdAt).toLocaleDateString("en-GB")}
                </span>
              </div>
              <div>
                <span className="block text-emerald-500/70 mb-1">
                  تفاصيل العقار
                </span>
                <span className="font-bold text-white">
                  {agreement.propertyDetails}
                </span>
              </div>
              <div>
                <span className="block text-emerald-500/70 mb-1">
                  الطرف الأول (البائع)
                </span>
                <span className="font-bold text-white">
                  {agreement.sellerName}
                </span>
              </div>
              <div>
                <span className="block text-emerald-500/70 mb-1">
                  الطرف الثاني (المشتري)
                </span>
                <span className="font-bold text-white">
                  {agreement.buyerName}
                </span>
              </div>
            </div>

            <div className="bg-slate-950/50 p-4 rounded-xl border border-emerald-500/20 text-xs text-emerald-400/80 flex gap-3 mt-6">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <p>
                هذه الوثيقة هي توثيق اتفاق أولي عبر منصة عدن للوساطة العقارية
                وليست سند ملكية أو عقدًا ناقلًا للملكية.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
