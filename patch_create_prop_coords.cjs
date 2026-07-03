const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/documents: newDocuments/, 'documents: newDocuments,\n        coordinates: newCoordinates');
fs.writeFileSync('src/App.tsx', code);
console.log('Fixed newCoordinates in payload');
