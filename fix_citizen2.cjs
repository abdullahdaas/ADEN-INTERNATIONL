const fs = require('fs');
let code = fs.readFileSync('src/components/CitizenProperties.tsx', 'utf8');

// Replace handleEditProperty calls
code = code.replace(/setEditGov\(p\.governorate\);/g, `setEditLocationData({
        country: p.country || 'العراق',
        governorate: p.governorate,
        district: p.district,
        subDistrict: p.subDistrict,
        city: p.city,
        neighborhood: p.neighborhood,
        village: p.village,
        street: p.street,
        nearestLandmark: p.nearestLandmark,
        postalCode: p.postalCode,
        address: p.address,
        coordinates: p.coordinates,
        googleMapsUrl: p.googleMapsUrl,
        locationTimestamp: p.locationTimestamp
      });
      setIsEditLocationValid(true);`);
code = code.replace(/setEditDist\(p\.district\);/g, '');
code = code.replace(/setEditSubDist\(p\.subDistrict\);/g, '');
code = code.replace(/setEditNeigh\(p\.neighborhood\);/g, '');
code = code.replace(/setEditAddress\(p\.address\);/g, '');

// Also remove the entire UI block for Governorate etc.
// Let's use a regex that deletes the divs containing the selects.
const uiRegex = /\{?\/\*\s*Governorate Select\s*\*\/\}?[\s\S]*?(?=<div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-900\/50 rounded-lg p-3 border border-white\/5">)/m;
code = code.replace(uiRegex, `<SmartLocationPicker 
                      initialLocation={editLocationData} 
                      onChange={(loc, isValid) => { setEditLocationData(loc); setIsEditLocationValid(isValid); }} 
                      lang={lang} 
                    />
                  </div>
                  \n`);

fs.writeFileSync('src/components/CitizenProperties.tsx', code);
console.log("Fixed CitizenProperties.");
