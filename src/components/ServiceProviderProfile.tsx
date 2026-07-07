import React, { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  ShieldCheck,
  MessageSquare,
  Briefcase,
  Eye,
  Users,
  CheckCircle,
  Navigation,
} from "lucide-react";
import { ServiceProvider } from "../types";
import AdenLogo from "./AdenLogo";

interface Props {
  provider: ServiceProvider;
  lang: "ar" | "en" | "ku";
  onBack: () => void;
}

export default function ServiceProviderProfile({
  provider,
  lang,
  onBack,
}: Props) {
  const isRtl = lang === "ar" || lang === "ku";
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;
  const [activeTab, setActiveTab] = useState<"about" | "portfolio" | "reviews">(
    "about",
  );

  return (
    <div
      className="min-h-screen bg-royal-dark text-slate-300 pb-20 font-sans"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Navbar specific to profile */}
      <div className="sticky top-0 z-40 bg-royal-dark/90 backdrop-blur-md border-b border-white/5 py-3 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <BackIcon className="h-5 w-5" />
            <span className="font-bold text-sm">العودة للخدمات</span>
          </button>
          <AdenLogo size={40} />
        </div>
      </div>

      {/* Cover and Header */}
      <div className="w-full h-64 md:h-80 relative bg-slate-900">
        <img loading="lazy"
          src={provider.coverImage}
          alt="Cover"
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-royal-dark via-royal-dark/40 to-transparent"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative -mt-20">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
          <img loading="lazy"
            src={provider.logo}
            alt={provider.name}
            className="w-32 h-32 md:w-40 md:h-40 rounded-2xl border-4 border-royal-dark object-cover bg-slate-800 shadow-2xl"
          />
          <div className="flex-1 pb-2">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-2xl md:text-3xl font-black text-white">
                {provider.name}
              </h1>
              {provider.isVerified && (
                <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded border border-emerald-500/20 text-xs font-bold">
                  <ShieldCheck className="h-4 w-4" /> حساب موثق
                </div>
              )}
            </div>
            <p className="text-[#F27D26] font-bold mb-4">{provider.category}</p>

            <div className="flex flex-wrap gap-4 text-sm text-slate-400">
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                <span className="text-white font-bold">{provider.rating}</span>
                <span>({provider.reviewCount} تقييم)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {provider.governorate}, {provider.city}
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                {provider.clientCount}+ عميل
              </div>
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
            <a
              href={`tel:${provider.contactNumbers[0]}`}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#F27D26] hover:bg-[#d96a1a] text-[#ffffff] px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-[#F27D26]/20"
            >
              <Phone className="h-5 w-5" /> اتصال
            </a>
            <button onClick={() => alert("قريباً - الميزة قيد التطوير")} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-bold transition-all">
              <MessageSquare className="h-5 w-5" /> محادثة
            </button>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="mt-12 border-b border-white/5 flex gap-8 overflow-x-auto">
          {[
            { id: "about", label: "عن الشركة" },
            { id: "portfolio", label: "معرض الأعمال" },
            { id: "reviews", label: "التقييمات" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-4 text-sm font-bold transition-all relative ${activeTab === tab.id ? "text-[#F27D26]" : "text-slate-400 hover:text-white"}`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F27D26] rounded-t-full"></div>
              )}
            </button>
          ))}
        </div>

        <div className="py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {activeTab === "about" && (
              <div className="space-y-8 animate-fade-in">
                <div className="bg-slate-900/40 rounded-2xl p-6 border border-white/5 text-sm leading-relaxed text-slate-300">
                  <h3 className="text-white font-bold mb-4 text-base">
                    نبذة تعريفية
                  </h3>
                  <p>{provider.description}</p>
                </div>

                <div className="bg-slate-900/40 rounded-2xl p-6 border border-white/5">
                  <h3 className="text-white font-bold mb-4 text-base">
                    التفاصيل
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center text-slate-400">
                        <Briefcase className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs">سنوات الخبرة</p>
                        <p className="text-white font-bold">
                          {provider.yearsOfExperience} سنوات
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center text-slate-400">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs">أوقات العمل</p>
                        <p className="text-white font-bold">
                          {provider.workingHours}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center text-slate-400">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs">العنوان</p>
                        <p className="text-white font-bold">
                          {provider.address}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "portfolio" && (
              <div className="animate-fade-in">
                {provider.portfolio && provider.portfolio.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {provider.portfolio.map((img, idx) => (
                      <div
                        key={idx}
                        className="h-40 rounded-xl overflow-hidden bg-slate-800 border border-white/5"
                      >
                        <img loading="lazy"
                          src={img}
                          alt={`Portfolio ${idx}`}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-500 cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-white/5">
                    <Briefcase className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">لا توجد أعمال مضافة حالياً</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="animate-fade-in space-y-6">
                <div className="flex items-center justify-between bg-slate-900/40 p-6 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl font-black text-white">
                      {provider.rating}
                    </div>
                    <div>
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i <= Math.round(provider.rating) ? "text-amber-400 fill-amber-400" : "text-slate-600"}`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-slate-400">
                        بناءً على {provider.reviewCount} تقييم
                      </p>
                    </div>
                  </div>
                  <button onClick={() => alert("قريباً - الميزة قيد التطوير")} className="bg-[#F27D26] hover:bg-[#d96a1a] text-[#ffffff] px-4 py-2 rounded-lg text-sm font-bold transition-all">
                    أضف تقييمك
                  </button>
                </div>

              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-slate-900/40 rounded-2xl p-6 border border-white/5 space-y-4">
              <h3 className="text-white font-bold mb-4 border-b border-white/5 pb-2">
                معلومات التواصل
              </h3>

              {provider.contactNumbers.map((num, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-slate-300 text-sm">
                    <Phone className="h-4 w-4 text-[#F27D26]" />
                    <span dir="ltr">{num}</span>
                  </div>
                </div>
              ))}

              <div className="flex items-center gap-3 text-slate-300 text-sm">
                <Mail className="h-4 w-4 text-[#F27D26]" />
                <span className="truncate">{provider.email}</span>
              </div>

              {provider.website && (
                <div className="flex items-center gap-3 text-slate-300 text-sm">
                  <Globe className="h-4 w-4 text-[#F27D26]" />
                  <a
                    href={provider.website}
                    target="_blank" rel="noopener noreferrer"
                    className="hover:text-blue-400 truncate"
                  >
                    {provider.website}
                  </a>
                </div>
              )}
            </div>

            <div className="bg-slate-900/40 rounded-2xl p-6 border border-white/5">
              <h3 className="text-white font-bold mb-4 border-b border-white/5 pb-2">
                الموقع على الخريطة
              </h3>
              <div className="h-48 bg-slate-800 rounded-xl mb-4 flex items-center justify-center text-slate-500 border border-white/10 relative overflow-hidden">
                {/* Fallback mock map image */}
                <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80')] bg-cover bg-center"></div>
                <MapPin className="h-8 w-8 text-red-500 relative z-10" />
              </div>
              <button onClick={() => alert("قريباً - الميزة قيد التطوير")} className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white py-2.5 rounded-lg text-sm font-bold transition-all">
                <Navigation className="h-4 w-4" /> فتح في خرائط جوجل
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
