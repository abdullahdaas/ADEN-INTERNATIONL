const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/status:\s*'active',\s*role:\s*'citizen',/, "status: 'active' as const,\n      role: 'citizen' as const,");

fs.writeFileSync('server.ts', code);
console.log("Regex types fixed.");
