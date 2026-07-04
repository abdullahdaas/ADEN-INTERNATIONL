const fs = require('fs');
let code = fs.readFileSync('src/components/MapSearch.tsx', 'utf8');

const replacement = `          <MapContainer
            center={[33.3152, 44.3661]} // Baghdad default
            zoom={6}
            minZoom={5}
            maxBounds={[[29.0653, 38.7923], [37.3780, 48.5667]]}
            style={{ height: '100%', width: '100%', zIndex: 1 }}
          >
            <LayersControl position="topright">
              <LayersControl.BaseLayer checked name="CartoDB Positron (الافتراضية)">
                <TileLayer
                  attribution='&copy; OpenStreetMap &copy; CartoDB'
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="Esri World Imagery (قمر صناعي)">
                <TileLayer
                  attribution='&copy; Esri'
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="OpenTopoMap (تضاريس)">
                <TileLayer
                  attribution='&copy; OpenTopoMap'
                  url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                />
              </LayersControl.BaseLayer>
            </LayersControl>`;

code = code.replace(
  /<MapContainer[^>]*>[\s\S]*?<TileLayer[^>]*\/>/m,
  replacement
);

code = code.replace(
  "import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';",
  "import { MapContainer, TileLayer, Marker, Popup, LayersControl, useMapEvents } from 'react-leaflet';"
);

fs.writeFileSync('src/components/MapSearch.tsx', code);
console.log("Patched MapSearch");
