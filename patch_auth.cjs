const fs = require('fs');

// Patch api.ts to prevent sending "undefined" token
let apiCode = fs.readFileSync('src/utils/api.ts', 'utf8');
apiCode = apiCode.replace(/const token = localStorage\.getItem\('aden-admin-token'\) \|\| localStorage\.getItem\('aden_token'\);/g, 
`let token = localStorage.getItem('aden-admin-token');
    if (!token || token === 'undefined' || token === 'null') {
      token = localStorage.getItem('aden_token');
    }
    if (token === 'undefined' || token === 'null') token = null;`);
fs.writeFileSync('src/utils/api.ts', apiCode);

// Patch server.ts to add extensive logging to auth
let serverCode = fs.readFileSync('server.ts', 'utf8');
serverCode = serverCode.replace(/const requireAuth = \(req, res, next\) => \{[\s\S]*?next\(\);\n\};/, 
`const requireAuth = (req, res, next) => {
  const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : 'none';
  console.log(\`[requireAuth] \${req.method} \${req.url} | Token: \${token} | req.user: \${req.user ? JSON.stringify(req.user) : 'UNDEFINED'}\`);
  if (!req.user) {
    console.log(\`[requireAuth] Rejecting request: No valid user attached to req\`);
    logSecurityEvent(req.ip, 'auth_failure', 'Unauthorized access attempt to ' + req.path);
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  next();
};`);
fs.writeFileSync('server.ts', serverCode);

