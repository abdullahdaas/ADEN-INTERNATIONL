const fs = require('fs');
let admin = fs.readFileSync('src/components/AdminPortal.tsx', 'utf-8');
admin = admin.replace(/loadData\(\)/g, 'loadAdminData()');
fs.writeFileSync('src/components/AdminPortal.tsx', admin);
