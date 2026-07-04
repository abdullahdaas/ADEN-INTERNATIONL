const fs = require('fs');
let code = fs.readFileSync('src/components/CitizenProperties.tsx', 'utf8');

code = code.replace(/setEditGov\(.*?\);\n\s*setEditDist\(.*?\);\n\s*setEditSubDist\(.*?\);\n\s*setEditNeigh\(.*?\);\n\s*setEditAddress\(.*?\);/g, '');

if (!code.includes('import { SmartLocationPicker }')) {
  code = code.replace("import { formatPrice } from './PropertyCard';", "import { formatPrice } from './PropertyCard';\nimport { SmartLocationPicker } from './SmartLocationPicker';");
}

fs.writeFileSync('src/components/CitizenProperties.tsx', code);
console.log("Fixed leftovers");
