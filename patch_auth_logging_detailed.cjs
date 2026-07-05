const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/const requireAuth = \(req, res, next\) => \{[\s\S]*?next\(\);\n\};/, 
`const requireAuth = (req, res, next) => {
  const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : 'none';
  const user = req.user;
  const isAdmin = user && (user.role === 'admin' || user.role === 'super_admin' || user.role === 'supervisor');
  
  console.log(\`[Auth Audit] \${req.method} \${req.url}\`);
  console.log(\`  -> Token Received: \${token}\`);
  console.log(\`  -> Authenticated User: \${user ? JSON.stringify(user) : 'None'}\`);
  console.log(\`  -> isAdmin: \${isAdmin ? 'true' : 'false'}\`);

  if (!user) {
    console.log(\`  -> Authorization Failed: No valid user attached to request (Token invalid or missing)\`);
    logSecurityEvent(req.ip, 'auth_failure', 'Unauthorized access attempt to ' + req.path);
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  
  next();
};`);

fs.writeFileSync('server.ts', code);
