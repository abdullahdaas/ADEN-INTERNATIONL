import React, { useState, useEffect } from "react";
import {
  Search,
  MapPin,
  Star,
  Briefcase,
  Filter,
  ChevronDown,
  CheckCircle,
  ShieldCheck,
} from "lucide-react";
import { ServiceProvider } from "../types";
import { IRAQ_LOCATIONS } from "../data/iraqLocations";

const MOCK_PROVIDERS: ServiceProvider[] = [
  {
    id: "sp1",
    userId: "user1",
    name: "مكتب الرواد للمساحة",
    category: "مكاتب المساحة والمساحين",
    logo: "https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?w=200&h=200&fit=crop",
    coverImage:
      "https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?w=800&h=400&fit=crop",
    description:
      "مكتب هندسي متخصص في أعمال المساحة والخرائط الطبوغرافية وتقسيم الأراضي وإصدار السندات العقارية.",
    yearsOfExperience: 15,
    governorate: "بغداد",
    city: "المنصور",
    address: "شارع 14 رمضان، عمارة الأندلس",
    coordinates: { lat: 33.3152, lng: 44.3661 },
    contactNumbers: ["07801234567"],
    email: "info@alrowad-survey.com",
    socialMedia: {},
    workingHours: "8:00 صباحاً - 4:00 مساءً",
    portfolio: [],
    rating: 4.8,
    reviewCount: 42,
    clientCount: 1500,
    views: 340,
    subscriptionPlan: "business",
    isVerified: true,
    isPromoted: true,
    createdAt: new Date().toISOString(),
    status: "approved",
  },
  {
    id: "sp2",
    userId: "user2",
    name: "شركة البيت الحديث للمقاولات",
    category: "شركات البناء والمقاولات",
    logo: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=200&h=200&fit=crop",
    coverImage:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&h=400&fit=crop",
    description:
      "متخصصون في بناء الفلل والمجمعات السكنية بأعلى معايير الجودة وتسليم مفتاح.",
    yearsOfExperience: 10,
    governorate: "أربيل",
    city: "عينكاوا",
    address: "شارع 100، مجمع امباير",
    coordinates: { lat: 36.19, lng: 44.009 },
    contactNumbers: ["07501234567"],
    email: "contact@modernhouse-erbil.com",
    socialMedia: {},
    workingHours: "9:00 صباحاً - 5:00 مساءً",
    portfolio: [],
    rating: 4.6,
    reviewCount: 28,
    clientCount: 120,
    views: 890,
    subscriptionPlan: "pro",
    isVerified: true,
    isPromoted: false,
    createdAt: new Date().toISOString(),
    status: "approved",
  },
  {
    id: "sp3",
    userId: "user3",
    name: "المستشار القانوني العقاري - أحمد جاسم",
    category: "المحامون المختصون بالعقارات",
    logo: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=200&h=200&fit=crop",
    coverImage:
      "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&h=400&fit=crop",
    description:
      "محامي متخصص في القضايا العقارية، نقل الملكية، حل النزاعات العقارية والمواريث.",
    yearsOfExperience: 22,
    governorate: "البصرة",
    city: "العشار",
    address: "شارع الاستقلال، مقابل المحكمة",
    coordinates: { lat: 30.5081, lng: 47.8335 },
    contactNumbers: ["07701234567"],
    email: "lawyer.ahmed@example.com",
    socialMedia: {},
    workingHours: "9:00 صباحاً - 2:00 مساءً",
    portfolio: [],
    rating: 4.9,
    reviewCount: 65,
    clientCount: 400,
    views: 1200,
    subscriptionPlan: "free",
    isVerified: true,
    isPromoted: false,
    createdAt: new Date().toISOString(),
    status: "approved",
  },
];

const CATEGORIES = [
  "مكاتب الوساطة العقارية",
  "مكاتب المساحة والمساحين",
  "المحامون المختصون بالعقارات",
  "خبراء ومقيمو العقارات",
  "شركات البناء والمقاولات",
  "شركات التشطيبات والديكور",
  "شركات الصيانة المنزلية",
  "شركات الكهرباء والسباكة والتكييف",
  "شركات التنظيف",
  "شركات نقل الأثاث",
  "شركات الحراسة والأمن",
  "البنوك وشركات التمويل العقاري",
  "شركات التأمين العقاري",
  "أخرى",
];

