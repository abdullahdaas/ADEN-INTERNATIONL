const fs = require('fs');
let code = fs.readFileSync('src/components/CitizenProperties.tsx', 'utf-8');

code = code.replace(
  /const tempId = editingProperty\?\.id \|\| 'temp';/g,
  "const tempId = selectedEditProp?.id || 'temp';"
);

fs.writeFileSync('src/components/CitizenProperties.tsx', code);
console.log("Patched CitizenProperties.tsx");
