const fs = require('fs');
let code = fs.readFileSync('src/utils/translations.ts', 'utf8');

code = code.replace("generalUserRole: 'عامة الناس / مواطن عراقي',", "generalUserRole: 'تسجيل دخول المواطنين',");

fs.writeFileSync('src/utils/translations.ts', code);
console.log("Translations updated!");
