const fs = require('fs');
let code = fs.readFileSync('src/data/db.ts', 'utf8');

code = code.replace(
  "agreements: new FirestoreCollection<ElectronicAgreement>('agreements'),",
  "agreements: new FirestoreCollection<ElectronicAgreement>('agreements'),\n  serviceProviders: new FirestoreCollection<any>('serviceProviders'),\n  providerApplications: new FirestoreCollection<any>('providerApplications'),"
);

fs.writeFileSync('src/data/db.ts', code);
console.log("Patched db.ts");
