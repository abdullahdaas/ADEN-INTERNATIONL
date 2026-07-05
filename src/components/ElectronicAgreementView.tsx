import React, { useState, useEffect } from "react";
import { ArrowRight, Download, Printer, ShieldCheck, AlertTriangle, Loader2, X } from "lucide-react";
import { ElectronicAgreement } from "../types";
import AdenLogo from "./AdenLogo";
import { QRCodeSVG } from "qrcode.react";
import Barcode from "react-barcode";



interface Props {
  agreementId: string;
  lang: "ar" | "en" | "ku";
  onBack: () => void;
}

export default function ElectronicAgreementView({ agreementId, lang, onBack }: Props) {
  const [agreement, setAgreement] = useState<ElectronicAgreement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

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

    const generatePDF = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 pb-12 bg-royal-dark/95 backdrop-blur-xl">
        <Loader2 className="h-8 w-8 text-[#F27D26] animate-spin" />
      </div>
    );
  }

  if (error || !agreement) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 bg-royal-dark/95 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-8 mb-6">
            <AlertTriangle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">{error || 'عذراً، المكاتبة غير موجودة'}</h2>
            <p className="text-slate-400">قد يكون الرابط غير صحيح أو تم إزالة المكاتبة</p>
          </div>
          <button
            onClick={onBack}
            className="rounded-xl bg-white/10 hover:bg-white/20 px-6 py-3 text-sm font-bold text-white transition-all inline-flex items-center gap-2"
          >
            <ArrowRight className="h-4 w-4" />
            <span>العودة</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 font-sans text-slate-900" dir="rtl">
      <div className="max-w-4xl mx-auto">
        
        {/* Top Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-200 print:hidden">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg font-bold text-sm"
          >
            <ArrowRight className="h-4 w-4" />
            <span>رجوع</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={generatePDF}
              
              className="flex items-center gap-2 bg-[#F27D26] hover:bg-[#d96a1a] text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-all disabled:opacity-50"
            >
              {false ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>جاري إنشاء المكاتبة...</span>
                </>
              ) : (
                <>
                  <Printer className="h-4 w-4" />
                  <span>طباعة / تصدير PDF</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Web View of Agreement */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mb-8">
           <div className="text-center mb-8">
              <AdenLogo size={50} />
              <h2 className="text-2xl font-black mt-4 text-slate-900">مكاتبة إلكترونية (اتفاق أولي)</h2>
              <p className="text-slate-500 font-mono mt-2 text-sm">{agreement.serialNumber}</p>
           </div>
           
           <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex gap-3 mb-8">
              <AlertTriangle className="h-6 w-6 text-amber-500 shrink-0" />
              <p className="text-sm font-bold text-amber-800 leading-relaxed">
                تنويه: هذه المكاتبة الإلكترونية هي وثيقة تنظيمية داخل منصة "عدن للوساطة العقارية" لتوثيق الاتفاق الأولي بين الطرفين، وليست سند ملكية أو عقدًا رسميًا ناقلًا للملكية.
              </p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="border border-slate-200 p-5 rounded-xl bg-slate-50">
                <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">الطرف الأول (البائع)</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-slate-500">الاسم:</span> <span className="font-bold">{agreement.sellerName}</span></p>
                  <p><span className="text-slate-500">الهاتف:</span> <span className="font-bold font-mono" dir="ltr">{agreement.sellerPhone}</span></p>
                  <p><span className="text-slate-500">الموافقة:</span> <span className="text-emerald-600 font-bold inline-flex items-center gap-1"><ShieldCheck className="h-4 w-4"/> موافق إلكترونياً</span></p>
                </div>
              </div>
              <div className="border border-slate-200 p-5 rounded-xl bg-slate-50">
                <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">الطرف الثاني (المشتري)</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-slate-500">الاسم:</span> <span className="font-bold">{agreement.buyerName}</span></p>
                  <p><span className="text-slate-500">الهاتف:</span> <span className="font-bold font-mono" dir="ltr">{agreement.buyerPhone}</span></p>
                  <p><span className="text-slate-500">الموافقة:</span> <span className="text-emerald-600 font-bold inline-flex items-center gap-1"><ShieldCheck className="h-4 w-4"/> موافق إلكترونياً</span></p>
                </div>
              </div>
           </div>

           <div className="border border-slate-200 p-6 rounded-xl">
              <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">تفاصيل العقار والاتفاق</h3>
              <div className="space-y-4 text-sm">
                 <div><span className="text-slate-500 block mb-1">العقار:</span> <span className="font-bold text-slate-900">{agreement.propertyDetails}</span></div>
                 <div><span className="text-slate-500 block mb-1">العنوان:</span> <span className="font-bold text-slate-900">{agreement.propertyAddress}</span></div>
                 <div className="grid grid-cols-2 gap-4">
                    <div><span className="text-slate-500 block mb-1">السعر المتفق عليه:</span> <span className="font-bold text-emerald-600 text-lg">{agreement.agreedPrice.toLocaleString("ar-IQ")} د.ع</span></div>
                    <div><span className="text-slate-500 block mb-1">العربون:</span> <span className="font-bold text-slate-900 text-lg">{agreement.depositAmount.toLocaleString("ar-IQ")} د.ع</span></div>
                 </div>
                 <div>
                    <span className="text-slate-500 block mb-1">الشروط:</span>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 font-bold leading-relaxed">{agreement.conditions}</div>
                 </div>
              </div>
           </div>
           
           {/* QR Code and Stamp for Web View */}
           <div className="mt-8 flex flex-col md:flex-row justify-between items-center md:items-end border-t border-slate-200 pt-8 gap-8">
              <div className="font-bold text-center">
                 <p className="mb-6 text-slate-500">الختم الإلكتروني للمنصة</p>
                 <div className="w-32 h-32 border-4 border-[#F27D26] rounded-full mx-auto flex items-center justify-center opacity-80 rotate-[-15deg]">
                   <div className="text-center">
                     <p className="text-[#F27D26] font-black text-xl">منصة عدن</p>
                     <p className="text-[#F27D26] font-bold text-xs uppercase mt-1">وثيقة معتمدة</p>
                   </div>
                 </div>
              </div>
              <div className="text-center font-bold">
                 <p className="mb-2 text-sm text-slate-500">للتحقق من صحة الوثيقة</p>
                 <div className="border border-slate-200 p-2 bg-white inline-block rounded-xl">
                   <QRCodeSVG 
                     value={`https://adenintl.site/verify/${agreement.serialNumber}`}
                     size={100}
                     bgColor={"#ffffff"}
                     fgColor={"#000000"}
                     level={"H"}
                     includeMargin={false}
                   />
                 </div>
              </div>
           </div>
           
        </div>
      </div>

      {/* PDF Modal Preview */}
      

      {/* Hidden PDF Render Container */}
      <div id="pdf-wrapper" style={{ position: "fixed", left: "-20000px", top: 0 }}>
        <div 
          id="pdf-render-container" 
          className="bg-white text-black relative" 
          style={{ width: '210mm', height: '297mm', padding: '20mm', boxSizing: 'border-box', overflow: 'hidden' }} 
          dir="rtl"
        >
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-8">
            <div className="text-center w-1/3 pt-2">
              <h2 className="font-bold text-xl mb-2">جمهورية العراق</h2>
              <h3 className="font-bold text-lg mb-2">منصة عدن للوساطة العقارية</h3>
              <p className="text-sm font-bold">قسم التوثيق الإلكتروني</p>
            </div>
            
            <div className="flex justify-center w-1/3">
               <AdenLogo size={80} />
            </div>

            <div className="text-left w-1/3 flex flex-col gap-2 items-end font-sans">
               <p className="font-bold text-sm flex justify-between w-full" dir="ltr">
                 <span>Date:</span> <span>{new Date(agreement.createdAt).toLocaleDateString('en-GB')}</span>
               </p>
               <p className="font-bold text-sm flex justify-between w-full" dir="ltr">
                 <span>Ref:</span> <span>{agreement.id.slice(0, 8).toUpperCase()}</span>
               </p>
               <div className="mt-2 text-right">
                 <Barcode value={agreement.serialNumber} width={1} height={40} fontSize={12} displayValue={true} background="#ffffff" lineColor="#000000" margin={0} />
               </div>
            </div>
          </div>

          <div className="text-center mb-10">
             <h1 className="text-3xl font-black underline decoration-2 underline-offset-8">مكاتبة إلكترونية (اتفاق أولي)</h1>
          </div>

          <div className="text-justify leading-loose text-base mb-8">
             <p className="font-bold mb-4 text-lg">
               بناءً على الشروط والأحكام المعتمدة في منصة عدن للوساطة العقارية، تم الاتفاق بين كل من:
             </p>

             <div className="flex gap-4 mb-8">
                <div className="w-1/2 border border-black p-4">
                   <h3 className="font-bold text-lg bg-black text-white px-2 py-1 inline-block mb-4">الطرف الأول (البائع)</h3>
                   <div className="space-y-3 font-bold">
                     <p>الاسم الرباعي: {agreement.sellerName}</p>
                     <p>رقم الهاتف: <span dir="ltr">{agreement.sellerPhone}</span></p>
                     <p>الإقرار: <span className="text-slate-600">تمت الموافقة والمصادقة إلكترونياً</span></p>
                   </div>
                </div>
                <div className="w-1/2 border border-black p-4">
                   <h3 className="font-bold text-lg bg-black text-white px-2 py-1 inline-block mb-4">الطرف الثاني (المشتري)</h3>
                   <div className="space-y-3 font-bold">
                     <p>الاسم الرباعي: {agreement.buyerName}</p>
                     <p>رقم الهاتف: <span dir="ltr">{agreement.buyerPhone}</span></p>
                     <p>الإقرار: <span className="text-slate-600">تمت الموافقة والمصادقة إلكترونياً</span></p>
                   </div>
                </div>
             </div>

             <div className="border border-black p-4 mb-8">
                <h3 className="font-bold text-lg bg-black text-white px-2 py-1 inline-block mb-4">تفاصيل العقار والاتفاق المالي</h3>
                <div className="space-y-4 font-bold">
                   <p>تفاصيل العقار: {agreement.propertyDetails}</p>
                   <p>عنوان العقار: {agreement.propertyAddress}</p>
                   <p>السعر المتفق عليه: {agreement.agreedPrice.toLocaleString("ar-IQ")} (دينار عراقي)</p>
                   <p>مبلغ العربون المستلم: {agreement.depositAmount.toLocaleString("ar-IQ")} (دينار عراقي)</p>
                   
                   <div className="mt-4 pt-4 border-t border-black border-dashed">
                      <p className="mb-2 underline">الشروط الخاصة بالاتفاق:</p>
                      <p className="font-normal text-sm whitespace-pre-wrap leading-relaxed">{agreement.conditions}</p>
                   </div>
                   <p className="mt-4">مدة سريان المكاتبة: {agreement.validityDays} يوماً من تاريخ الإصدار.</p>
                </div>
             </div>

             <div className="bg-slate-100 p-4 border border-black text-sm font-bold text-justify leading-relaxed">
               تنويه قانوني: هذه المكاتبة الإلكترونية صادرة من نظام التوثيق الخاص بمنصة "عدن للوساطة العقارية"، وتعتبر وثيقة تنظيمية لإثبات الاتفاق الأولي ونية الطرفين في إتمام الصفقة العقارية. هذه الوثيقة لا تُعد سند ملكية ولا عقداً ناقلاً للملكية، ويتوجب على الطرفين استكمال الإجراءات الرسمية في دوائر التسجيل العقاري المختصة وفقاً للقانون العراقي.
             </div>
          </div>

          <div className="absolute bottom-[20mm] left-[20mm] right-[20mm]">
             <div className="flex justify-between items-end border-t-2 border-black pt-4">
                <div className="font-bold text-center">
                   <p className="mb-10">الختم الإلكتروني للمنصة</p>
                   <div className="w-32 h-32 border-4 border-[#F27D26] rounded-full mx-auto flex items-center justify-center opacity-80 rotate-[-15deg]">
                     <div className="text-center">
                       <p className="text-[#F27D26] font-black text-xl">منصة عدن</p>
                       <p className="text-[#F27D26] font-bold text-xs uppercase mt-1">وثيقة معتمدة</p>
                     </div>
                   </div>
                </div>

                <div className="text-center font-bold">
                   <p className="mb-2 text-sm">للتحقق من صحة الوثيقة</p>
                   <div className="border-2 border-black p-2 bg-white inline-block">
                     <QRCodeSVG 
                       value={`https://adenintl.site/verify/${agreement.serialNumber}`}
                       size={100}
                       bgColor={"#ffffff"}
                       fgColor={"#000000"}
                       level={"H"}
                       includeMargin={false}
                     />
                   </div>
                </div>
             </div>
          </div>

        </div>
      </div>

    </div>
  );
}
