const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /if \(\n\s*!newTitle \|\|\n\s*!newDesc \|\|\n\s*!newPrice \|\|\n\s*!newSpace \|\|\n\s*!newGov \|\|\n\s*!newDist \|\|\n\s*!newSubDist \|\|\n\s*!newNeigh \|\|\n\s*!newAddress\n\s*\) \{/g,
  `if (!newTitle || !newDesc || !newPrice || !newSpace || !isLocationValid) {`
);

code = code.replace(/useEffect\(\(\) => \{\s*if \(newGov\).*?\}, \[newGov\]\);/s, '');

fs.writeFileSync('src/App.tsx', code);
console.log("App.tsx validation patched.");
