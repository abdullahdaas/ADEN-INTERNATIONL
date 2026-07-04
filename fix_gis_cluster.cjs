const fs = require('fs');
let code = fs.readFileSync('src/components/AdminGISPanel.tsx', 'utf8');

code = code.replace("import MarkerClusterGroup from 'react-leaflet-cluster';", "");
code = code.replace(/<MarkerClusterGroup[^>]*>/, "");
code = code.replace(/<\/MarkerClusterGroup>/, "");

fs.writeFileSync('src/components/AdminGISPanel.tsx', code);
