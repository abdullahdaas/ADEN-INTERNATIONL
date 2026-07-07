const fs = require('fs');
let code = fs.readFileSync('src/data/supabaseStorage.ts', 'utf-8');

const clientInit = `
if (!supabaseKey || supabaseKey === 'YOUR_SUPABASE_ANON_KEY') {
  console.warn("Supabase Anon Key is missing or invalid. Please add VITE_SUPABASE_ANON_KEY to your environment variables.");
}

// Initialize Supabase client
export const supabase = createClient(
  supabaseUrl || 'https://jwgcowzsslbidcnyphvs.supabase.co',
  supabaseKey || 'YOUR_SUPABASE_ANON_KEY' 
);
`;

code = code.replace(
  /\/\/ Initialize Supabase client\nexport const supabase = createClient\([\s\S]*?\);/,
  clientInit
);

fs.writeFileSync('src/data/supabaseStorage.ts', code);
