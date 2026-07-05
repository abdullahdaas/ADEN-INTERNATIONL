const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const logCode = `
const requireAuth = (req, res, next) => {
  console.log(\`[requireAuth] \${req.method} \${req.url} | Auth Header: \${req.headers.authorization} | req.user: \${JSON.stringify(req.user)}\`);
  if (!req.user) {
    logSecurityEvent(req.ip, 'auth_failure', 'Unauthorized access attempt to ' + req.path);
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  next();
};
`;

code = code.replace(/const requireAuth = \(req, res, next\) => \{[\s\S]*?next\(\);\n\};/, logCode);
fs.writeFileSync('server.ts', code);
