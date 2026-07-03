import React from "react";
import {
  ArrowRight,
  FileSignature,
  CheckCircle,
  Clock,
  AlertTriangle,
  ExternalLink,
  Download,
  Printer,
} from "lucide-react";
import { ElectronicAgreement } from "../types";

interface Props {
  user: any;
  lang: "ar" | "en" | "ku";
  onBack: () => void;
  onViewAgreement: (id: string) => void;
}

export default function MyAgreementsList({
  user,
  lang,
  onBack,
  onViewAgreement,
}: Props) {
  const [agreements, setAgreements] = React.useState<ElectronicAgreement[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchAgreements = async () => {
      try {
        if (!user) return;
        const userId = user.id;
        const phone = user.emailOrPhone || user.phone || '';
        const res = await fetch(`/api/agreements/user/${userId}?phone=${phone}`);
        if (res.ok) {
          const data = await res.json();
          setAgreements(data);
        }
      } catch (err) {
        console.error("Error fetching agreements", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAgreements();
  }, [user]);

  const isRtl = lang === "ar" || lang === "ku";

  return (
    <div
      className="min-h-screen bg-royal-dark text-slate-300 pb-20"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="bg-gradient-to-b from-slate-900 to-royal-dark border-b border-white/5 py-8 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-xl"
            >
              <ArrowRight className="h-5 w-5" /> رجوع
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <FileSignature className="h-6 w-6 text-[#F27D26]" />
                مكاتباتي الإلكترونية
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 gap-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-10 h-10 border-4 border-[#F27D26] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : agreements.length === 0 ? (
            <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-white/5">
              <FileSignature className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">لا توجد مكاتبات إلكترونية سابقة.</p>
            </div>
          ) : (
            agreements.map((agreement) => (
              <div
                key={agreement.id}
                className="bg-slate-900/40 rounded-2xl border border-white/5 overflow-hidden hover:border-[#F27D26]/50 transition-all"
              >
              <div className="p-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-mono text-sm text-[#F27D26] bg-[#F27D26]/10 px-2 py-1 rounded">
                      {agreement.serialNumber}
                    </span>
                    {agreement.status === "active" && (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                        <CheckCircle className="h-3.5 w-3.5" /> مكاتبة سارية
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-white text-lg">
                    {agreement.propertyDetails}
                  </h3>
                  <p className="text-sm text-slate-400">
                    {agreement.propertyAddress}
                  </p>
                </div>

                <div className="flex flex-wrap gap-4 sm:gap-8 text-sm">
                  <div>
                    <span className="block text-slate-500 text-xs mb-1">
                      البائع
                    </span>
                    <span className="font-bold text-slate-300">
                      {agreement.sellerName}
                    </span>
                  </div>
                  <div>
                    <span className="block text-slate-500 text-xs mb-1">
                      المشتري
                    </span>
                    <span className="font-bold text-slate-300">
                      {agreement.buyerName}
                    </span>
                  </div>
                  <div>
                    <span className="block text-slate-500 text-xs mb-1">
                      السعر المتفق عليه
                    </span>
                    <span className="font-bold text-white font-sans">
                      {agreement.agreedPrice.toLocaleString("ar-IQ")} د.ع
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap justify-end gap-3 w-full md:w-auto">
                  <button
                    onClick={() => onViewAgreement(agreement.id)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#F27D26] hover:bg-[#d96a1a] text-[#ffffff] px-5 py-2.5 rounded-xl font-bold transition-all text-xs shadow-lg shadow-[#F27D26]/20"
                  >
                    <ExternalLink className="h-4 w-4" /> عرض
                  </button>
                  <button
                    onClick={() => onViewAgreement(agreement.id)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl font-bold transition-all text-xs"
                  >
                    <Download className="h-4 w-4" /> تحميل PDF
                  </button>
                  <button
                    onClick={() => onViewAgreement(agreement.id)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl font-bold transition-all text-xs"
                  >
                    <Printer className="h-4 w-4" /> طباعة
                  </button>
                  <button
                    onClick={() => {
                      // Normally this might go to a verify tab, for now just show a visual state
                    }}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-5 py-2.5 rounded-xl font-bold transition-all text-xs"
                  >
                    <CheckCircle className="h-4 w-4" /> التحقق من الصحة
                  </button>
                </div>
              </div>
            </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
