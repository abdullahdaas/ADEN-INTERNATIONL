const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const searchAr = 'أرسل استفسارك أو طلبك مباشرة للمشرفين';
const replaceAr = 'أرسل استفسارك أو طلبك مباشرة للمشرفين أو عبر الإيميل adenofice@gmail.com';

const searchEn = 'Submit your query instantly to our advisors';
const replaceEn = 'Submit your query instantly to our advisors or via email at adenofice@gmail.com';

code = code.replace(searchAr, replaceAr);
code = code.replace(searchEn, replaceEn);

fs.writeFileSync('src/App.tsx', code);
