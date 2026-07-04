const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPortal.tsx', 'utf8');

// The DELETED_locations block starts with {adminView === "DELETED_locations" && ( and ends with )} before {adminView === "supervisors"
const startIdx = code.indexOf('{adminView === "DELETED_locations"');
const nextIdx = code.indexOf('{adminView === "supervisors"');

if (startIdx !== -1 && nextIdx !== -1) {
  const block = code.substring(startIdx, nextIdx);
  code = code.replace(block, '');
  fs.writeFileSync('src/components/AdminPortal.tsx', code);
  console.log("Deleted dead code");
}
