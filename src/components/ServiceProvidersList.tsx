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
  Plus,
  X,
} from "lucide-react";
import { ServiceProvider } from "../types";
import { submitProviderApplication, fetchServiceProviders } from "../utils/api";
import { IRAQ_GOVERNORATES, getDistrictsByGovernorate } from "../data/iraqLocations";
import { MaterialsProviderForm } from "./MaterialsProviderForm";
import { CONSTRUCTION_MATERIALS } from "../data/constructionMaterials";
import { SmartLocationPicker } from "./SmartLocationPicker";



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
];

interface ServiceProvidersListProps {
  lang: string;
  onSelectProvider: (provider: ServiceProvider) => void;
}

export default function ServiceProvidersList({
  lang,
  onSelectProvider,
}: ServiceProvidersListProps) {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(true);

  useEffect(() => {
    fetchServiceProviders().then(data => {
      setProviders(data || []);
      setLoadingProviders(false);
    }).catch(err => {
      console.error('Failed to fetch providers', err);
      setProviders([]);
      setLoadingProviders(false);
    });
  }, []);

  const [mainTab, setMainTab] = useState<'services' | 'materials'>('services');
  const [searchTerm, setSearchTerm] = useState("");
  const [showAppModal, setShowAppModal] = useState(false);
  const [showMaterialsModal, setShowMaterialsModal] = useState(false);
  const [appForm, setAppForm] = useState({
    name: '',
    phone: '',
    category: '',
    governorate: '',
    district: '',
    subDistrict: '',
    locationText: '',
    mapLink: '',
    address: '',
    details: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [categoryFilter, setCategoryFilter] = useState("");
  const [govFilter, setGovFilter] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [materialFilter, setMaterialFilter] = useState("");
  const [deliveryFilter, setDeliveryFilter] = useState(false);

  const filteredProviders = providers.filter((p) => {
    // Tab filter
    if (mainTab === 'services' && p.category === 'المواد الإنشائية') return false;
    if (mainTab === 'materials' && p.category !== 'المواد الإنشائية') return false;

    const matchesSearch =
      p.name.includes(searchTerm) || p.description.includes(searchTerm);
    
    const matchesCategory = categoryFilter && mainTab === 'services'
      ? p.category === categoryFilter
      : true;
      
    const matchesGov = govFilter ? p.governorate === govFilter : true;
    const matchesDistrict = districtFilter ? p.district === districtFilter : true;
    
    const matchesMaterial = materialFilter && mainTab === 'materials'
      ? p.materialsOffered?.includes(materialFilter)
      : true;
      
    const matchesDelivery = deliveryFilter && mainTab === 'materials'
      ? p.hasDelivery
      : true;

    return matchesSearch && matchesCategory && matchesGov && matchesDistrict && matchesMaterial && matchesDelivery;
  });

  const districtOptions = govFilter ? getDistrictsByGovernorate(govFilter) : [];

  return (
    <div
      className="min-h-screen bg-royal-dark text-slate-300 pb-20"
      dir={lang === "ar" || lang === "ku" ? "rtl" : "ltr"}
    >
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-slate-900 to-royal-dark border-b border-white/5 py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-white mb-4">
              مزودي الخدمات
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl">
              دليل شامل لجميع مزودي الخدمات في العراق. ابحث عن مقاولين، مهندسين، محامين، وشركات الصيانة، بالإضافة إلى موردي المواد الإنشائية.
            </p>
          </div>
          <button 
            onClick={() => mainTab === 'services' ? setShowAppModal(true) : setShowMaterialsModal(true)} 
            className="bg-[#F27D26] hover:bg-[#d96a1a] text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#F27D26]/20 shrink-0"
          >
            <Plus className="w-5 h-5" /> 
            {mainTab === 'services' ? 'انضم كمزود خدمة' : 'تسجيل كمورد مواد'}
          </button>
        </div>

        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex bg-slate-900/50 p-1 rounded-xl w-fit border border-white/10">
            <button 
              onClick={() => setMainTab('services')}
              className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-all ${mainTab === 'services' ? 'bg-[#F27D26] text-white' : 'text-slate-400 hover:text-white'}`}
            >
              الخدمات والمقاولات
            </button>
            <button 
              onClick={() => setMainTab('materials')}
              className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-all ${mainTab === 'materials' ? 'bg-[#F27D26] text-white' : 'text-slate-400 hover:text-white'}`}
            >
              المواد الإنشائية
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 bg-slate-900/50 p-4 rounded-2xl border border-white/10 backdrop-blur-md flex-wrap">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input
                type="text"
                placeholder={mainTab === 'services' ? "ابحث عن اسم الشركة أو الخدمة..." : "ابحث عن اسم المورد أو المادة..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pr-10 pl-4 text-white focus:border-[#F27D26] outline-none transition-all"
              />
            </div>
            
            {mainTab === 'services' && (
              <div className="md:w-1/5 min-w-[150px]">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#F27D26] outline-none transition-all appearance-none"
                >
                  <option value="">جميع الفئات</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            )}

            {mainTab === 'materials' && (
              <div className="md:w-1/5 min-w-[150px]">
                <select
                  value={materialFilter}
                  onChange={(e) => setMaterialFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#F27D26] outline-none transition-all appearance-none"
                >
                  <option value="">جميع المواد</option>
                  {CONSTRUCTION_MATERIALS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="md:w-1/5 min-w-[150px]">
              <select
                value={govFilter}
                onChange={(e) => { setGovFilter(e.target.value); setDistrictFilter(""); }}
                className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#F27D26] outline-none transition-all appearance-none"
              >
                <option value="">كل المحافظات</option>
                {IRAQ_GOVERNORATES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            {govFilter && (
              <div className="md:w-1/5 min-w-[150px]">
                <select
                  value={districtFilter}
                  onChange={(e) => setDistrictFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#F27D26] outline-none transition-all appearance-none"
                >
                  <option value="">كل الأقضية</option>
                  {districtOptions.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {mainTab === 'materials' && (
              <div className="flex items-center min-w-[150px]">
                <label className="flex items-center gap-2 cursor-pointer bg-slate-950 border border-white/10 rounded-xl py-3 px-4 w-full h-full">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${deliveryFilter ? 'bg-[#F27D26] border-[#F27D26]' : 'border-white/20 bg-slate-900'}`}>
                    {deliveryFilter && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <input type="checkbox" className="hidden" checked={deliveryFilter} onChange={e => setDeliveryFilter(e.target.checked)} />
                  <span className="text-sm text-white">تتوفر خدمة توصيل</span>
                </label>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-[#F27D26]" />
            {mainTab === 'services' ? 'مقدمي الخدمات' : 'موردي المواد الإنشائية'} ({filteredProviders.length})
          </h2>
          <button onClick={() => alert("قريباً - الميزة قيد التطوير")} className="text-sm font-bold text-[#F27D26] hover:underline flex items-center gap-1">
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
                <img loading="lazy"
                  src={provider.coverImage}
                  alt="Cover"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-royal-dark to-transparent"></div>
                {provider.isPromoted && (
                  <span className="absolute top-3 right-3 bg-gold-prestige text-slate-900 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                    <Star className="h-3 w-3 fill-slate-900" /> إعلان مميز
                  </span>
                )}
              </div>
              <div className="px-5 pb-5 relative">
                <img loading="lazy"
                  src={provider.logo}
                  alt={provider.name}
                  className="w-16 h-16 rounded-xl border-4 border-royal-dark object-cover absolute -top-8 bg-slate-800"
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
                  
                  {mainTab === 'materials' && provider.hasDelivery && (
                    <div className="mb-3 flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 w-fit px-2 py-1 rounded-md">
                      <CheckCircle className="h-3 w-3" />
                      تتوفر خدمة التوصيل
                    </div>
                  )}

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
                      {mainTab === 'services' ? `${provider.yearsOfExperience} سنوات خبرة` : `${provider.clientCount} عميل`}
                    </span>
                    <button onClick={() => alert("قريباً - الميزة قيد التطوير")} className="text-xs font-bold text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg transition-colors">
                      عرض التفاصيل
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showAppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-slate-950">
              <h3 className="font-bold text-lg text-white">انضم كمزود خدمة معتمد</h3>
              <button onClick={() => setShowAppModal(false)} className="p-1 hover:bg-white/10 rounded-lg text-slate-400">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">الاسم الكامل / اسم الشركة</label>
                <input type="text" value={appForm.name} onChange={e => setAppForm({...appForm, name: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#F27D26] outline-none" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">رقم الهاتف</label>
                <input type="text" value={appForm.phone} onChange={e => setAppForm({...appForm, phone: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#F27D26] outline-none font-mono" dir="ltr" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">الفئة</label>
                <select value={appForm.category} onChange={e => setAppForm({...appForm, category: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#F27D26] outline-none">
                  <option value="">اختر الفئة</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">الموقع (نص حر) *</label>
                <input
                  type="text"
                  value={appForm.locationText}
                  onChange={e => setAppForm({...appForm, locationText: e.target.value})}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#F27D26] outline-none"
                  placeholder="مثال: بغداد - المنصور - حي الجامعة"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">رابط الموقع على الخريطة *</label>
                <input
                  type="text"
                  value={appForm.mapLink}
                  onChange={e => setAppForm({...appForm, mapLink: e.target.value})}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#F27D26] outline-none"
                  dir="ltr"
                  placeholder="https://www.google.com/maps?q=..."
                />
              </div>
              <div className="rounded-xl border border-white/10 p-3 bg-slate-950/40">
                <p className="text-[11px] text-slate-400 mb-2">حدد موقعك على الخريطة لملء المحافظة والقضاء تلقائياً</p>
                <SmartLocationPicker
                  lang={lang as 'ar' | 'en' | 'ku'}
                  onChange={(loc) => {
                    if (!loc) return;
                    setAppForm(prev => ({
                      ...prev,
                      governorate: loc.governorate || prev.governorate,
                      district: loc.district || prev.district,
                      subDistrict: loc.subDistrict || prev.subDistrict,
                      address: loc.address || prev.address,
                      mapLink: loc.googleMapsUrl || prev.mapLink,
                      locationText:
                        prev.locationText ||
                        [loc.governorate, loc.district, loc.subDistrict, loc.neighborhood]
                          .filter(Boolean)
                          .join(' - ')
                    }));
                  }}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">تفاصيل إضافية (الخبرة، الأعمال السابقة)</label>
                <textarea rows={3} value={appForm.details} onChange={e => setAppForm({...appForm, details: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#F27D26] outline-none" />
              </div>
            </div>
            <div className="p-4 border-t border-white/10 bg-slate-950 flex gap-3">
              <button 
                disabled={isSubmitting || !appForm.name || !appForm.phone || !appForm.category || !appForm.locationText || !appForm.mapLink}
                onClick={async () => {
                  setIsSubmitting(true);
                  try {
                    const payload = { ...appForm, status: 'pending', createdAt: new Date().toISOString() };
                    const response = await submitProviderApplication(payload);
                    if (!response?.success) {
                      throw new Error(response?.message || 'Provider application submission failed');
                    }
                    alert('تم تقديم طلبك بنجاح. سيتم التواصل معك قريباً.');
                    setShowAppModal(false);
                    setAppForm({
                      name: '',
                      phone: '',
                      category: '',
                      governorate: '',
                      district: '',
                      subDistrict: '',
                      locationText: '',
                      mapLink: '',
                      address: '',
                      details: ''
                    });
                  } catch (e) {
                    console.error('[ServiceProvidersList] submitProviderApplication failed', {
                      error: e,
                      message: e instanceof Error ? e.message : String(e),
                      payload: appForm,
                    });
                    alert('خطأ في إرسال الطلب');
                  }
                  setIsSubmitting(false);
                }}
                className="flex-1 bg-[#F27D26] hover:bg-[#d96a1a] text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'جاري الإرسال...' : 'إرسال الطلب'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showMaterialsModal && (
        <MaterialsProviderForm onClose={() => setShowMaterialsModal(false)} />
      )}
    </div>
  );
}
