import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, SlidersHorizontal, MapPin, Building, Banknote } from 'lucide-react';
import { IRAQ_GOVERNORATES, getDistrictsByGovernorate } from '../data/iraqLocations';

interface HeroSearchProps {
  onSearch: (filters: Record<string, any>) => void;
  initialFilters?: Record<string, any>;
}

export const PRICE_PRESETS = [
  { label: '50 مليون د.ع', value: 50000000 },
  { label: '100 مليون د.ع', value: 100000000 },
  { label: '150 مليون د.ع', value: 150000000 },
  { label: '200 مليون د.ع', value: 200000000 },
  { label: '250 مليون د.ع', value: 250000000 },
  { label: '300 مليون د.ع', value: 300000000 },
  { label: '400 مليون د.ع', value: 400000000 },
  { label: '500 مليون د.ع', value: 500000000 },
  { label: '750 مليون د.ع', value: 750000000 },
  { label: '1 مليار د.ع', value: 1000000000 },
  { label: '2 مليار د.ع', value: 2000000000 },
  { label: 'أكثر من 2 مليار', value: 9999999999 }
];

export default function HeroSearch({ onSearch, initialFilters = {} }: HeroSearchProps) {
  // Status tab ('للبيع' or 'للإيجار')
  const [status, setStatus] = useState<'للبيع' | 'للإيجار'>(
    initialFilters.status === 'للإيجار' ? 'للإيجار' : 'للبيع'
  );

  // Search input
  const [searchQuery, setSearchQuery] = useState(initialFilters.searchQuery || '');

  // Geographic state
  const [governorate, setGovernorate] = useState(initialFilters.governorate || '');
  const [district, setDistrict] = useState(initialFilters.district || '');
  const [subDistrict, setSubDistrict] = useState(initialFilters.subDistrict || '');
  const [neighborhood, setNeighborhood] = useState(initialFilters.neighborhood || '');

  // Available options
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);

  // Prices
  const [minPrice, setMinPrice] = useState(initialFilters.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(initialFilters.maxPrice || '');
  const [customMinPrice, setCustomMinPrice] = useState('');
  const [customMaxPrice, setCustomMaxPrice] = useState('');

  // Specs
  const [buildingType, setBuildingType] = useState(initialFilters.buildingType || '');
  const [bedrooms, setBedrooms] = useState(initialFilters.bedrooms || '');
  const [bathrooms, setBathrooms] = useState(initialFilters.bathrooms || '');
  const [isFurnished, setIsFurnished] = useState(initialFilters.isFurnished || false);

  // Extras collapsing
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [hasGarage, setHasGarage] = useState(initialFilters.hasGarage || false);
  const [hasGarden, setHasGarden] = useState(initialFilters.hasGarden || false);
  const [hasElevator, setHasElevator] = useState(initialFilters.hasElevator || false);
  const [hasGenerator, setHasGenerator] = useState(initialFilters.hasGenerator || false);
  const [hasSolarPower, setHasSolarPower] = useState(initialFilters.hasSolarPower || false);
  const [hasPool, setHasPool] = useState(initialFilters.hasPool || false);

  // Update lists when Governorate changes
  useEffect(() => {
    if (governorate) {
      setAvailableDistricts(getDistrictsByGovernorate(governorate));
      // Reset dependent selections
      if (!initialFilters.district) {
        setDistrict('');
        setSubDistrict('');
        setNeighborhood('');
      }
    } else {
      setAvailableDistricts([]);
      setDistrict('');
      setSubDistrict('');
      setNeighborhood('');
    }
  }, [governorate]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const finalFilters: Record<string, any> = {
      status,
      searchQuery,
      governorate,
      district,
      subDistrict,
      neighborhood,
      minPrice: customMinPrice ? Number(customMinPrice) : (minPrice ? Number(minPrice) : undefined),
      maxPrice: customMaxPrice ? Number(customMaxPrice) : (maxPrice ? Number(maxPrice) : undefined),
      buildingType,
      bedrooms: bedrooms ? Number(bedrooms) : undefined,
      bathrooms: bathrooms ? Number(bathrooms) : undefined,
      isFurnished: isFurnished || undefined,
      hasGarage: hasGarage || undefined,
      hasGarden: hasGarden || undefined,
      hasElevator: hasElevator || undefined,
      hasGenerator: hasGenerator || undefined,
      hasSolarPower: hasSolarPower || undefined,
      hasPool: hasPool || undefined,
    };

    onSearch(finalFilters);
  };

  const handleClear = () => {
    setSearchQuery('');
    setGovernorate('');
    setDistrict('');
    setSubDistrict('');
    setNeighborhood('');
    setMinPrice('');
    setMaxPrice('');
    setCustomMinPrice('');
    setCustomMaxPrice('');
    setBuildingType('');
    setBedrooms('');
    setBathrooms('');
    setIsFurnished(false);
    setHasGarage(false);
    setHasGarden(false);
    setHasElevator(false);
    setHasGenerator(false);
    setHasSolarPower(false);
    setHasPool(false);
    onSearch({ status });
  };

  return (
    <div id="search-container" className="w-full rounded-2xl border border-white/5 bg-slate-900/40 backdrop-blur-md p-6 shadow-2xl shadow-black/50">
      
      {/* Search Type Tabs */}
      <div className="flex flex-wrap gap-3 border-b border-white/10 pb-4 mb-5">
        <button
          id="tab-search-sale"
          type="button"
          onClick={() => setStatus('للبيع')}
          className={`px-6 py-2.5 rounded-lg text-sm font-bold tracking-wide transition-all ${
            status === 'للبيع' 
              ? 'bg-gold-prestige text-white shadow-lg shadow-gold-prestige/20' 
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          عقارات للبيع
        </button>
        <button
          id="tab-search-rent"
          type="button"
          onClick={() => setStatus('للإيجار')}
          className={`px-6 py-2.5 rounded-lg text-sm font-bold tracking-wide transition-all ${
            status === 'للإيجار' 
              ? 'bg-gold-prestige text-white shadow-lg shadow-gold-prestige/20' 
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          عقارات للإيجار
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Core Quick Row */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4 lg:grid-cols-5">
          
          {/* Keyword Search */}
          <div className="relative">
            <label className="block text-sm font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
              <span>البحث بكلمة مفتاحية</span>
            </label>
            <div className="relative">
              <Search className="absolute right-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-500" />
              <input
                id="search-input-query"
                type="text"
                placeholder="ابحث عن منطقة، فيلا، شارع..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-white/5 bg-slate-950 px-4 py-3 pr-11 text-base text-white placeholder-slate-500 transition-all focus:border-gold-prestige/40 focus:ring-1 focus:ring-gold-prestige/30 outline-none"
              />
            </div>
          </div>

          {/* Building Type */}
          <div>
            <label className="block text-sm font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
              <Building className="h-3.5 w-3.5 text-gold-prestige" />
              <span>نوع العقار</span>
            </label>
            <select
              id="select-building-type"
              value={buildingType}
              onChange={(e) => setBuildingType(e.target.value)}
              className="w-full rounded-xl border border-white/5 bg-slate-950 px-4 py-3 text-base text-white transition-all focus:border-gold-prestige/40 outline-none cursor-pointer appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>")`, backgroundPosition: 'left 12px center', backgroundRepeat: 'no-repeat', backgroundSize: '16px' }}
            >
              <option value="">كل أنواع العقارات</option>
              <option value="منزل">منزل سكني</option>
              <option value="شقة">شقة سكنية</option>
              <option value="فيلا">فيلا فاخرة</option>
              <option value="أرض">أرض سكنية / زراعية</option>
              <option value="مجمع تجاري">مجمع أو محل تجاري</option>
            </select>
          </div>

          {/* Governorate (المحافظة) */}
          <div>
            <label className="block text-sm font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-gold-prestige" />
              <span>المحافظة</span>
            </label>
            <select
              id="select-governorate"
              value={governorate}
              onChange={(e) => setGovernorate(e.target.value)}
              className="w-full rounded-xl border border-white/5 bg-slate-950 px-4 py-3 text-base text-white transition-all focus:border-gold-prestige/40 outline-none cursor-pointer appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>")`, backgroundPosition: 'left 12px center', backgroundRepeat: 'no-repeat', backgroundSize: '16px' }}
            >
              <option value="">كل المحافظات</option>
              {IRAQ_GOVERNORATES?.map((gov) => (
                <option key={gov} value={gov}>{gov}</option>
              ))}
            </select>
          </div>

          {/* District (القضاء) */}
          <div>
            <label className="block text-sm font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-gold-prestige" />
              <span>القضاء</span>
            </label>
            <select
              id="select-district"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              disabled={!governorate}
              className="w-full rounded-xl border border-white/5 bg-slate-950 px-4 py-3 text-base text-white transition-all focus:border-gold-prestige/40 outline-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>")`, backgroundPosition: 'left 12px center', backgroundRepeat: 'no-repeat', backgroundSize: '16px' }}
            >
              <option value="">اختر القضاء</option>
              {availableDistricts?.map((dist) => (
                <option key={dist} value={dist}>{dist}</option>
              ))}
            </select>
          </div>

          {/* Action Button Grid Cell */}
          <div className="flex items-end gap-2 md:col-span-4 lg:col-span-1">
            <button
              id="btn-search-submit"
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gold-prestige px-4 py-3 text-base font-bold text-white transition-all hover:bg-gold-accent hover:shadow-lg hover:shadow-gold-prestige/20 cursor-pointer"
            >
              <Search className="h-4.5 w-4.5" />
              <span>ابحث الآن</span>
            </button>
            <button
              id="btn-search-clear"
              type="button"
              onClick={handleClear}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              title="إعادة تعيين"
            >
              ×
            </button>
          </div>

        </div>

        {/* Sub-district & Neighborhood Row (Visible if Governorate selected) */}
        {governorate && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 border-t border-white/5 pt-4 animate-fade-in">
            {/* Sub-District (الناحية) */}
            <div>
              <label className="block text-sm font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-slate-500" />
                <span>الناحية</span>
              </label>
              <input
                id="select-subdistrict"
                type="text"
                value={subDistrict}
                onChange={(e) => setSubDistrict(e.target.value)}
                disabled={!district}
                placeholder="اكتب اسم الناحية"
                className="w-full rounded-xl border border-white/5 bg-slate-950 px-4 py-3 text-base text-white transition-all focus:border-gold-prestige/40 outline-none disabled:opacity-40"
              />
            </div>

            {/* Neighborhood (الحي) */}
            <div>
              <label className="block text-sm font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-slate-500" />
                <span>الحي</span>
              </label>
              <input
                id="select-neighborhood"
                type="text"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                disabled={!subDistrict}
                placeholder="اكتب اسم الحي"
                className="w-full rounded-xl border border-white/5 bg-slate-950 px-4 py-3 text-base text-white transition-all focus:border-gold-prestige/40 outline-none disabled:opacity-40"
              />
            </div>
          </div>
        )}

        {/* Pricing & Advanced Toggle Button */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-white/5">
          
          <button
            id="toggle-advanced-filters"
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex flex-wrap items-center gap-2 text-sm font-semibold text-gold-prestige hover:text-gold-accent transition-all"
          >
            <SlidersHorizontal className="h-4.5 w-4.5" />
            <span>فلترة أسعار ومواصفات متقدمة</span>
            <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${showAdvanced ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Expandable Advanced Filters Box */}
        {showAdvanced && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 p-5 rounded-xl bg-slate-950/70 border border-white/5 animate-slide-down">
            
            {/* Min Price Preset & Custom */}
            <div>
              <label className="block text-sm font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
                <Banknote className="h-3.5 w-3.5 text-gold-prestige" />
                <span>الحد الأدنى للسعر</span>
              </label>
              <div className="space-y-2">
                <select
                  id="select-min-price"
                  value={minPrice}
                  onChange={(e) => { setMinPrice(e.target.value); setCustomMinPrice(''); }}
                  className="w-full rounded-lg border border-white/5 bg-slate-950 px-3 py-2 text-sm text-white outline-none cursor-pointer"
                >
                  <option value="">اختر حد أدنى جاهز</option>
                  {PRICE_PRESETS?.map(p => (
                    <option key={`min-${p.value}`} value={p.value}>{p.label}</option>
                  ))}
                </select>
                <input
                  id="input-custom-min-price"
                  type="number"
                  placeholder="أو اكتب السعر بالدينار..."
                  value={customMinPrice}
                  onChange={(e) => { setCustomMinPrice(e.target.value); setMinPrice(''); }}
                  className="w-full rounded-lg border border-white/5 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-600 outline-none"
                />
              </div>
            </div>

            {/* Max Price Preset & Custom */}
            <div>
              <label className="block text-sm font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
                <Banknote className="h-3.5 w-3.5 text-gold-prestige" />
                <span>الحد الأعلى للسعر</span>
              </label>
              <div className="space-y-2">
                <select
                  id="select-max-price"
                  value={maxPrice}
                  onChange={(e) => { setMaxPrice(e.target.value); setCustomMaxPrice(''); }}
                  className="w-full rounded-lg border border-white/5 bg-slate-950 px-3 py-2 text-sm text-white outline-none cursor-pointer"
                >
                  <option value="">اختر حد أعلى جاهز</option>
                  {PRICE_PRESETS?.map(p => (
                    <option key={`max-${p.value}`} value={p.value}>{p.label}</option>
                  ))}
                </select>
                <input
                  id="input-custom-max-price"
                  type="number"
                  placeholder="أو اكتب السعر بالدينار..."
                  value={customMaxPrice}
                  onChange={(e) => { setCustomMaxPrice(e.target.value); setMaxPrice(''); }}
                  className="w-full rounded-lg border border-white/5 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-600 outline-none"
                />
              </div>
            </div>

            {/* Bedrooms and Bathrooms */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-1.5">
                  الغرف
                </label>
                <select
                  id="select-bedrooms"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="w-full rounded-lg border border-white/5 bg-slate-950 px-2 py-2 text-sm text-white outline-none"
                >
                  <option value="">الكل</option>
                  <option value="1">+1 غرف</option>
                  <option value="2">+2 غرف</option>
                  <option value="3">+3 غرف</option>
                  <option value="4">+4 غرف</option>
                  <option value="5">+5 غرف</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-1.5">
                  الحمامات
                </label>
                <select
                  id="select-bathrooms"
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                  className="w-full rounded-lg border border-white/5 bg-slate-950 px-2 py-2 text-sm text-white outline-none"
                >
                  <option value="">الكل</option>
                  <option value="1">+1</option>
                  <option value="2">+2</option>
                  <option value="3">+3</option>
                  <option value="4">+4</option>
                </select>
              </div>
            </div>

            {/* Extra Amenities (Checkboxes) */}
            <div className="space-y-2 flex flex-col justify-center">
              <label className="block text-sm font-semibold text-slate-400">
                مرافق وخدمات إضافية
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-1.5 text-sm text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFurnished}
                    onChange={(e) => setIsFurnished(e.target.checked)}
                    className="accent-gold-prestige h-3.5 w-3.5"
                  />
                  <span>مفروش</span>
                </label>
                <label className="flex items-center gap-1.5 text-sm text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasGarage}
                    onChange={(e) => setHasGarage(e.target.checked)}
                    className="accent-gold-prestige h-3.5 w-3.5"
                  />
                  <span>كراج</span>
                </label>
                <label className="flex items-center gap-1.5 text-sm text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasGarden}
                    onChange={(e) => setHasGarden(e.target.checked)}
                    className="accent-gold-prestige h-3.5 w-3.5"
                  />
                  <span>حديقة</span>
                </label>
                <label className="flex items-center gap-1.5 text-sm text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasGenerator}
                    onChange={(e) => setHasGenerator(e.target.checked)}
                    className="accent-gold-prestige h-3.5 w-3.5"
                  />
                  <span>مولدة ذهبية</span>
                </label>
                <label className="flex items-center gap-1.5 text-sm text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasSolarPower}
                    onChange={(e) => setHasSolarPower(e.target.checked)}
                    className="accent-gold-prestige h-3.5 w-3.5"
                  />
                  <span>طاقة شمسية</span>
                </label>
                <label className="flex items-center gap-1.5 text-sm text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasPool}
                    onChange={(e) => setHasPool(e.target.checked)}
                    className="accent-gold-prestige h-3.5 w-3.5"
                  />
                  <span>مسبح</span>
                </label>
              </div>
            </div>

          </div>
        )}
      </form>
    </div>
  );
}
