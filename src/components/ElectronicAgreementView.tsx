import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  Download,
  Printer,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { ElectronicAgreement } from "../types";
import AdenLogo from "./AdenLogo";
import { QRCodeSVG } from "qrcode.react";

interface Props {
  agreementId: string;
  lang: "ar" | "en" | "ku";
  onBack: () => void;
}

export default function ElectronicAgreementView({
  agreementId,
  lang,
  onBack,
}: Props) {
  const [agreement, setAgreement] = useState<ElectronicAgreement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAgreement = async () => {
      try {
        const res = await fetch(`/api/agreements/${agreementId}`);
        if (res.ok) {
          const data = await res.json();
          setAgreement(data);
        } else {
          setError('لم يتم العثور على المكاتبة');
        }
      } catch (err) {
        setError('حدث خطأ أثناء تحميل بيانات المكاتبة');
      } finally {
        setLoading(false);
      }
    };
    fetchAgreement();
  }, [agreementId]);

  const isRtl = lang === "ar" || lang === "ku";

  if (loading) {
    return (
      <div className="min-h-screen bg-royal-dark flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-[#F27D26] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !agreement) {
    return (
      <div className="min-h-screen bg-royal-dark flex flex-col justify-center items-center text-white">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-4">{error}</h2>
        <button onClick={onBack} className="bg-white/10 px-6 py-2 rounded-xl">رجوع</button>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-royal-dark text-slate-300 pb-20 print:bg-white print:text-black"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Non-printable header */}
      <div className="bg-slate-900 border-b border-white/5 py-4 px-4 sm:px-6 print:hidden">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowRight className="h-5 w-5" /> رجوع
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all"
            >
              <Printer className="h-4 w-4" /> طباعة
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-[#F27D26] hover:bg-[#d96a1a] text-[#ffffff] px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-[#F27D26]/20"
            >
              <Download className="h-4 w-4" /> تحميل PDF
            </button>
          </div>
        </div>
      </div>

      {/* Printable Document A4 Size Simulation */}
      <div className="w-full overflow-x-auto pb-8 print:pb-0 print:overflow-visible">
        <div className="w-[210mm] min-h-[297mm] mx-auto mt-8 p-[20mm] bg-white text-slate-900 shadow-2xl print:shadow-none print:m-0 print:p-0 print:w-full print:min-h-[297mm] shrink-0 relative box-border">
          {/* Document Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-200 pb-6 mb-8">

          <div>
            <div className="text-black mb-2">
              <AdenLogo size={40} />
            </div>
            <h1 className="text-2xl font-black text-slate-900">
              مكاتبة إلكترونية (اتفاق أولي)
            </h1>
            <p className="text-sm text-slate-500 font-mono mt-1">
              الرقم التسلسلي (Serial No): {agreement.serialNumber}
            </p>
            <p className="text-xs text-slate-400 font-mono mt-1">
              المعرف الفريد (ID): {agreement.id}
            </p>
          </div>
          <div className="text-left" dir="ltr">
            <p className="text-sm text-slate-500 font-bold">تاريخ الإصدار</p>
            <p className="text-sm font-mono text-slate-900">
              {new Date(agreement.createdAt).toLocaleDateString("en-GB")}
            </p>
            <p className="text-sm font-mono text-slate-900">
              {new Date(agreement.createdAt).toLocaleTimeString("en-GB")}
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-slate-100 p-4 rounded-lg flex gap-3 mb-8 border-r-4 border-amber-500 text-slate-700">
          <AlertTriangle className="h-6 w-6 text-amber-500 shrink-0" />
          <p className="text-sm font-bold leading-relaxed">
            تنويه: هذه المكاتبة الإلكترونية هي وثيقة تنظيمية داخل منصة "عدن
            للوساطة العقارية" لتوثيق الاتفاق الأولي بين الطرفين، وليست سند ملكية
            أو عقدًا رسميًا ناقلًا للملكية. تستخدم كإثبات نوايا للمضي في إجراءات
            التسجيل العقاري الرسمي.
          </p>
        </div>

        {/* Parties Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-8 mb-8">
          <div className="border border-slate-200 rounded-lg p-5">
            <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">
              الطرف الأول (البائع)
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">الاسم الرباعي:</span>
                <span className="font-bold">{agreement.sellerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">رقم الهاتف:</span>
                <span className="font-bold font-mono" dir="ltr">
                  {agreement.sellerPhone}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">حالة الموافقة:</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4" /> موافق إلكترونياً
                </span>
              </div>
            </div>
          </div>

          <div className="border border-slate-200 rounded-lg p-5">
            <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">
              الطرف الثاني (المشتري)
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">الاسم الرباعي:</span>
                <span className="font-bold">{agreement.buyerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">رقم الهاتف:</span>
                <span className="font-bold font-mono" dir="ltr">
                  {agreement.buyerPhone}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">حالة الموافقة:</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4" /> موافق إلكترونياً
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Property & Agreement Details */}
        <h3 className="text-lg font-bold text-slate-900 border-b-2 border-slate-900 inline-block pb-1 mb-6">
          تفاصيل العقار والاتفاق
        </h3>

        <div className="bg-slate-50 rounded-lg border border-slate-200 p-6 space-y-4 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-y-4 text-sm">
            <div>
              <span className="block text-slate-500 mb-1">تفاصيل العقار</span>
              <span className="font-bold text-slate-800">
                {agreement.propertyDetails}
              </span>
            </div>
            <div>
              <span className="block text-slate-500 mb-1">العنوان</span>
              <span className="font-bold text-slate-800">
                {agreement.propertyAddress}
              </span>
            </div>
            <div>
              <span className="block text-slate-500 mb-1">
                السعر المتفق عليه
              </span>
              <span className="font-bold text-slate-800 font-sans">
                {agreement.agreedPrice.toLocaleString("ar-IQ")} دينار عراقي
              </span>
            </div>
            <div>
              <span className="block text-slate-500 mb-1">
                مبلغ العربون المستلم
              </span>
              <span className="font-bold text-slate-800 font-sans">
                {agreement.depositAmount.toLocaleString("ar-IQ")} دينار عراقي
              </span>
            </div>
            <div className="col-span-2 pt-2">
              <span className="block text-slate-500 mb-1">شروط الاتفاق</span>
              <p className="font-bold text-slate-800 bg-white p-3 border border-slate-200 rounded leading-relaxed">
                {agreement.conditions}
              </p>
            </div>
            <div className="col-span-2 pt-2">
              <span className="block text-slate-500 mb-1">
                مدة سريان المكاتبة
              </span>
              <span className="font-bold text-slate-800">
                {agreement.validityDays} يوماً من تاريخ الإصدار
              </span>
            </div>
          </div>
        </div>

        {/* Footer & QR */}
        <div className="flex items-end justify-between pt-12 border-t-2 border-slate-200 mt-12">
          <div className="text-sm text-slate-500 text-center">
            <p className="font-bold text-slate-800 mb-2">
              اعتماد منصة عدن للوساطة العقارية
            </p>
            <p>تم سداد رسوم الخدمة إلكترونياً</p>
            <p className="mt-4 text-xs font-mono">ID: {agreement.id}</p>
          </div>

          <div className="text-center">
            <div className="bg-white border border-slate-200 p-2 flex items-center justify-center mx-auto mb-2 relative">
              <QRCodeSVG 
                value={`https://adenintl.site/letter/${agreement.id}`}
                size={112}
                bgColor={"#ffffff"}
                fgColor={"#000000"}
                level={"L"}
                includeMargin={false}
              />
            </div>
            <p className="text-[10px] text-slate-500 font-bold">
              امسح الرمز للتحقق من صحة الوثيقة
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
