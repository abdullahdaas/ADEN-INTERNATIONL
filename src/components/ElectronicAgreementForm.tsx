import React, { useState } from "react";
import {
  ArrowRight,
  FileSignature,
  AlertTriangle,
  ShieldCheck,
  CreditCard,
  Download,
  ExternalLink,
} from "lucide-react";
import { Property, ElectronicAgreement } from "../types";

interface Props {
  property?: Property;
  user: any;
  lang: "ar" | "en" | "ku";
  onBack: () => void;
  onSuccess: (agreementId: string) => void;
}

export default function ElectronicAgreementForm({
  property,
  user,
  lang,
  onBack,
  onSuccess,
}: Props) {
  const [formData, setFormData] = useState({
    sellerName: user?.role === "citizen" ? user.name : "",
    sellerPhone: user?.role === "citizen" ? user.phone : "",
    buyerName: "",
    buyerPhone: "",
    agreedPrice: property?.price || 0,
    depositAmount: 0,
    conditions:
      "يتم تسليم العقار بعد دفع كامل المبلغ في دائرة التسجيل العقاري.",
    validityDays: 15,
    propertyAddress: property
      ? `${property.governorate} - ${property.district} - ${property.neighborhood}`
      : "",
    propertyDetails: property
      ? `${property.buildingType} بمساحة ${property.space} م²`
      : "",
  });

  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Info, 2: Payment, 3: Success
  const [paymentMethod, setPaymentMethod] = useState<"zain_cash" | "qi_card">(
    "zain_cash",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingRequest, setExistingRequest] = useState<boolean>(false);
  const [paymentData, setPaymentData] = useState({
    payerName: user?.name || "",
    payerPhone: user?.phone || "",
    amount: "25000",
    date: "",
    notes: "",
    proofFile: null as File | null,
  });

  // Check if a request already exists for this property
  React.useEffect(() => {
    if (property?.id) {
      const existing = localStorage.getItem(`agreement_req_${property.id}`);
      if (existing) {
        setExistingRequest(true);
      }
    }
  }, [property?.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (existingRequest) return;
    setStep(2);
  };

  const [newAgreementId, setNewAgreementId] = useState<string>('');

  const handlePayment = async () => {
    if (isSubmitting || existingRequest) return;
    setIsSubmitting(true);
    
    try {
      const agreementPayload = {
        serialNumber: 'ADN-' + new Date().getFullYear() + '-' + Math.floor(100000 + Math.random() * 900000),
        propertyId: property?.id,
        propertyDetails: formData.propertyDetails,
        propertyAddress: formData.propertyAddress,
        sellerName: formData.sellerName,
        sellerPhone: formData.sellerPhone,
        buyerName: formData.buyerName,
        buyerPhone: formData.buyerPhone,
        agreedPrice: formData.agreedPrice,
        depositAmount: formData.depositAmount,
        conditions: formData.conditions,
        validityDays: formData.validityDays,
        initiatorId: user?.id || 'anonymous',
        counterpartyPhone: formData.buyerPhone
      };

      const res = await fetch('/api/agreements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agreementPayload)
      });
      const data = await res.json();
      
      if (data.success) {
        if (property?.id) {
          localStorage.setItem(`agreement_req_${property.id}`, JSON.stringify({
            id: data.agreement.id,
            status: 'Waiting for Review',
            date: new Date().toISOString()
          }));
        }
        setNewAgreementId(data.agreement.id);
        setStep(3);
      } else {
        alert('حدث خطأ أثناء إرسال الطلب');
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء إرسال الطلب');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isRtl = lang === "ar" || lang === "ku";

  return (
    <div
      className="min-h-screen bg-royal-dark text-slate-300 pb-20"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="bg-gradient-to-b from-slate-900 to-royal-dark border-b border-white/5 py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-xl"
          >
            <ArrowRight className="h-5 w-5" /> رجوع
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <FileSignature className="h-6 w-6 text-[#F27D26]" />
              إنشاء مكاتبة إلكترونية
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              توثيق الاتفاق الأولي بين البائع والمشتري
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {existingRequest && (
          <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-4">
            <AlertTriangle className="h-6 w-6 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-amber-500 font-bold mb-1">تنبيه</h3>
              <p className="text-amber-500/80 text-sm">
                يوجد بالفعل طلب مكاتبة لهذا العقار، ولا يمكن إنشاء طلب جديد حتى يتم إنهاء الطلب الحالي أو إلغاؤه.
              </p>
            </div>
          </div>
        )}

        {/* Progress Tracker */}
        <div className="flex items-center justify-between mb-8 relative">
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-white/5 z-0"></div>
          <div
            className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-[#F27D26] z-0 transition-all duration-500"
            style={{ width: step === 1 ? "33%" : step === 2 ? "66%" : "100%" }}
          ></div>

          {[
            { id: 1, label: "البيانات" },
            { id: 2, label: "الدفع وإثبات التحويل" },
            { id: 3, label: "المراجعة" },
          ].map((s) => (
            <div
              key={s.id}
              className="relative z-10 flex flex-col items-center gap-2"
            >
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= s.id ? "bg-[#F27D26] text-[#ffffff] shadow-lg shadow-[#F27D26]/20" : "bg-slate-800 text-slate-500 border border-white/10"}`}
              >
                {s.id}
              </div>
              <span
                className={`text-xs font-bold ${step >= s.id ? "text-[#F27D26]" : "text-slate-500"}`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {step === 1 && (
          <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/10 space-y-4">
              <h3 className="font-bold text-white border-b border-white/5 pb-2">
                بيانات العقار والاتفاق
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    تفاصيل العقار (النوع والمساحة)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.propertyDetails}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        propertyDetails: e.target.value,
                      })
                    }
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-[#F27D26] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    عنوان العقار
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.propertyAddress}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        propertyAddress: e.target.value,
                      })
                    }
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-[#F27D26] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    السعر المتفق عليه (د.ع)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.agreedPrice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        agreedPrice: Number(e.target.value),
                      })
                    }
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-[#F27D26] outline-none font-sans"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    مبلغ العربون إن وجد (د.ع)
                  </label>
                  <input
                    type="number"
                    value={formData.depositAmount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        depositAmount: Number(e.target.value),
                      })
                    }
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-[#F27D26] outline-none font-sans"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Seller */}
              <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/10 space-y-4">
                <h3 className="font-bold text-white border-b border-white/5 pb-2">
                  الطرف الأول (البائع)
                </h3>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    الاسم الرباعي
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sellerName}
                    onChange={(e) =>
                      setFormData({ ...formData, sellerName: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-[#F27D26] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    رقم الهاتف الأساسي (يُستخدم للإشعارات)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sellerPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, sellerPhone: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-[#F27D26] outline-none font-sans"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Buyer */}
              <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/10 space-y-4">
                <h3 className="font-bold text-white border-b border-white/5 pb-2">
                  الطرف الثاني (المشتري)
                </h3>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    الاسم الرباعي
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.buyerName}
                    onChange={(e) =>
                      setFormData({ ...formData, buyerName: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-[#F27D26] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    رقم الهاتف الأساسي (يُستخدم للإشعارات)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.buyerPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, buyerPhone: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-[#F27D26] outline-none font-sans"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/10 space-y-4">
              <h3 className="font-bold text-white border-b border-white/5 pb-2">
                الشروط والمدة
              </h3>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  شروط الاتفاق
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.conditions}
                  onChange={(e) =>
                    setFormData({ ...formData, conditions: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-[#F27D26] outline-none resize-none"
                ></textarea>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  مدة سريان المكاتبة (بالأيام)
                </label>
                <select
                  value={formData.validityDays}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      validityDays: Number(e.target.value),
                    })
                  }
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-[#F27D26] outline-none"
                >
                  <option value={7}>7 أيام</option>
                  <option value={15}>15 يوماً</option>
                  <option value={30}>30 يوماً</option>
                  <option value={60}>60 يوماً</option>
                </select>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 p-4 rounded-xl flex gap-3 text-sm">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <p>
                <strong>تنبيه هام:</strong> هذه المكاتبة الإلكترونية هي وثيقة
                تنظيمية داخل منصة "عدن للوساطة العقارية" لتوثيق الاتفاق الأولي
                بين الطرفين، وليست سند ملكية أو عقدًا رسميًا ناقلًا للملكية.
              </p>
            </div>

            <button
              type="submit"
              disabled={existingRequest}
              className="w-full bg-[#F27D26] hover:bg-[#d96a1a] disabled:opacity-50 disabled:hover:bg-[#F27D26] text-[#ffffff] py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-[#F27D26]/20"
            >
              متابعة للدفع
            </button>
          </form>
        )}

        {step === 2 && (
          <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            <div className="bg-slate-900/50 p-8 rounded-2xl border border-white/10 text-center">
              <CreditCard className="h-12 w-12 text-[#F27D26] mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">
                رسوم إصدار المكاتبة
              </h2>
              <p className="text-slate-400 text-sm max-w-lg mx-auto leading-relaxed">
                لإكمال إصدار المكاتبة الإلكترونية، يرجى تسديد رسوم الخدمة
                البالغة (25,000 دينار عراقي) باستخدام إحدى وسائل الدفع التالية،
                ثم إرسال إثبات الدفع للمراجعة.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900/80 p-6 rounded-2xl border border-white/10 relative overflow-hidden">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center">
                    M
                  </div>
                  ماستر كارد
                </h3>
                <p className="text-sm text-slate-400 mb-2">رقم البطاقة:</p>
                <div className="bg-slate-950 p-3 rounded-xl border border-white/5 font-mono text-lg text-white tracking-widest text-center mb-4">
                  9101 9071 4683
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText("910190714683")}
                  className="w-full bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg text-sm font-bold transition-all"
                >
                  نسخ رقم البطاقة
                </button>
              </div>

              <div className="bg-slate-900/80 p-6 rounded-2xl border border-white/10 relative overflow-hidden">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-red-500/10 rounded-full blur-2xl"></div>
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-red-500/20 text-red-400 rounded-lg flex items-center justify-center font-bold">
                    Z
                  </div>
                  زين كاش
                </h3>
                <p className="text-sm text-slate-400 mb-2">رقم زين كاش:</p>
                <div className="bg-slate-950 p-3 rounded-xl border border-white/5 font-mono text-lg text-white tracking-widest text-center mb-4">
                  0781 006 0292
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText("07810060292")}
                  className="w-full bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg text-sm font-bold transition-all"
                >
                  نسخ الرقم
                </button>
              </div>
            </div>

            <div className="bg-slate-900/50 p-6 sm:p-8 rounded-2xl border border-white/10 mt-6">
              <h3 className="font-bold text-white text-lg mb-6 border-b border-white/5 pb-4">
                رفع إثبات الدفع
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      اسم الدافع
                    </label>
                    <input
                      type="text"
                      value={paymentData.payerName}
                      onChange={(e) =>
                        setPaymentData({
                          ...paymentData,
                          payerName: e.target.value,
                        })
                      }
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#F27D26] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      رقم الهاتف
                    </label>
                    <input
                      type="text"
                      value={paymentData.payerPhone}
                      onChange={(e) =>
                        setPaymentData({
                          ...paymentData,
                          payerPhone: e.target.value,
                        })
                      }
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#F27D26] outline-none font-sans"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      وسيلة الدفع المستخدمة
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("qi_card")}
                        className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold border transition-all ${paymentMethod === "qi_card" ? "border-[#F27D26] bg-[#F27D26]/10 text-[#ffffff]" : "border-white/10 bg-slate-950 text-slate-400 hover:text-[#ffffff]"}`}
                      >
                        ماستر كارد
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("zain_cash")}
                        className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold border transition-all ${paymentMethod === "zain_cash" ? "border-[#F27D26] bg-[#F27D26]/10 text-[#ffffff]" : "border-white/10 bg-slate-950 text-slate-400 hover:text-[#ffffff]"}`}
                      >
                        زين كاش
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      مبلغ التحويل (د.ع)
                    </label>
                    <input
                      type="number"
                      value={paymentData.amount}
                      readOnly
                      className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 text-sm text-slate-400 outline-none font-sans cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      تاريخ ووقت التحويل (اختياري)
                    </label>
                    <input
                      type="datetime-local"
                      value={paymentData.date}
                      onChange={(e) =>
                        setPaymentData({ ...paymentData, date: e.target.value })
                      }
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#F27D26] outline-none font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      ملاحظات (اختياري)
                    </label>
                    <input
                      type="text"
                      value={paymentData.notes}
                      onChange={(e) =>
                        setPaymentData({
                          ...paymentData,
                          notes: e.target.value,
                        })
                      }
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#F27D26] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    صورة أو لقطة شاشة لإثبات الدفع
                  </label>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 rounded-xl hover:border-[#F27D26]/50 bg-slate-950 cursor-pointer transition-all">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-400">
                      <Download className="w-8 h-8 mb-3" />
                      <p className="text-sm mb-1">
                        <span className="font-bold text-[#F27D26]">
                          اضغط لرفع الملف
                        </span>{" "}
                        أو قم بالسحب والإفلات
                      </p>
                      <p className="text-xs">JPG, PNG, أو PDF</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) =>
                        setPaymentData({
                          ...paymentData,
                          proofFile: e.target.files?.[0] || null,
                        })
                      }
                    />
                  </label>
                  {paymentData.proofFile && (
                    <div className="mt-2 text-sm text-emerald-400 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" />
                      تم إرفاق الملف: {paymentData.proofFile.name}
                    </div>
                  )}
                </div>

                <div className="pt-6 flex gap-4">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white py-4 rounded-xl font-bold transition-all"
                  >
                    رجوع
                  </button>
                  <button
                    onClick={handlePayment}
                    disabled={
                      isSubmitting ||
                      !paymentData.payerName ||
                      !paymentData.payerPhone
                    }
                    className="flex-[2] bg-[#F27D26] hover:bg-[#d96a1a] disabled:opacity-50 text-[#ffffff] py-4 rounded-xl font-bold transition-all shadow-lg shadow-[#F27D26]/20 flex justify-center items-center gap-2"
                  >
                    {isSubmitting ? (
                      <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                    ) : (
                      <>إرسال طلب المراجعة</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="max-w-xl mx-auto bg-slate-900/50 p-8 sm:p-12 rounded-2xl border border-white/10 text-center space-y-6 animate-fade-in">
            <div className="w-20 h-20 bg-[#F27D26]/10 border-2 border-[#F27D26] rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="h-10 w-10 text-[#F27D26]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                تم استلام طلبك بنجاح
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                تم استلام طلبك بنجاح، وسيتم مراجعته من قبل إدارة منصة عدن
                للوساطة العقارية. سيتم إشعار الطرفين فور اعتماد عملية الدفع
                وإصدار المكاتبة الإلكترونية.
              </p>
              <div className="inline-block bg-amber-500/10 border border-amber-500/20 text-amber-500 px-4 py-2 rounded-lg text-sm font-bold">
                حالة الطلب: بانتظار مراجعة الإدارة
              </div>
            </div>

            <div className="pt-8 border-t border-white/10 flex flex-col gap-3">
              <button
                onClick={() => onSuccess(newAgreementId)}
                className="w-full bg-[#F27D26] hover:bg-[#d96a1a] text-[#ffffff] py-3 rounded-xl font-bold transition-all shadow-lg shadow-[#F27D26]/20"
              >
                عرض المكاتبة (وثيقة QR)
              </button>
              <button
                onClick={onBack}
                className="w-full bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-bold transition-all"
              >
                العودة للرئيسية
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
