const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPortal.tsx', 'utf8');

code = code.replace(
`    if (localStorage.getItem("aden-admin-auth") === "true") {`,
`    const adminToken = localStorage.getItem("aden-admin-token");
    if (localStorage.getItem("aden-admin-auth") === "true" && adminToken && adminToken !== "undefined") {`
);

fs.writeFileSync('src/components/AdminPortal.tsx', code);
