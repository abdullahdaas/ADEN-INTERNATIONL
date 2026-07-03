const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPortal.tsx', 'utf-8');

if (!code.includes('Download,')) {
    code = code.replace(/import {/, 'import { Download,');
    fs.writeFileSync('src/components/AdminPortal.tsx', code);
}
