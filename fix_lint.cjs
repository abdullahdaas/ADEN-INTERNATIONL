const fs = require('fs');

// App.tsx duplicate documents
let app = fs.readFileSync('src/App.tsx', 'utf-8');
app = app.replace(/documents: newDocuments,\n\s*documents: newDocuments,\n\s*coordinates: newCoordinates/, 'documents: newDocuments,\n        coordinates: newCoordinates');
fs.writeFileSync('src/App.tsx', app);

// AdminPortal.tsx duplicate ShieldAlert
let admin = fs.readFileSync('src/components/AdminPortal.tsx', 'utf-8');
admin = admin.replace('ShieldAlert,\n  ShieldAlert', 'ShieldAlert');
admin = admin.replace('Banknote, BadgeCheck, ShieldAlert', 'Banknote, BadgeCheck');
admin = admin.replace('loadData();', 'loadAdminData();');
fs.writeFileSync('src/components/AdminPortal.tsx', admin);

// PropertyDetails.tsx missing Banknote
let propDet = fs.readFileSync('src/components/PropertyDetails.tsx', 'utf-8');
if (!propDet.includes('Banknote,')) {
  propDet = propDet.replace('import { MapPin', 'import { MapPin, Banknote');
}
fs.writeFileSync('src/components/PropertyDetails.tsx', propDet);

// db.ts 
let db = fs.readFileSync('src/data/db.ts', 'utf-8');
db = db.replace("offers: new FirestoreCollection<any>('offers', [{ id: 'offer-1', propertyTitle: 'فيلا المنصور', buyerName: 'علي رضا', amount: 500000000, status: 'pending', message: 'جاد في الشراء' }]),", "offers: new FirestoreCollection<any>('offers'),");
db = db.replace("complaints: new FirestoreCollection<any>('complaints', [{ id: 'comp-1', subject: 'وصف مضلل', description: 'العقار أصغر من المساحة المذكورة', reporterName: 'مستخدم 123', status: 'open', createdAt: new Date().toISOString() }]),", "complaints: new FirestoreCollection<any>('complaints'),");
fs.writeFileSync('src/data/db.ts', db);
