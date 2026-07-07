const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  /<div className="absolute inset-0 z-0 bg-gradient-to-b from-\[#0f172a\]\/70 to-\[#0f172a\]" \/>/,
  '<div className="absolute inset-0 z-0 bg-gradient-to-b from-[#050505]/60 via-[#050505]/80 to-[#050505]" />'
);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched hero background gradient color");
