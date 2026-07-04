import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Search, Navigation, Map as MapIcon, Copy, AlertTriangle, MapPin, ExternalLink, Loader2 } from 'lucide-react';
import { IRAQ_LOCATIONS, IRAQ_BOUNDS, isLocationInIraq, IraqLocationData } from '../data/iraqLocations';

export interface LocationData {
  country: string;
  governorate: string;
  district: string;
  subDistrict: string;
  city: string;
  neighborhood: string;
  village: string;
  street: string;
  nearestLandmark: string;
  postalCode: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  googleMapsUrl: string;
}

const DEFAULT_CENTER = { lat: 33.3152, lng: 44.3661 }; // Baghdad

interface SmartLocationPickerProps {
  initialLocation?: Partial<LocationData>;
  onChange: (loc: LocationData | null, isValid: boolean) => void;
  lang?: 'ar' | 'en' | 'ku';
}

const IraqMapLazy = lazy(() => import('./IraqMap'));

export function SmartLocationPicker({ initialLocation, onChange, lang = 'ar' }: SmartLocationPickerProps) {
  const [locData, setLocData] = useState<Partial<LocationData>>(initialLocation || {});
  const [position, setPosition] = useState<{lat: number, lng: number} | null>(initialLocation?.coordinates || null);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  
  // High default zoom if we have a position, otherwise show full Iraq
  const [zoomLevel, setZoomLevel] = useState(initialLocation?.coordinates ? 16 : 6);

  // Administrative Dropdowns state
  const [selectedGov, setSelectedGov] = useState(initialLocation?.governorate || '');
  const [selectedDist, setSelectedDist] = useState(initialLocation?.district || '');
  const [selectedSubDist, setSelectedSubDist] = useState(initialLocation?.subDistrict || '');
  
  const activeGov = IRAQ_LOCATIONS.find((g: IraqLocationData) => g.governorate === selectedGov);
  const activeDist = activeGov?.districts.find(d => d.name === selectedDist);
  
  useEffect(() => {
    // Notify parent whenever locData changes, and validate
    const isValid = !!(locData.coordinates && isLocationInIraq(locData.coordinates.lat, locData.coordinates.lng) && locData.governorate);
    onChange(locData as LocationData, isValid);
  }, [locData, onChange]);

  const reverseGeocode = async (lat: number, lng: number) => {
    setIsLocating(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=ar`);
      const data = await response.json();
      
      if (data && data.address) {
        const addr = data.address;
        const newLoc = {
          country: 'العراق',
          governorate: addr.state || addr.region || selectedGov,
          district: addr.county || selectedDist,
          subDistrict: addr.city_district || addr.suburb || selectedSubDist,
          city: addr.city || addr.town || '',
          neighborhood: addr.neighbourhood || addr.quarter || '',
          village: addr.village || '',
          street: addr.road || '',
          nearestLandmark: addr.amenity || addr.building || '',
          postalCode: addr.postcode || '',
          address: data.display_name,
          coordinates: { lat, lng },
          googleMapsUrl: `https://www.google.com/maps?q=${lat},${lng}`
        };
        
        // Auto-select dropdowns if match found
        if (newLoc.governorate) {
          const govMatch = IRAQ_LOCATIONS.find((g: IraqLocationData) => newLoc.governorate.includes(g.governorate) || g.governorate.includes(newLoc.governorate));
          if (govMatch) setSelectedGov(govMatch.governorate);
        }

        setLocData(newLoc);
      }
    } catch (e) {
      console.error('Reverse geocoding failed', e);
      // Fallback
      setLocData(prev => ({
        ...prev,
        country: 'العراق',
        coordinates: { lat, lng },
        googleMapsUrl: `https://www.google.com/maps?q=${lat},${lng}`
      }));
    } finally {
      setIsLocating(false);
    }
  };

  const handleMapClick = (latlng: {lat: number, lng: number}) => {
    if (!isLocationInIraq(latlng.lat, latlng.lng)) {
      setErrorMsg(lang === 'ar' ? 'هذا الموقع خارج حدود العراق. يرجى اختيار موقع داخل العراق فقط.' : 'Location is outside Iraq territory.');
      return;
    }
    setErrorMsg('');
    setPosition(latlng);
    setZoomLevel(16); // zoom in when selecting
    reverseGeocode(latlng.lat, latlng.lng);
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg(lang === 'ar' ? 'متصفحك لا يدعم تحديد الموقع.' : 'Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        if (!isLocationInIraq(lat, lng)) {
          setErrorMsg(lang === 'ar' ? 'موقعك الحالي خارج العراق.' : 'Your current location is outside Iraq.');
          setIsLocating(false);
          return;
        }
        setErrorMsg('');
        const newPos = { lat, lng };
        setPosition(newPos);
        setZoomLevel(16);
        reverseGeocode(lat, lng);
      },
      (err) => {
        setIsLocating(false);
        setErrorMsg(lang === 'ar' ? 'تعذر الوصول إلى الموقع الجغرافي. يرجى التأكد من السماح بالوصول.' : err.message);
      }
    );
  };

  const handleSearch = async () => {
    if (!searchQuery) return;
    setIsLocating(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ', Iraq')}&limit=1&accept-language=ar`);
      const data = await response.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        if (!isLocationInIraq(lat, lng)) {
          setErrorMsg(lang === 'ar' ? 'نتيجة البحث خارج العراق.' : 'Search result is outside Iraq.');
          return;
        }
        setErrorMsg('');
        setPosition({ lat, lng });
        setZoomLevel(16);
        reverseGeocode(lat, lng);
      } else {
        setErrorMsg(lang === 'ar' ? 'لم يتم العثور على نتائج' : 'No results found');
      }
    } catch (e) {
      console.error('Search failed', e);
    } finally {
      setIsLocating(false);
    }
  };

  const updateLocField = (field: keyof LocationData, value: string) => {
    setLocData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-4 font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Administrative Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-[#0a0a0a] p-4 rounded-xl border border-white/10">
        <div>
          <label className="block text-xs text-slate-400 mb-1">{lang === 'ar' ? 'البلد' : 'Country'}</label>
          <input type="text" value="العراق" disabled className="w-full rounded-lg border border-white/5 bg-slate-900 px-3 py-2 text-sm text-slate-500" />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">{lang === 'ar' ? 'المحافظة' : 'Governorate'}</label>
          <select value={selectedGov} onChange={(e) => {
            setSelectedGov(e.target.value);
            setSelectedDist('');
            setSelectedSubDist('');
            updateLocField('governorate', e.target.value);
          }} className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white">
            <option value="">{lang === 'ar' ? '-- اختر المحافظة --' : '-- Select --'}</option>
            {IRAQ_LOCATIONS.map((g: IraqLocationData) => (
              <option key={g.governorate} value={g.governorate}>{g.governorate}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">{lang === 'ar' ? 'القضاء' : 'District'}</label>
          <select value={selectedDist} onChange={(e) => {
            setSelectedDist(e.target.value);
            setSelectedSubDist('');
            updateLocField('district', e.target.value);
          }} className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white">
            <option value="">{lang === 'ar' ? '-- اختر القضاء --' : '-- Select --'}</option>
            {activeGov?.districts.map(d => (
              <option key={d.name} value={d.name}>{d.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">{lang === 'ar' ? 'الناحية / المنطقة' : 'Sub-district'}</label>
          <select value={selectedSubDist} onChange={(e) => {
            setSelectedSubDist(e.target.value);
            updateLocField('subDistrict', e.target.value);
          }} className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white">
            <option value="">{lang === 'ar' ? '-- اختر الناحية --' : '-- Select --'}</option>
            {activeDist?.subDistricts.map(sd => (
              <option key={sd.name} value={sd.name}>{sd.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Map Section */}
      <div className="relative h-[400px] w-full rounded-xl overflow-hidden border border-white/10 shadow-lg bg-slate-950">
        <div className="absolute top-4 left-4 right-4 z-[400] flex gap-2 max-w-md mx-auto">
          <input 
            type="text" 
            placeholder={lang === 'ar' ? 'ابحث عن مكان في العراق...' : 'Search locations in Iraq...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 rounded-lg border border-white/10 bg-[#0a0a0a]/90 backdrop-blur-md px-4 py-2 text-sm text-white placeholder-slate-400 outline-none focus:border-[#F27D26]"
          />
          <button onClick={handleSearch} disabled={isLocating} className="bg-[#F27D26] text-white px-4 py-2 rounded-lg hover:bg-[#ff8a3d] transition-colors shadow-lg">
            <Search className="h-4 w-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[400] bg-red-500/90 backdrop-blur text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 shadow-lg w-[90%] md:w-auto text-center">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {errorMsg}
          </div>
        )}

        <Suspense fallback={
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#F27D26]" />
            <span>{lang === 'ar' ? 'جاري تحميل الخريطة...' : 'Loading map...'}</span>
          </div>
        }>
          <IraqMapLazy position={position} onMapClick={handleMapClick} defaultZoom={zoomLevel} />
        </Suspense>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={handleGetCurrentLocation} disabled={isLocating} className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg text-sm hover:bg-blue-600/30 transition-colors flex-1 md:flex-none">
          <Navigation className="h-4 w-4" />
          {lang === 'ar' ? 'استخدم موقعي الحالي' : 'Use My Current Location'}
        </button>
        
        {position && (
          <>
            <button type="button" onClick={() => navigator.clipboard.writeText(`${position.lat}, ${position.lng}`)} className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm hover:bg-slate-700 transition-colors flex-1 md:flex-none">
              <Copy className="h-4 w-4" />
              {lang === 'ar' ? 'نسخ الإحداثيات' : 'Copy Coordinates'}
            </button>
            <a href={`https://www.google.com/maps?q=${position.lat},${position.lng}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600/20 text-green-400 rounded-lg text-sm hover:bg-green-600/30 transition-colors flex-1 md:flex-none">
              <MapIcon className="h-4 w-4" />
              {lang === 'ar' ? 'فتح الموقع في خرائط Google' : 'Open in Google Maps'}
            </a>
          </>
        )}
      </div>

      {/* Information Panel */}
      {position && (
        <div className="bg-[#0a0a0a] rounded-xl border border-white/10 p-5 mt-4">
          <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#F27D26]" />
            {lang === 'ar' ? 'معلومات الموقع المحدد' : 'Selected Property Location'}
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] text-slate-500 uppercase mb-1">{lang === 'ar' ? 'المحافظة' : 'Governorate'}</label>
              <input type="text" value={locData.governorate || selectedGov || ''} onChange={(e) => updateLocField('governorate', e.target.value)} className="w-full bg-slate-900 border border-white/5 rounded px-2 py-1.5 text-sm text-white" />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 uppercase mb-1">{lang === 'ar' ? 'القضاء' : 'District'}</label>
              <input type="text" value={locData.district || selectedDist || ''} onChange={(e) => updateLocField('district', e.target.value)} className="w-full bg-slate-900 border border-white/5 rounded px-2 py-1.5 text-sm text-white" />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 uppercase mb-1">{lang === 'ar' ? 'الناحية' : 'Sub-district'}</label>
              <input type="text" value={locData.subDistrict || selectedSubDist || ''} onChange={(e) => updateLocField('subDistrict', e.target.value)} className="w-full bg-slate-900 border border-white/5 rounded px-2 py-1.5 text-sm text-white" />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 uppercase mb-1">{lang === 'ar' ? 'المدينة' : 'City'}</label>
              <input type="text" value={locData.city || ''} onChange={(e) => updateLocField('city', e.target.value)} className="w-full bg-slate-900 border border-white/5 rounded px-2 py-1.5 text-sm text-white" />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 uppercase mb-1">{lang === 'ar' ? 'الحي / المحلة' : 'Neighborhood'}</label>
              <input type="text" value={locData.neighborhood || ''} onChange={(e) => updateLocField('neighborhood', e.target.value)} className="w-full bg-slate-900 border border-white/5 rounded px-2 py-1.5 text-sm text-white" />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 uppercase mb-1">{lang === 'ar' ? 'الشارع' : 'Street'}</label>
              <input type="text" value={locData.street || ''} onChange={(e) => updateLocField('street', e.target.value)} className="w-full bg-slate-900 border border-white/5 rounded px-2 py-1.5 text-sm text-white" />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 uppercase mb-1">{lang === 'ar' ? 'خط العرض' : 'Latitude'}</label>
              <input type="text" value={position.lat.toFixed(6)} disabled className="w-full bg-slate-900/50 border border-white/5 rounded px-2 py-1.5 text-sm text-slate-400" />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 uppercase mb-1">{lang === 'ar' ? 'خط الطول' : 'Longitude'}</label>
              <input type="text" value={position.lng.toFixed(6)} disabled className="w-full bg-slate-900/50 border border-white/5 rounded px-2 py-1.5 text-sm text-slate-400" />
            </div>
            <div className="col-span-2 md:col-span-4">
              <label className="block text-[10px] text-slate-500 uppercase mb-1">{lang === 'ar' ? 'العنوان الكامل' : 'Full Address'}</label>
              <input type="text" value={locData.address || ''} onChange={(e) => updateLocField('address', e.target.value)} className="w-full bg-slate-900 border border-white/5 rounded px-2 py-1.5 text-sm text-white" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
