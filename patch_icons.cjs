const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPortal.tsx', 'utf-8');

if (!code.includes('Calendar,')) {
  code = code.replace("Users, History, Ban", "Users, History, Ban, Calendar");
}

fs.writeFileSync('src/components/AdminPortal.tsx', code);
