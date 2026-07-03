const fs = require('fs');

// Fix AdminPortal
let admin = fs.readFileSync('src/components/AdminPortal.tsx', 'utf-8');
admin = admin.replace('Banknote, ShieldAlert', 'Banknote');
admin = admin.replace('loadData();', 'loadAdminData();');
fs.writeFileSync('src/components/AdminPortal.tsx', admin);

// Fix PropertyDetails
let prop = fs.readFileSync('src/components/PropertyDetails.tsx', 'utf-8');
prop = prop.replace("import { MapPin, Banknote, Phone", "import { MapPin, Phone, Banknote"); // Let's just make sure Banknote is imported
if (!prop.includes('Banknote')) {
  prop = prop.replace('import { MapPin,', 'import { MapPin, Banknote,');
}
fs.writeFileSync('src/components/PropertyDetails.tsx', prop);

