const fs = require('fs');
let code = fs.readFileSync('src/components/AdminGISPanel.tsx', 'utf8');

code = code.replace(
  "import { MapContainer, TileLayer, Marker, Popup, LayersControl, Circle, Tooltip } from 'react-leaflet';",
  "import { MapContainer, TileLayer, Marker, Popup, LayersControl, Circle, Tooltip } from 'react-leaflet';\nimport MarkerClusterGroup from 'react-leaflet-cluster';"
);

code = code.replace(
  "{properties.map(p => (",
  `<MarkerClusterGroup
                  chunkedLoading
                  iconCreateFunction={createClusterCustomIcon}
                  maxClusterRadius={50}
                  spiderfyOnMaxZoom={true}
                >
                  {properties.map(p => (`
);

code = code.replace(
  "</Overlay>",
  "</MarkerClusterGroup>\n              </Overlay>"
);

fs.writeFileSync('src/components/AdminGISPanel.tsx', code);
