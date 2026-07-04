import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import { Property } from '../types';
import { IRAQ_BOUNDS } from '../data/iraqLocations';
import { updateProperty } from '../utils/api';
import { formatPrice } from './PropertyCard';
import { Save, AlertCircle, MapPin } from 'lucide-react';
import { SmartLocationPicker } from './SmartLocationPicker';

// Fix leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Icon for properties
const createCustomIcon = (isApproved: boolean, isSelected: boolean) => {
  const color = !isApproved ? '#ef4444' : '#F27D26';
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

interface AdminMapEditorProps {
  properties: Property[];
  onRefresh: () => void;
}

const { BaseLayer } = LayersControl;

export function AdminMapEditor({ properties, onRefresh }: AdminMapEditorProps) {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newLocation, setNewLocation] = useState<any>(null);
  const [isLocationValid, setIsLocationValid] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveLocation = async () => {
    if (!selectedProperty || !newLocation) return;
    setIsSaving(true);
    try {
      if (!isLocationValid) {
      alert('يرجى تحديد موقع صحيح داخل العراق.');
      return;
    }
    await updateProperty(selectedProperty.id, { ...newLocation });
      alert('تم تحديث موقع العقار بنجاح!');
      setIsEditing(false);
      setSelectedProperty(null);
      setNewLocation(null);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء تحديث الموقع.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/5 bg-slate-900/10 backdrop-blur-md p-6">
        <h2 className="text-base font-bold text-white mb-1">الخريطة التفاعلية لإدارة العقارات</h2>
        <p className="text-xs text-slate-400 font-sans">
          يمكنك عرض كافة العقارات المنشورة على الخريطة، وتعديل إحداثيات أي عقار بشكل دقيق.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 z-0">
        <div className="w-full md:w-1/3 flex flex-col gap-4 relative z-10">
          {selectedProperty ? (
            <div className="rounded-2xl border border-gold-prestige/30 bg-slate-900/40 p-4 space-y-4 shadow-xl">
              <h3 className="font-bold text-white text-sm border-b border-white/10 pb-2">تفاصيل العقار المحدد</h3>
              <div className="text-xs space-y-2">
                <div><span className="text-slate-400">العنوان:</span> <span className="font-bold text-white">{selectedProperty.title}</span></div>
                <div><span className="text-slate-400">الموقع الحالي:</span> <span className="text-white font-mono">{selectedProperty.coordinates.lat.toFixed(4)}, {selectedProperty.coordinates.lng.toFixed(4)}</span></div>
                <div><span className="text-slate-400">المنطقة:</span> <span className="text-white">{selectedProperty.governorate} - {selectedProperty.district}</span></div>
              </div>

              {!isEditing ? (
                <button 
                  onClick={() => {
                    setIsEditing(true);
                    setNewLocation(selectedProperty.coordinates);
                  }}
                  className="w-full py-2 bg-white/10 text-white rounded-lg text-xs font-bold hover:bg-white/20 transition-all border border-white/20"
                >
                  تعديل وتصحيح الموقع الجغرافي
                </button>
              ) : (
                <div className="space-y-4 pt-2 border-t border-white/10">
                  <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-xs flex gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>قم بتحريك الخريطة أو البحث لتحديد الموقع الصحيح الجديد.</span>
                  </div>
                  
                  <div className="rounded-lg overflow-hidden border border-white/20">
                    <SmartLocationPicker 
                         initialLocation={selectedProperty}
                        onChange={(loc, isValid) => { setNewLocation(loc); setIsLocationValid(isValid); }}
                      />
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={handleSaveLocation}
                      disabled={isSaving}
                      className="flex-1 py-2 bg-emerald-600 text-[#ffffff] rounded-lg text-xs font-bold hover:bg-emerald-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {isSaving ? 'جاري الحفظ...' : 'حفظ الموقع'}
                    </button>
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-white/10 text-white rounded-lg text-xs hover:bg-white/20 transition-all"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/5 bg-slate-900/10 p-6 flex flex-col items-center justify-center text-center text-slate-500 min-h-[200px]">
              <MapPin className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-xs">اضغط على أي مؤشر في الخريطة لعرض تفاصيله وتعديل موقعه.</p>
            </div>
          )}
        </div>

        <div className="w-full md:w-2/3 h-[600px] rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-slate-950 relative z-0">
          <MapContainer
            center={[33.3152, 44.3661]} // Baghdad default
            zoom={6}
            style={{ height: '100%', width: '100%', zIndex: 1 }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            {properties?.map((p) => (
              <Marker 
                key={p.id} 
                position={[p.coordinates.lat, p.coordinates.lng]}
                icon={createCustomIcon(p.isApproved, selectedProperty?.id === p.id)}
                eventHandlers={{
                  click: () => {
                    setSelectedProperty(p);
                    setIsEditing(false);
                  }
                }}
              >
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
