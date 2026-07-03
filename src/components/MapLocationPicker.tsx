import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Search } from 'lucide-react';

// Fix leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function SearchBox({ onPlaceSelect }: { onPlaceSelect: (loc: {lat: number, lng: number}) => void }) {
  const [query, setQuery] = useState('');

  const handleSearch = async () => {
    if (!query) return;
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
      const data = await response.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        onPlaceSelect({ lat, lng });
      }
    } catch (e) {
      console.error('Search failed', e);
    }
  };

  return (
    <div className="absolute top-2 left-2 right-2 z-[400] flex gap-2">
      <input 
        type="text" 
        placeholder="Search location..." 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
        className="flex-1 rounded-lg border border-white/10 bg-[#0a0a0a]/90 backdrop-blur-md px-3 py-2 text-xs text-white placeholder-slate-400 outline-none focus:border-[#F27D26]/50 shadow-lg"
      />
      <button 
        type="button"
        onClick={(e) => { e.preventDefault(); handleSearch(); }}
        className="bg-[#F27D26] text-white px-3 py-2 rounded-lg hover:bg-[#ff8a3d] transition-colors shadow-lg pointer-events-auto"
      >
        <Search className="h-4 w-4" />
      </button>
    </div>
  );
}

function LocationMarker({ position, setPosition, onLocationSelect }: any) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelect(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

function MapController({ position }: { position: {lat: number, lng: number} }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom());
    }
  }, [position, map]);
  return null;
}

export function MapLocationPicker({ 
  initialLocation, 
  onLocationSelect 
}: { 
  initialLocation?: {lat: number, lng: number}, 
  onLocationSelect: (loc: {lat: number, lng: number}) => void 
}) {
  const [position, setPosition] = useState(initialLocation || {lat: 33.3152, lng: 44.3661});

  return (
    <div className="h-64 w-full rounded-xl overflow-hidden border border-white/10 relative shadow-inner bg-slate-950">
      <SearchBox onPlaceSelect={(loc) => {
        setPosition(loc);
        onLocationSelect(loc);
      }} />
      <MapContainer 
        center={[position.lat, position.lng]} 
        zoom={12} 
        style={{ height: '100%', width: '100%', zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <LocationMarker position={position} setPosition={setPosition} onLocationSelect={onLocationSelect} />
        <MapController position={position} />
      </MapContainer>
    </div>
  );
}
