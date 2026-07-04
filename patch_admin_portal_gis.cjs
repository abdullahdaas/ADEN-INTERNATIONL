const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPortal.tsx', 'utf8');

// Replace locations/map tabs in sidebar
code = code.replace(
  `{ id: "locations", label: "إدارة التقسيم الجغرافي", icon: MapIcon },`,
  `{ id: "gis", label: "منصة GIS الذكية", icon: MapIcon },`
);
code = code.replace(
  `{ id: "map", label: "الخريطة التفاعلية", icon: MapPin },`,
  ``
);

// Import AdminGISPanel
if (!code.includes('AdminGISPanel')) {
  code = code.replace(
    `import { AdminMapEditor } from './AdminMapEditor';`,
    `import { AdminMapEditor } from './AdminMapEditor';\nimport { AdminGISPanel } from './AdminGISPanel';`
  );
}

// Remove old map and locations views
code = code.replace(
  /<AdminMapEditor[\s\S]*?\/>/,
  `<AdminGISPanel properties={properties} onRefresh={loadAdminData} />`
);

code = code.replace(/adminView === "map"/g, 'adminView === "gis"');

// Delete the old locations view entirely (we can just replace its content with null or remove it)
// It's safer to just replace 'adminView === "locations"' with 'adminView === "DELETED_locations"'
code = code.replace(/adminView === "locations"/g, 'adminView === "DELETED_locations"');

fs.writeFileSync('src/components/AdminPortal.tsx', code);
console.log("Patched AdminPortal to use GIS panel");
