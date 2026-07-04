const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const startStr = '<div className="grid grid-cols-1 gap-3 sm:grid-cols-4">';
const endStr = '<div className="grid grid-cols-2 gap-4 sm:grid-cols-5 bg-slate-900/40 rounded-xl p-4 border border-white/5">';

const startIndex = code.indexOf(startStr);
const endIndex = code.indexOf(endStr);

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `<SmartLocationPicker onChange={(loc, isValid) => { setNewLocationData(loc); setIsLocationValid(isValid); }} lang={lang} />\n                </div>\n                \n                {/* Specs Grid */}\n                ${endStr}`;
  
  code = code.substring(0, startIndex) + replacement + code.substring(endIndex + endStr.length);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Replaced UI block successfully.");
} else {
  console.log("Could not find bounds", startIndex, endIndex);
}
