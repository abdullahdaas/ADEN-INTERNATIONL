const fs = require('fs');
let code = fs.readFileSync('src/components/CitizenProperties.tsx', 'utf-8');

code = code.replace(
  "const errorMsg = err.message || 'Unknown error';",
  "let errorMsg = err.message || 'Unknown error';\n        if (errorMsg.includes('Invalid Compact JWS') || errorMsg.includes('JWSError')) {\n          errorMsg = 'مفتاح Supabase (Anon Key) مفقود أو غير صالح. يرجى إضافته في الإعدادات.';\n        }"
);

fs.writeFileSync('src/components/CitizenProperties.tsx', code);
console.log("Patched CitizenProperties.tsx with friendly Supabase error.");
