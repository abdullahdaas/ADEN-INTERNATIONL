const fs = require('fs');

let css = fs.readFileSync('src/index.css', 'utf8');

const lightTheme = `
html[data-theme='light'] {
  --color-slate-950: #f8fafc;
  --color-slate-900: #f1f5f9;
  --color-slate-800: #e2e8f0;
  --color-slate-700: #cbd5e1;
  --color-slate-600: #94a3b8;
  --color-slate-500: #64748b;
  --color-slate-400: #475569;
  --color-slate-300: #334155;
  --color-slate-200: #1e293b;
  --color-slate-100: #0f172a;
  --color-slate-50:  #020617;

  --color-white: #0f172a;
  --color-black: #f8fafc;
  
  --color-royal-dark: #f8fafc;
  --color-royal-blue: #f1f5f9;
  --color-royal-light: #e2e8f0;
}
`;

if (!css.includes("data-theme='light'")) {
    css += "\n" + lightTheme;
    fs.writeFileSync('src/index.css', css);
    console.log("Added light theme CSS variables.");
}
