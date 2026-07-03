const fs = require('fs');
let prop = fs.readFileSync('src/components/PropertyDetails.tsx', 'utf-8');
prop = prop.replace('CheckCircle2, User', 'CheckCircle2, User, Banknote');
fs.writeFileSync('src/components/PropertyDetails.tsx', prop);
