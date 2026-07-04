const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Remove remaining useEffects
code = code.replace(/useEffect\(\(\) => \{\n\s*if \(newDist.*?\}, \[newSubDist, subDistrictsList\]\);/s, '');

// Remove setNewAddress
code = code.replace(/setNewAddress\(""\);/g, '');

fs.writeFileSync('src/App.tsx', code);
console.log("Cleaned up old state usage.");
