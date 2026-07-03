const fs = require('fs');
let code = fs.readFileSync('src/data/db.ts', 'utf-8');

// Let's add a few fake offers/complaints to the initial state to see them in Admin
code = code.replace("offers: new FirestoreCollection<any>('offers')", "offers: new FirestoreCollection<any>('offers', [{ id: 'offer-1', propertyTitle: 'فيلا المنصور', buyerName: 'علي رضا', amount: 500000000, status: 'pending', message: 'جاد في الشراء' }])");
code = code.replace("complaints: new FirestoreCollection<any>('complaints')", "complaints: new FirestoreCollection<any>('complaints', [{ id: 'comp-1', subject: 'وصف مضلل', description: 'العقار أصغر من المساحة المذكورة', reporterName: 'مستخدم 123', status: 'open', createdAt: new Date().toISOString() }])");

fs.writeFileSync('src/data/db.ts', code);
