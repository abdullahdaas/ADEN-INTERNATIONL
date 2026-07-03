const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const newLogout = `
  const handleLogout = () => {
    setUser(null);
    setCitizenSubmittedProps([]);
    setFavorites([]);
    setCompareList([]);
    localStorage.removeItem('aden-user');
    localStorage.removeItem('aden-admin-auth');
    localStorage.removeItem('aden-citizen-props');
    localStorage.removeItem('aden-favorites');
    localStorage.removeItem('aden-compare');
    setView('home');
  };
`;

code = code.replace(/const handleLogout = \(\) => \{\n    setUser\(null\);\n    localStorage\.removeItem\('aden-user'\);\n    localStorage\.removeItem\('aden-admin-auth'\);\n    setView\('home'\);\n  \};/g, newLogout.trim());

fs.writeFileSync('src/App.tsx', code);
