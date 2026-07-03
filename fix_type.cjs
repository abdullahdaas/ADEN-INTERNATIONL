const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace("status: 'active',\\n      role: 'citizen',", "status: 'active',\\n      role: 'citizen',");
code = code.replace("status: 'active',\\n      role: 'citizen',", "status: 'active' as const,\\n      role: 'citizen' as const,");

fs.writeFileSync('server.ts', code);
console.log("Types fixed.");
