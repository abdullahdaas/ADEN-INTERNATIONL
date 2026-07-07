const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// Replace import
code = code.replace(
  "import { db, firestore, deletePropertyImageFromStorage } from './src/data/db';",
  "import { db, firestore } from './src/data/db';\nimport { deleteFileFromSupabase } from './src/data/supabaseStorage';"
);

// Replace usages
code = code.replace(/deletePropertyImageFromStorage/g, "deleteFileFromSupabase");

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts for Supabase.");
