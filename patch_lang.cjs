const fs = require('fs');
let code = fs.readFileSync('src/components/SmartLocationPicker.tsx', 'utf8');

code = code.replace(
  "lang?: 'ar' | 'en';",
  "lang?: 'ar' | 'en' | 'ku';"
);

fs.writeFileSync('src/components/SmartLocationPicker.tsx', code);
console.log("Patched lang");
