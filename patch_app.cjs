const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace state variables
code = code.replace(
  /const \[newGov, setNewGov\].*?;[\s\S]*?const \[newCoordinates, setNewCoordinates\].*?\n/m,
  `const [newLocationData, setNewLocationData] = useState<any>(null);
  const [isLocationValid, setIsLocationValid] = useState(false);\n`
);

// Remove districtsList, subDistrictsList, neighborhoodsList updates
code = code.replace(
  /\/\/ Sync Locations Dropdowns for Add Property Form[\s\S]*?\}, \[newGov, newDist, newSubDist\]\);/m,
  `// Sync Locations Dropdowns handled by SmartLocationPicker`
);

// Replace payload location data
code = code.replace(
  /governorate: newGov,[\s\S]*?coordinates: newCoordinates,/m,
  `...newLocationData,`
);

// Submit check
code = code.replace(
  /if \(\!newTitle \|\| \!newDesc.*?\)/,
  `if (!newTitle || !newDesc || !newPrice || !newSpace || !isLocationValid)`
);


let searchTarget = `<div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                    {/* Governorate Select */}`;

let startIndex = code.indexOf('<div className="grid grid-cols-1 gap-3 sm:grid-cols-4">\\n                    {/* Governorate Select */}');
// regex match
const uiBlockRegex = /<div className="grid grid-cols-1 gap-3 sm:grid-cols-4">[\s\S]*?<\/MapLocationPicker>\n\s*<\/div>\n\s*<\/div>/m;
code = code.replace(uiBlockRegex, `<SmartLocationPicker onChange={(loc, isValid) => { setNewLocationData(loc); setIsLocationValid(isValid); }} lang={lang} />\n                </div>`);

// Add import
if (!code.includes('SmartLocationPicker')) {
  code = code.replace('import { MapLocationPicker } from "./components/MapLocationPicker";', 'import { SmartLocationPicker } from "./components/SmartLocationPicker";');
}

fs.writeFileSync('src/App.tsx', code);
console.log("App.tsx patched!");
