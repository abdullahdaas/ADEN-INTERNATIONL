const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  "const errorMsg = err.message || 'Unknown error';",
  "let errorMsg = err.message || 'Unknown error';\n      if (errorMsg.includes('Invalid Compact JWS') || errorMsg.includes('JWSError')) {\n        errorMsg = lang === 'ar' ? 'مفتاح Supabase (Anon Key) مفقود أو غير صالح. يرجى إضافته في الإعدادات.' : 'Supabase Anon Key is missing or invalid. Please add it in the environment settings.';\n      }"
);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx with friendly Supabase error.");
