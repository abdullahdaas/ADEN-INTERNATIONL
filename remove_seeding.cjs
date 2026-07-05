const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Remove import
code = code.replace(/import \{ INITIAL_PROPERTIES.*?\} from '\.\/src\/data\/mockData';/, '');

// Remove seeding logic
code = code.replace(
  /if \(\(await db.properties.getAll\(\)\)\.length === 0\) \{[\s\S]*?for \(const d of INITIAL_DEALS\) await db\.deals\.add\(d\);\s*\}/,
  ''
);

fs.writeFileSync('server.ts', code);
