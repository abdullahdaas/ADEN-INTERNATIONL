const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPortal.tsx', 'utf8');

if (!code.includes('import { AdminGISPanel }')) {
  code = code.replace(
    "import { AdminMapEditor } from './AdminMapEditor';",
    "import { AdminMapEditor } from './AdminMapEditor';\nimport { AdminGISPanel } from './AdminGISPanel';"
  );
}

fs.writeFileSync('src/components/AdminPortal.tsx', code);
