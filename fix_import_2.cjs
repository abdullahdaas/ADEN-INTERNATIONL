const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPortal.tsx', 'utf8');

code = code.replace(
  'import { AdminMapEditor } from "./AdminMapEditor";',
  'import { AdminMapEditor } from "./AdminMapEditor";\nimport { AdminGISPanel } from "./AdminGISPanel";'
);

fs.writeFileSync('src/components/AdminPortal.tsx', code);
