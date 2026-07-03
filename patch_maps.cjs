const fs = require('fs');

// Patch MapLocationPicker
let code1 = fs.readFileSync('src/components/MapLocationPicker.tsx', 'utf-8');
code1 = code1.replace(/<Map\s+defaultCenter/g, '<Map\n           style={{width: "100%", height: "100%"}}\n           defaultCenter');
fs.writeFileSync('src/components/MapLocationPicker.tsx', code1);

// Patch MapSearch
let code2 = fs.readFileSync('src/components/MapSearch.tsx', 'utf-8');
code2 = code2.replace(/<Map\s+defaultCenter/g, '<Map\n            style={{width: "100%", height: "100%"}}\n            defaultCenter');
fs.writeFileSync('src/components/MapSearch.tsx', code2);

console.log('Patched Map heights');
