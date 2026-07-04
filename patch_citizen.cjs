const fs = require('fs');
let code = fs.readFileSync('src/components/CitizenProperties.tsx', 'utf8');

// Replace state variables
code = code.replace(
  /const \[editGov, setEditGov\].*?;[\s\S]*?const \[editAddress, setEditAddress\].*?\n/m,
  `const [editLocationData, setEditLocationData] = useState<any>(null);\n  const [isEditLocationValid, setIsEditLocationValid] = useState(true);\n`
);

// Remove useEffects for editGov, editDist, etc
code = code.replace(
  /\/\/ Update Dist.*\n[\s\S]*?\}, \[editSubDist, editDist, editGov\]\);/m,
  `// Sync Locations Dropdowns handled by SmartLocationPicker`
);

// handleEditProperty function updates
// we need to set the location data when we open the edit modal
code = code.replace(
  /setEditGov\(p.governorate\);\n\s*setEditDist\(p.district\);\n\s*setEditSubDist\(p.subDistrict\);\n\s*setEditNeigh\(p.neighborhood\);\n\s*setEditAddress\(p.address\);/m,
  `setEditLocationData({
        country: p.country,
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
      setIsEditLocationValid(true);`
);

// update properties inside handleSaveEdit
code = code.replace(
  /governorate: editGov,[\s\S]*?address: editAddress,/m,
  `...editLocationData,`
);

// Find the UI block to replace
const uiBlockRegex = /<div className="grid grid-cols-1 md:grid-cols-4 gap-3">[\s\S]*?<\/div>\n\s*<\/div>\n\s*<div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-900\/50 rounded-lg p-3 border border-white\/5">/m;
code = code.replace(uiBlockRegex, `<SmartLocationPicker 
                      initialLocation={editLocationData} 
                      onChange={(loc, isValid) => { setEditLocationData(loc); setIsEditLocationValid(isValid); }} 
                      lang={lang} 
                    />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-900/50 rounded-lg p-3 border border-white/5">`);

// Add import
if (!code.includes('SmartLocationPicker')) {
  code = code.replace("import { formatPrice } from './PropertyCard';", "import { formatPrice } from './PropertyCard';\nimport { SmartLocationPicker } from './SmartLocationPicker';");
}

fs.writeFileSync('src/components/CitizenProperties.tsx', code);
console.log("CitizenProperties.tsx patched!");
