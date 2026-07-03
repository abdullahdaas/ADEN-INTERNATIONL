import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Property } from '../types';
import { formatPrice } from './PropertyCard';
import { IRAQ_LOCATIONS } from '../data/iraqLocations';
import { Search, Navigation } from 'lucide-react';

// Fix leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Icon for properties
const createCustomIcon = (status: string, isSelected: boolean) => {
  const color = status === 'للإيجار' ? '#3b82f6' : '#F27D26';
  const size = isSelected ? 36 : 24;
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        background-color: ${color};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        transition: all 0.2s ease;
      "></div>
    `,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
    popupAnchor: [0, -size/2]
  });
};

interface MapSearchProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
}

export default function MapSearch({ properties, onSelectProperty }: MapSearchProps) {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [govFilter, setGovFilter] = useState('');

  const filteredProperties = useMemo(() => {
    return properties.filter(p => {
      if (!p.isApproved) return false;
      if (statusFilter && p.status !== statusFilter) return false;
      if (typeFilter && p.buildingType !== typeFilter) return false;
      if (govFilter && p.governorate !== govFilter) return false;
      return true;
    });
  }, [properties, statusFilter, typeFilter, govFilter]);

  return (
    <div className="h-[80vh] w-full rounded-2xl overflow-hidden border border-white/10 relative flex flex-col md:flex-row bg-slate-950 z-0">
      
      {/* Sidebar Filters */}
      <div className="w-full md:w-64 bg-slate-900/90 backdrop-blur-md p-4 border-b md:border-b-0 md:border-l border-white/10 flex flex-col gap-4 z-10 relative">
        <h3 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
          <Search className="h-4 w-4 text-[#F27D26]" />
          تصفية العقارات
        </h3>
        
        <div>
          <label className="block text-xs text-slate-400 mb-1">المحافظة</label>
          <select
            value={govFilter}
            onChange={(e) => setGovFilter(e.target.value)}
            className="w-full rounded-lg border border-white/5 bg-slate-950 px-2 py-1.5 text-xs text-white outline-none"
          >
            <option value="">الكل</option>
            {IRAQ_LOCATIONS?.map((g) => (
              <option key={g.governorate} value={g.governorate}>{g.governorate}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">نوع الإعلان</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-lg border border-white/5 bg-slate-950 px-2 py-1.5 text-xs text-white outline-none"
          >
            <option value="">الكل</option>
            <option value="للبيع">للبيع</option>
            <option value="للإيجار">للإيجار</option>
            <option value="مميز">مميز</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">نوع العقار</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full rounded-lg border border-white/5 bg-slate-950 px-2 py-1.5 text-xs text-white outline-none"
          >
            <option value="">الكل</option>
            <option value="منزل">منزل</option>
            <option value="شقة">شقة</option>
            <option value="فيلا">فيلا</option>
            <option value="أرض">أرض</option>
            <option value="مجمع تجاري">مجمع تجاري</option>
          </select>
        </div>
        
        <div className="mt-auto pt-4 border-t border-white/10 text-xs text-slate-400">
          تم العثور على <span className="font-bold text-white">{filteredProperties.length}</span> عقار
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative h-full">
        <MapContainer
          center={[33.3152, 44.3661]} // Baghdad default
          zoom={6}
          style={{ height: '100%', width: '100%', zIndex: 1 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          {filteredProperties?.map((p) => (
            <Marker 
              key={p.id} 
              position={[p.coordinates.lat, p.coordinates.lng]}
              icon={createCustomIcon(p.status, selectedProperty?.id === p.id)}
              eventHandlers={{
                click: () => setSelectedProperty(p)
              }}
            >
              <Popup>
                <div className="w-48 p-0 flex flex-col gap-2 rounded text-right" dir="rtl">
                  <div className="font-bold text-slate-900 text-xs border-b pb-1 mb-1">{p.title}</div>
                  <img src={p.images?.[0]} referrerPolicy="no-referrer" alt="" className="w-full h-24 object-cover rounded" />
                  <div className="font-bold text-[#F27D26] text-sm mt-1">
                    {formatPrice(p.price, p.status)}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {p.space} م² • {p.buildingType}
                  </div>
                  <button 
                    onClick={() => onSelectProperty(p)}
                    className="mt-1 w-full bg-[#F27D26] text-white py-1.5 rounded text-xs font-bold hover:bg-[#ff8a3d]"
                  >
                    عرض التفاصيل
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
