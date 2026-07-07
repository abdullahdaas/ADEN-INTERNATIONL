const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  /Array\.from\(files\)\.map\(file => compressImage\(file\)\)/g,
  "Array.from(files).map((file: any) => compressImage(file as File))"
);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx");
