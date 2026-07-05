const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPortal.tsx', 'utf8');

code = code.replace(
`    localStorage.removeItem("aden-admin-token");
    onLogout();`,
`    localStorage.removeItem("aden-admin-token");
    localStorage.removeItem("aden-user");
    onLogout();`
);

fs.writeFileSync('src/components/AdminPortal.tsx', code);
