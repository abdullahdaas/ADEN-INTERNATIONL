const fs = require('fs');
let admin = fs.readFileSync('src/components/AdminPortal.tsx', 'utf-8');
const lines = admin.split('\n');
// We can just use a regex to replace the duplicate imports
admin = admin.replace(/ShieldAlert,\s+ShieldAlert,/g, 'ShieldAlert,');
fs.writeFileSync('src/components/AdminPortal.tsx', admin);
