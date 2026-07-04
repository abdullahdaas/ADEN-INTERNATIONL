const fs = require('fs');
let code = fs.readFileSync('src/components/CitizenProperties.tsx', 'utf8');

code = code.replace(
  /<SmartLocationPicker[\s\S]*?<\/div>\n\s*<\/div>\n\s*\{\/\* Specs & Features Grid \*\/\}/m,
  `<SmartLocationPicker 
                      initialLocation={editLocationData} 
                      onChange={(loc, isValid) => { setEditLocationData(loc); setIsEditLocationValid(isValid); }} 
                      lang={lang} 
                    />
              </div>
              
              {/* Specs & Features Grid */}`
);

fs.writeFileSync('src/components/CitizenProperties.tsx', code);
console.log("Fixed JSX closure");
