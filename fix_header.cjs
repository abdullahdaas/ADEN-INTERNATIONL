const fs = require('fs');
let code = fs.readFileSync('src/components/Header.tsx', 'utf8');

const targetLang = `<span className="hidden sm:inline">{lang === 'ar' ? 'العربية' : lang === 'en' ? 'English' : 'کوردی'}</span>`;
const newLang = `<span className="inline">{lang === 'ar' ? 'اللغة' : lang === 'en' ? 'Language' : 'زمان'}</span>`;

const targetLogin = `<span className="hidden sm:inline">{t.loginButton}</span>`;
const newLogin = `<span className="inline">{t.loginButton}</span>`;

code = code.replace(targetLang, newLang);
code = code.replace(targetLogin, newLogin);

fs.writeFileSync('src/components/Header.tsx', code);
console.log("Header updated!");
