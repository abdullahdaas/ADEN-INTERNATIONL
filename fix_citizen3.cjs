const fs = require('fs');
let code = fs.readFileSync('src/components/CitizenProperties.tsx', 'utf8');

const startIndex = code.indexOf('<div className="grid grid-cols-1 gap-3 sm:grid-cols-4">');
const endIndex = code.indexOf('<div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-900/50 rounded-lg p-3 border border-white/5">');

if (startIndex !== -1 && endIndex !== -1) {
  code = code.substring(0, startIndex) + `<SmartLocationPicker 
                      initialLocation={editLocationData} 
                      onChange={(loc, isValid) => { setEditLocationData(loc); setIsEditLocationValid(isValid); }} 
                      lang={lang} 
                    />
                  </div>
                  ` + code.substring(endIndex);
  fs.writeFileSync('src/components/CitizenProperties.tsx', code);
  console.log("Fixed UI block in CitizenProperties");
} else {
  console.log("Could not find start/end", startIndex, endIndex);
}
