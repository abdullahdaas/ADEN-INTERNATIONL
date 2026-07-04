const fs = require('fs');
let code = fs.readFileSync('src/components/CitizenProperties.tsx', 'utf8');

// The replacement of state variables didn't work properly because the regex was wrong.
// Let's find it.
code = code.replace(
  /const \[editGov, setEditGov\] = useState\(''\);\n\s*const \[editDist, setEditDist\] = useState\(''\);\n\s*const \[editSubDist, setEditSubDist\] = useState\(''\);\n\s*const \[editNeigh, setEditNeigh\] = useState\(''\);\n\s*const \[editAddress, setEditAddress\] = useState\(''\);/,
  `const [editLocationData, setEditLocationData] = useState<any>(null);
  const [isEditLocationValid, setIsEditLocationValid] = useState(true);`
);

// Remove useEffects
code = code.replace(/useEffect\(\(\) => \{\n\s*if \(editGov\).*?\}, \[editGov\]\);/s, '');
code = code.replace(/useEffect\(\(\) => \{\n\s*if \(editDist && editGov\).*?\}, \[editDist, editGov\]\);/s, '');
code = code.replace(/useEffect\(\(\) => \{\n\s*if \(editSubDist && editDist && editGov\).*?\}, \[editSubDist, editDist, editGov\]\);/s, '');

// Also the UI wasn't replaced properly. Let's find the exact UI block.
let uiStart = code.indexOf('<div className="grid grid-cols-1 md:grid-cols-4 gap-3">');
let uiEnd = code.indexOf('<div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-900/50 rounded-lg p-3 border border-white/5">');

if (uiStart !== -1 && uiEnd !== -1) {
  code = code.substring(0, uiStart) + `<SmartLocationPicker 
                      initialLocation={editLocationData} 
                      onChange={(loc, isValid) => { setEditLocationData(loc); setIsEditLocationValid(isValid); }} 
                      lang={lang} 
                    />
                  </div>
                  ` + code.substring(uiEnd);
}

fs.writeFileSync('src/components/CitizenProperties.tsx', code);
console.log("Fixed CitizenProperties.");
