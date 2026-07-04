const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

code = code.replace(
  "isFeatured: boolean;",
  "isFeatured: boolean;\n  isSuspended?: boolean;"
);

fs.writeFileSync('src/types.ts', code);
console.log("Patched types.ts");
