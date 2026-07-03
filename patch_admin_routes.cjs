const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

function requireAdmin(routeMatch) {
  return routeMatch.replace(/\(req, res\) => \{/, "(req, res) => {\n  if (req.headers['x-admin'] !== 'true') return res.status(403).json({success: false, message: 'Unauthorized'});");
}

code = code.replace(/app\.get\('\/api\/messages', \(req, res\) => \{/g, "app.get('/api/messages', (req, res) => {\n  if (req.headers['x-admin'] !== 'true') return res.status(403).json({success: false, message: 'Unauthorized'});");
code = code.replace(/app\.get\('\/api\/otp\/logs', \(req, res\) => \{/g, "app.get('/api/otp/logs', (req, res) => {\n  if (req.headers['x-admin'] !== 'true') return res.status(403).json({success: false, message: 'Unauthorized'});");
code = code.replace(/app\.get\('\/api\/profiles', \(req, res\) => \{/g, "app.get('/api/profiles', (req, res) => {\n  if (req.headers['x-admin'] !== 'true') return res.status(403).json({success: false, message: 'Unauthorized'});");

fs.writeFileSync('server.ts', code);
