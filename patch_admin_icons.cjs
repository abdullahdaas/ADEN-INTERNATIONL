const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPortal.tsx', 'utf8');

code = code.replace(
  "LayoutDashboard,",
  "LayoutDashboard,\n  Save,\n  Briefcase,"
);

fs.writeFileSync('src/components/AdminPortal.tsx', code);
console.log("Patched icons");
