const fs = require('fs');
let code = fs.readFileSync('src/components/MapSearch.tsx', 'utf8');

const targetStr = `<MapContainer
          center={[33.3152, 44.3661]} // Baghdad default
          zoom={6}
          style={{ height: '100%', width: '100%', zIndex: 1 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />`;

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

code = code.replace(targetStr, newMapStr);
fs.writeFileSync('src/components/MapSearch.tsx', code);
