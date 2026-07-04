const fs = require('fs');
let code = fs.readFileSync('src/components/PropertyDetails.tsx', 'utf8');

code = code.replace(
  /<MapDisplay location=\{property\.coordinates\} title=\{property\.title\} \/>/,
  `<MapDisplay property={property} />`
);

fs.writeFileSync('src/components/PropertyDetails.tsx', code);
console.log("PropertyDetails patched!");
