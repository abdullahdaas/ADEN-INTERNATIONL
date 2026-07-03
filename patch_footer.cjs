const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf-8');
app = app.replace('<span className="text-sm font-bold text-white">{t.logoTitle}</span>', '<AdenLogo size={40} />');
fs.writeFileSync('src/App.tsx', app);