interface Props {
  lang: "ar" | "en" | "ku";
  onSelectProvider: (provider: ServiceProvider) => void;
}

export default function ServiceProvidersList({
  lang,
  onSelectProvider,
}: Props) {
  const [providers, setProviders] = useState<ServiceProvider[]>(MOCK_PROVIDERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [govFilter, setGovFilter] = useState("");

  const filteredProviders = providers.filter((p) => {
    const matchesSearch =
      p.name.includes(searchTerm) || p.description.includes(searchTerm);
    const matchesCategory = categoryFilter
      ? p.category === categoryFilter
      : true;
    const matchesGov = govFilter ? p.governorate === govFilter : true;
    return matchesSearch && matchesCategory && matchesGov;
  });

  return (
    <div
      className="min-h-screen bg-[#050505] text-slate-300 pb-20"
      dir={lang === "ar" || lang === "ku" ? "rtl" : "ltr"}
    >
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-slate-900 to-[#050505] border-b border-white/5 py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-black text-white mb-4">
            الخدمات العقارية
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl mb-8">
            دليل شامل لجميع الخدمات العقارية في العراق. ابحث عن مقاولين،
            مهندسين، محامين، وشركات الصيانة الموثوقة والمعتمدة.
          </p>

          <div className="flex flex-col md:flex-row gap-4 bg-slate-900/50 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input
                type="text"
                placeholder="ابحث عن اسم الشركة أو الخدمة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pr-10 pl-4 text-white focus:border-[#F27D26] outline-none transition-all"
              />
            </div>
            <div className="md:w-1/4">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#F27D26] outline-none transition-all appearance-none"
              >
                <option value="">جميع الفئات</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:w-1/4">
              <select
                value={govFilter}
                onChange={(e) => setGovFilter(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#F27D26] outline-none transition-all appearance-none"
              >
                <option value="">جميع المحافظات</option>
                {IRAQ_LOCATIONS.map((loc) => (
                  <option key={loc.governorate} value={loc.governorate}>
                    {loc.governorate}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-[#F27D26]" />
            مقدمي الخدمات ({filteredProviders.length})
          </h2>
          <button className="text-sm font-bold text-[#F27D26] hover:underline flex items-center gap-1">
            <Filter className="h-4 w-4" /> ترتيب حسب
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProviders.map((provider) => (
            <div
              key={provider.id}
              onClick={() => onSelectProvider(provider)}
              className="bg-slate-900/40 rounded-2xl border border-white/5 overflow-hidden hover:border-[#F27D26]/50 transition-all cursor-pointer group"
            >
              <div className="h-32 w-full relative">
                <img
                  src={provider.coverImage}
                  alt="Cover"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent"></div>
                {provider.isPromoted && (
                  <span className="absolute top-3 right-3 bg-gold-prestige text-slate-900 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                    <Star className="h-3 w-3 fill-slate-900" /> إعلان مميز
                  </span>
                )}
              </div>
              <div className="px-5 pb-5 relative">
                <img
                  src={provider.logo}
                  alt={provider.name}
                  className="w-16 h-16 rounded-xl border-4 border-[#050505] object-cover absolute -top-8 bg-slate-800"
                />
                <div className="pt-10">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-white text-lg line-clamp-1">
                      {provider.name}
                    </h3>
                    {provider.isVerified && (
                      <ShieldCheck
                        className="h-5 w-5 text-emerald-400 shrink-0"
                        title="حساب موثق"
                      />
                    )}
                  </div>
                  <p className="text-xs text-[#F27D26] font-medium mb-3">
                    {provider.category}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                      <span className="text-white font-bold">
                        {provider.rating}
                      </span>
                      <span>({provider.reviewCount})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {provider.governorate}, {provider.city}
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                    {provider.description}
                  </p>

                  <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                    <span className="text-xs text-slate-500 font-mono">
                      {provider.yearsOfExperience} سنوات خبرة
                    </span>
                    <button className="text-xs font-bold text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg transition-colors">
                      عرض التفاصيل
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
