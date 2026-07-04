const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace state variables
code = code.replace(
  /const \[newGov, setNewGov\] = useState\(""\);\n\s*const \[newDist, setNewDist\] = useState\(""\);\n\s*const \[newSubDist, setNewSubDist\] = useState\(""\);\n\s*const \[newNeigh, setNewNeigh\] = useState\(""\);\n\s*const \[newAddress, setNewAddress\] = useState\(""\);\n\s*const \[newCoordinates, setNewCoordinates\] = useState\([^;]+\);/,
  `const [newLocationData, setNewLocationData] = useState<any>(null);
  const [isLocationValid, setIsLocationValid] = useState(false);`
);

// Remove districtsList, subDistrictsList, neighborhoodsList updates
code = code.replace(
  /useEffect\(\(\) => \{\n\s*if \(newGov\).*?\}, \[newGov, newDist, newSubDist\]\);/s,
  `// Replaced by SmartLocationPicker`
);

// Replace payload location data
code = code.replace(
  /governorate: newGov,\n\s*district: newDist,\n\s*subDistrict: newSubDist,\n\s*neighborhood: newNeigh,\n\s*address: newAddress,\n\s*coordinates: newCoordinates,/,
  `...newLocationData,`
);

// Fix the location block in the render function
// We need to replace the entire location UI with <SmartLocationPicker>
// First let's find the exact block to replace.
let uiBlockStart = code.indexOf('<div className="grid grid-cols-1 gap-3 sm:grid-cols-4">');
let uiBlockEnd = code.indexOf('<div className="grid grid-cols-2 gap-4 sm:grid-cols-5 bg-slate-900/40 rounded-xl p-4 border border-white/5">');

if (uiBlockStart !== -1 && uiBlockEnd !== -1) {
  // Back up a bit to get the outer div of the location block?
  // Actually, the <div className="grid grid-cols-1 gap-3 sm:grid-cols-4"> starts the governorate select.
  // There is an outer div? Let's check.
}
