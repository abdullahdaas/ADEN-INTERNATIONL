const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /async function seedDatabase\(\) \{[\s\S]*?console\.log\('Database seeded successfully\.'\);\s*\}\s*\} catch \(err\) \{[\s\S]*?console\.error\('Failed to seed db:', err\);\s*\}\s*\}/,
  'async function seedDatabase() { /* No seeding in production */ }'
);

fs.writeFileSync('server.ts', code);
