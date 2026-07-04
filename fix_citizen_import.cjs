const fs = require('fs');
let code = fs.readFileSync('src/components/CitizenProperties.tsx', 'utf8');

code = code.replace(
  "import { IRAQ_LOCATIONS } from '../data/iraqLocations';",
  "import { IRAQ_LOCATIONS } from '../data/iraqLocations';\nimport { SmartLocationPicker } from './SmartLocationPicker';"
);

fs.writeFileSync('src/components/CitizenProperties.tsx', code);
console.log("Import fixed");
