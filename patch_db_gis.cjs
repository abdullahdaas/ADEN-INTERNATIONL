const fs = require('fs');
let code = fs.readFileSync('src/data/db.ts', 'utf8');

const gisCollections = `  agreements: new FirestoreCollection<ElectronicAgreement>('agreements'),
  serviceProviders: new FirestoreCollection<any>('serviceProviders'),
  providerApplications: new FirestoreCollection<any>('providerApplications'),
  // GIS Collections
  gisGovernorates: new FirestoreCollection<any>('gis_governorates'),
  gisDistricts: new FirestoreCollection<any>('gis_districts'),
  gisSubDistricts: new FirestoreCollection<any>('gis_subdistricts'),
  gisCities: new FirestoreCollection<any>('gis_cities'),
  gisNeighborhoods: new FirestoreCollection<any>('gis_neighborhoods'),
  gisVillages: new FirestoreCollection<any>('gis_villages'),
  gisStreets: new FirestoreCollection<any>('gis_streets'),
  gisLandmarks: new FirestoreCollection<any>('gis_landmarks'),`;

code = code.replace(
  `  agreements: new FirestoreCollection<ElectronicAgreement>('agreements'),
  serviceProviders: new FirestoreCollection<any>('serviceProviders'),
  providerApplications: new FirestoreCollection<any>('providerApplications'),`,
  gisCollections
);

fs.writeFileSync('src/data/db.ts', code);
console.log("Patched db.ts");
