import React from 'react';
import { MapContainer, TileLayer, Marker, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import { IRAQ_BOUNDS } from '../data/iraqLocations';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const { BaseLayer } = LayersControl;

export default function IraqMapDisplay({ position }: { position: [number, number] }) {
  return (
    <MapContainer 
      center={position} 
      zoom={15} 
      minZoom={5}
      maxBounds={[[IRAQ_BOUNDS.south, IRAQ_BOUNDS.west], [IRAQ_BOUNDS.north, IRAQ_BOUNDS.east]]}
      style={{ height: '100%', width: '100%', zIndex: 1 }}
      scrollWheelZoom={false}
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
      <Marker position={position} />
    </MapContainer>
  );
}
