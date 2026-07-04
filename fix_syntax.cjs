const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /const \[isLocationValid, setIsLocationValid\] = useState\(false\);\n\s*lat: 33\.3152,\n\s*lng: 44\.3661,\n\s*\}\);/,
  `const [isLocationValid, setIsLocationValid] = useState(false);`
);

fs.writeFileSync('src/App.tsx', code);
console.log("Syntax fixed!");
