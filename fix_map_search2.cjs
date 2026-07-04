const fs = require('fs');
let code = fs.readFileSync('src/components/MapSearch.tsx', 'utf8');

if (!code.includes('IRAQ_BOUNDS')) {
  code = code.replace(
    "import { Property } from '../types';",
    "import { Property } from '../types';\nimport { IRAQ_BOUNDS } from '../data/iraqLocations';"
  );
}

if (!code.includes('import MarkerClusterGroup from')) {
  code = code.replace(
    "import { MapContainer, TileLayer, Marker, Popup, LayersControl, useMapEvents } from 'react-leaflet';",
    "import { MapContainer, TileLayer, Marker, Popup, LayersControl, useMapEvents } from 'react-leaflet';\nimport MarkerClusterGroup from 'react-leaflet-cluster';"
  );
}

if (!code.includes('const createClusterCustomIcon = function')) {
  code = code.replace(
    "// Custom Icon for properties",
    `const createClusterCustomIcon = function (cluster: any) {
  return L.divIcon({
    html: \`<div class="w-10 h-10 bg-[#F27D26] text-white rounded-full flex items-center justify-center font-bold border-2 border-white shadow-lg text-sm">\${cluster.getChildCount()}</div>\`,
    className: 'custom-marker-cluster',
    iconSize: L.point(40, 40, true),
  });
};

// Custom Icon for properties`
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
          </LayersControl>
          <MarkerClusterGroup
            chunkedLoading
            iconCreateFunction={createClusterCustomIcon}
            maxClusterRadius={50}
            spiderfyOnMaxZoom={true}
          >`;

code = code.replace(mapRegex, newMapStr);
code = code.replace("</MapContainer>", "</MarkerClusterGroup>\n        </MapContainer>");

fs.writeFileSync('src/components/MapSearch.tsx', code);
