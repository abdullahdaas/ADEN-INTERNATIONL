import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, Circle, Tooltip } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';

import L from 'leaflet';
import { Property } from '../types';
import { IRAQ_BOUNDS } from '../data/iraqLocations';
import { formatPrice } from './PropertyCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Layers, MapPin, Database, TrendingUp, BarChart3, Plus, Trash2, Edit2, Check, Download, Upload, AlertCircle, Settings2 } from 'lucide-react';

const { BaseLayer, Overlay } = LayersControl;

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

const createClusterCustomIcon = function (cluster: any) {
  return L.divIcon({
    html: `<div class="w-10 h-10 bg-[#F27D26] text-white rounded-full flex items-center justify-center font-bold border-2 border-white shadow-lg text-sm">${cluster.getChildCount()}</div>`,
    className: 'custom-marker-cluster',
    iconSize: L.point(40, 40, true),
  });
};

interface AdminGISPanelProps {
  properties: Property[];
  onRefresh: () => void;
}

export function AdminGISPanel({ properties, onRefresh }: AdminGISPanelProps) {
  const [activeTab, setActiveTab] = useState<'map'|'data'|'analytics'|'heatmap'>('map');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // HEATMAP DATA (Aggregated by Governorate)
  const heatmapData = useMemo(() => {
    const counts: Record<string, { count: number, totalValue: number, lat: number, lng: number }> = {};
    properties.forEach(p => {
      const gov = p.governorate || 'Unknown';
      if (!counts[gov]) {
        counts[gov] = { count: 0, totalValue: 0, lat: p.coordinates.lat, lng: p.coordinates.lng };
      }
      counts[gov].count++;
      counts[gov].totalValue += p.price;
    });
    return Object.entries(counts).map(([gov, data]) => ({
      gov,
      count: data.count,
      avgPrice: data.totalValue / (data.count || 1),
      lat: data.lat,
      lng: data.lng
    }));
  }, [properties]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="rounded-2xl border border-white/5 bg-slate-900/10 backdrop-blur-md p-6">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <Layers className="h-6 w-6 text-[#F27D26]" />
          منصة GIS العقارية المتكاملة (Aden GIS)
        </h2>
        <p className="text-sm text-slate-400 font-sans">
          إدارة الخرائط الذكية، تعديل المواقع الجغرافية، التحليلات المكانية، الخرائط الحرارية، والتحكم الشامل بالقاعدة الجغرافية للعراق.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'map', label: 'الخريطة التفاعلية', icon: MapPin },
          { id: 'heatmap', label: 'الخرائط الحرارية', icon: TrendingUp },
          { id: 'analytics', label: 'التحليلات الجغرافية', icon: BarChart3 },
          { id: 'data', label: 'قاعدة البيانات الجغرافية', icon: Database }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab.id 
                ? 'bg-[#F27D26] text-white shadow-lg' 
                : 'bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Map Tab */}
      {activeTab === 'map' && (
        <div className="h-[700px] w-full rounded-2xl overflow-hidden border border-white/10 relative shadow-xl bg-slate-950 z-0">
          <MapContainer
            center={[33.3152, 44.3661]}
            zoom={6}
            minZoom={5}
            maxBounds={[[IRAQ_BOUNDS.south, IRAQ_BOUNDS.west], [IRAQ_BOUNDS.north, IRAQ_BOUNDS.east]]}
            style={{ height: '100%', width: '100%', zIndex: 1 }}
          >
            <LayersControl position="topright">
              <BaseLayer checked name="CartoDB Positron (الافتراضية)">
                <TileLayer
                  attribution='&copy; OpenStreetMap &copy; CartoDB'
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />
              </BaseLayer>
              <BaseLayer name="Esri World Imagery (قمر صناعي)">
                <TileLayer
                  attribution='&copy; Esri'
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />
              </BaseLayer>
              <BaseLayer name="OpenTopoMap (تضاريس)">
                <TileLayer
                  attribution='&copy; OpenTopoMap'
                  url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                />
              </BaseLayer>

              {/* Clustering Overlay */}
              <Overlay checked name="العقارات (تجميع)">
                
                  <MarkerClusterGroup
                  chunkedLoading
                  iconCreateFunction={createClusterCustomIcon}
                  maxClusterRadius={50}
                  spiderfyOnMaxZoom={true}
                >
                  {properties.map(p => (
                    <Marker 
                      key={p.id} 
                      position={[p.coordinates.lat, p.coordinates.lng]}
                      icon={createCustomIcon(p.status, selectedProperty?.id === p.id)}
                      eventHandlers={{ click: () => setSelectedProperty(p) }}
                    >
                      <Popup>
                        <div className="w-48 p-0 flex flex-col gap-2 rounded text-right font-sans" dir="rtl">
                          <div className="font-bold text-slate-900 text-xs border-b pb-1 mb-1">{p.title}</div>
                          {p.images?.[0] && <img src={p.images[0]} referrerPolicy="no-referrer" alt="" className="w-full h-24 object-cover rounded" />}
                          <div className="font-bold text-[#F27D26] text-sm mt-1">{formatPrice(p.price, p.status)}</div>
                          <div className="text-[10px] text-slate-500">{p.space} م² • {p.buildingType}</div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                
              </MarkerClusterGroup>
              </Overlay>
            </LayersControl>
          </MapContainer>

          {/* Quick Actions Panel */}
          {selectedProperty && (
            <div className="absolute bottom-6 right-6 z-[400] w-80 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl p-4 animate-fade-in font-sans">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-bold text-white">{selectedProperty.title}</h3>
                <button onClick={() => setSelectedProperty(null)} className="text-slate-400 hover:text-white">&times;</button>
              </div>
              <p className="text-xs text-slate-400 mb-4">{selectedProperty.governorate} - {selectedProperty.district}</p>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button className="bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white py-2 rounded-lg flex items-center justify-center gap-1 transition-colors">
                  <Check className="h-3 w-3" /> اعتماد الموقع
                </button>
                <button className="bg-amber-600/20 text-amber-400 hover:bg-amber-600 hover:text-white py-2 rounded-lg flex items-center justify-center gap-1 transition-colors">
                  <Edit2 className="h-3 w-3" /> تعديل يدوي
                </button>
                <button className="col-span-2 bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white py-2 rounded-lg flex items-center justify-center gap-1 transition-colors">
                  <Trash2 className="h-3 w-3" /> رفض الإحداثيات
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Heatmap Tab */}
      {activeTab === 'heatmap' && (
        <div className="h-[700px] w-full rounded-2xl overflow-hidden border border-white/10 relative shadow-xl bg-slate-950 z-0">
          <MapContainer
            center={[33.3152, 44.3661]}
            zoom={6}
            minZoom={5}
            maxBounds={[[IRAQ_BOUNDS.south, IRAQ_BOUNDS.west], [IRAQ_BOUNDS.north, IRAQ_BOUNDS.east]]}
            style={{ height: '100%', width: '100%', zIndex: 1 }}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            {heatmapData.map((data, i) => (
              <Circle
                key={i}
                center={[data.lat, data.lng]}
                radius={data.count * 5000} // Dynamic radius based on density
                pathOptions={{
                  fillColor: '#F27D26',
                  fillOpacity: 0.4 + (Math.min(data.count, 100) / 100) * 0.4,
                  color: 'transparent'
                }}
              >
                <Tooltip direction="top" opacity={1} permanent={false}>
                  <div className="text-right font-sans" dir="rtl">
                    <div className="font-bold text-slate-800">{data.gov}</div>
                    <div className="text-xs text-slate-500">عدد العقارات: <span className="font-bold text-[#F27D26]">{data.count}</span></div>
                    <div className="text-xs text-slate-500">متوسط السعر: <span className="font-bold text-emerald-600">{formatPrice(data.avgPrice, 'للبيع')}</span></div>
                  </div>
                </Tooltip>
              </Circle>
            ))}
          </MapContainer>
          <div className="absolute top-4 left-4 z-[400] bg-slate-900/90 backdrop-blur-md rounded-xl border border-white/10 p-4 font-sans text-right" dir="rtl">
            <h4 className="text-xs font-bold text-white mb-2">مفتاح الخريطة الحرارية</h4>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <div className="w-4 h-4 rounded-full bg-[#F27D26] opacity-40"></div>
              <span>كثافة منخفضة</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300 mt-1">
              <div className="w-4 h-4 rounded-full bg-[#F27D26] opacity-80"></div>
              <span>كثافة عالية (طلب عالي)</span>
            </div>
            <div className="mt-3 text-[10px] text-slate-500">
              * يعتمد حجم الدائرة على حجم العرض
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
          <div className="bg-slate-900/50 border border-white/5 p-6 rounded-2xl col-span-1 md:col-span-2 lg:col-span-3 h-80">
            <h3 className="text-slate-400 text-xs mb-4">توزيع أنواع العقارات</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={heatmapData}>
                <XAxis dataKey="gov" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', color: '#fff'}} />
                <Bar dataKey="count" fill="#F27D26" radius={[4, 4, 0, 0]} name="عدد العقارات" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Database Tab */}
      {activeTab === 'data' && (
        <div className="space-y-6 font-sans">
          <div className="flex gap-4">
            <button className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2">
              <Download className="w-4 h-4" /> تصدير GIS (GeoJSON)
            </button>
            <button className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2">
              <Upload className="w-4 h-4" /> استيراد GIS (GeoJSON)
            </button>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3 text-amber-400">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div className="text-xs leading-relaxed">
              <strong>تنبيه الإدارة:</strong> يتم تخزين جميع البيانات المكانية (محافظات، أقضية، نواحي) في مجموعات مستقلة لضمان التحديث الديناميكي بدون تعديل الكود المصدري.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gov List */}
            <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-white/10 flex justify-between items-center bg-slate-900">
                <h3 className="text-sm font-bold text-white">إدارة المحافظات والأقضية</h3>
                <button className="text-[#F27D26] hover:text-[#ff8a3d] text-xs flex items-center gap-1 font-bold">
                  <Plus className="w-3 h-3" /> إضافة جديدة
                </button>
              </div>
              <div className="p-4 flex flex-col items-center justify-center py-12 text-slate-500 text-xs">
                <Database className="w-12 h-12 mb-3 opacity-20" />
                <p>قاعدة البيانات متصلة بنجاح.</p>
                <p>يمكنك استعراض وإضافة وتعديل التقسيمات الإدارية ديناميكياً.</p>
              </div>
            </div>

            {/* Landmarks List */}
            <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-white/10 flex justify-between items-center bg-slate-900">
                <h3 className="text-sm font-bold text-white">إدارة النقاط الدالة (Landmarks)</h3>
                <button className="text-[#F27D26] hover:text-[#ff8a3d] text-xs flex items-center gap-1 font-bold">
                  <Plus className="w-3 h-3" /> إضافة نقطة دالة
                </button>
              </div>
              <div className="p-4 flex flex-col items-center justify-center py-12 text-slate-500 text-xs">
                <MapPin className="w-12 h-12 mb-3 opacity-20" />
                <p>لم يتم تسجيل نقاط دالة مخصصة بعد.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
