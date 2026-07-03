const fs = require('fs');

// App.tsx
let app = fs.readFileSync('src/App.tsx', 'utf-8');
const lines = app.split('\n');
const fixedApp = lines.filter((line, i) => {
  if (line.includes('documents: newDocuments') && lines[i-1] && lines[i-1].includes('documents: newDocuments')) return false;
  return true;
});
fs.writeFileSync('src/App.tsx', fixedApp.join('\n'));

// AdminPortal.tsx
let admin = fs.readFileSync('src/components/AdminPortal.tsx', 'utf-8');
admin = admin.replace(/ShieldAlert,\s*ShieldAlert/g, 'ShieldAlert');
admin = admin.replace(/Banknote,\s*BadgeCheck,\s*ShieldAlert/g, 'Banknote, BadgeCheck');
admin = admin.replace(/loadData\(\);/g, 'loadAdminData();');
fs.writeFileSync('src/components/AdminPortal.tsx', admin);

// PropertyDetails.tsx
let propDet = fs.readFileSync('src/components/PropertyDetails.tsx', 'utf-8');
propDet = propDet.replace(/Banknote,?\s*Banknote/g, 'Banknote');
if (!propDet.includes('Banknote')) {
  propDet = propDet.replace('MapPin, ', 'MapPin, Banknote, ');
}
fs.writeFileSync('src/components/PropertyDetails.tsx', propDet);

console.log('Fixed lint again');
