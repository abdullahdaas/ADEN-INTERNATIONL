const fs = require('fs');
let code = fs.readFileSync('src/components/AdminMapEditor.tsx', 'utf8');

if (!code.includes('IRAQ_BOUNDS')) {
  code = code.replace(
    "import { Property } from '../types';",
    "import { Property } from '../types';\nimport { IRAQ_BOUNDS } from '../data/iraqLocations';"
  );
}

if (!code.includes('const { BaseLayer } = LayersControl;')) {
  code = code.replace(
    "export function AdminMapEditor",
    "const { BaseLayer } = LayersControl;\n\nexport function AdminMapEditor"
  );
}

const mapRegex = /<MapContainer[^>]*>[\s\S]*?<TileLayer[^>]*\/>/m;

const newMapStr = `<MapContainer
            center={[33.3152, 44.3661]} // Baghdad default
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
            </LayersControl>`;

code = code.replace(mapRegex, newMapStr);

fs.writeFileSync('src/components/AdminMapEditor.tsx', code);
