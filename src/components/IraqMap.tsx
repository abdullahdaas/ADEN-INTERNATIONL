import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, LayersControl, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { IRAQ_BOUNDS } from '../data/iraqLocations';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const { BaseLayer } = LayersControl;

function MapController({ position, zoom }: { position: {lat: number, lng: number} | null, zoom: number }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, zoom);
    }
  }, [position, zoom, map]);
  return null;
}

function LocationMarker({ position, onMapClick }: { position: any, onMapClick: any }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  const markerRef = useRef<L.Marker>(null);
  
  return position ? (
    <Marker 
      position={position} 
      draggable={true} 
      ref={markerRef}
      eventHandlers={{
        dragend: () => {
          const marker = markerRef.current;
          if (marker != null) {
            onMapClick(marker.getLatLng());
          }
        }
      }} 
    />
  ) : null;
}

export default function IraqMap({ position, onMapClick, defaultZoom = 6 }: any) {
  return (
    <MapContainer 
      center={position || [33.3152, 44.3661]} 
      zoom={defaultZoom} 
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
      </LayersControl>
      <LocationMarker position={position} onMapClick={onMapClick} />
      <MapController position={position} zoom={defaultZoom} />
    </MapContainer>
  );
}
