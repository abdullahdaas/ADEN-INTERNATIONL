const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /      setUploadProgress\(0\);\s*\}\s*\}\s*\};\s*const handleVideoUpload =/m;
code = code.replace(regex, "      setUploadProgress(0);\n    }\n  };\n\n  const handleVideoUpload =");
fs.writeFileSync('src/App.tsx', code);
console.log("Replaced with regex");
