const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPortal.tsx', 'utf8');

code = code.replace(
  `onClick={() => setAdminView("locations")}`,
  `onClick={() => setAdminView("gis")}`
);

code = code.replace(
  `adminView === "DELETED_locations"`,
  `adminView === "gis"`
);

code = code.replace(
  `<span>إدارة التقسيم الجغرافي</span>`,
  `<span>منصة GIS الذكية</span>`
);

fs.writeFileSync('src/components/AdminPortal.tsx', code);
