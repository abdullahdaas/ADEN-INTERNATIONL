import React, { Suspense, lazy } from 'react';
import { Property } from '../types';
import { MapPin, ExternalLink, Hash, Loader2 } from 'lucide-react';

const IraqMapDisplayLazy = lazy(() => import('./IraqMapDisplay'));

export function MapDisplay({ property }: { property: Property }) {
  const { coordinates, governorate, district, subDistrict, city, neighborhood, village, street, nearestLandmark, postalCode, address, googleMapsUrl } = property;

  return (
    <div className="space-y-4">
      <div className="h-48 w-full rounded-xl overflow-hidden border border-white/10 relative shadow-inner bg-slate-950 z-0">
        <Suspense fallback={
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#F27D26]" />
            <span>جاري تحميل الخريطة...</span>
          </div>
        }>
          <IraqMapDisplayLazy position={[coordinates.lat, coordinates.lng]} />
        </Suspense>
      </div>
      
      <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5 space-y-3">
        <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
          <MapPin className="h-4 w-4 text-[#F27D26]" />
          العنوان الكامل
        </h4>
        
        <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
          <div>
            <span className="block text-slate-500 mb-1">المحافظة</span>
            <span className="text-white font-medium">{governorate}</span>
          </div>
          <div>
            <span className="block text-slate-500 mb-1">القضاء / الناحية</span>
            <span className="text-white font-medium">{district} {subDistrict ? ` - ${subDistrict}` : ''}</span>
          </div>
          {(city || neighborhood) && (
            <div className="col-span-2">
              <span className="block text-slate-500 mb-1">المدينة / الحي</span>
              <span className="text-white font-medium">{city ? `${city} - ` : ''}{neighborhood}</span>
            </div>
          )}
          {street && (
            <div className="col-span-2">
              <span className="block text-slate-500 mb-1">الشارع</span>
              <span className="text-white font-medium">{street}</span>
            </div>
          )}
          {nearestLandmark && (
            <div className="col-span-2">
              <span className="block text-slate-500 mb-1">أقرب نقطة دالة</span>
              <span className="text-white font-medium">{nearestLandmark}</span>
            </div>
          )}
          {address && (
            <div className="col-span-2">
              <span className="block text-slate-500 mb-1">الوصف الكامل</span>
              <span className="text-white font-medium leading-relaxed">{address}</span>
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Hash className="h-4 w-4" />
            <span>{coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}</span>
          </div>
          <div className="flex justify-end">
            <a 
              href={googleMapsUrl || `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[#F27D26] hover:text-[#ff8a3d] transition-colors text-xs font-bold"
            >
              <ExternalLink className="h-4 w-4" />
              خرائط جوجل
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
