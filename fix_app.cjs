const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf-8');
app = app.replace('        documents: newDocuments,\n        coordinates: newCoordinates', '        documents: newDocuments');
fs.writeFileSync('src/App.tsx', app);
