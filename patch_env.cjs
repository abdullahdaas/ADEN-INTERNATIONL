const fs = require('fs');
let code = fs.readFileSync('.env.example', 'utf-8');
if (!code.includes('VITE_SUPABASE_URL')) {
  code += '\n# Supabase Configuration\nVITE_SUPABASE_URL=\nVITE_SUPABASE_ANON_KEY=\n';
  fs.writeFileSync('.env.example', code);
}
