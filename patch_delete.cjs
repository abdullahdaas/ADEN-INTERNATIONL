const fs = require('fs');
let code = fs.readFileSync('src/utils/api.ts', 'utf8');

code = code.replace(
  "method: 'DELETE'",
  "method: 'DELETE',\n    headers: getAuthHeaders()"
);

fs.writeFileSync('src/utils/api.ts', code);
console.log("Patched delete");
