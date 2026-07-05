const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /app\.delete\('\/api\/properties\/:id', requireAuth, async \(req, res\) => {([\s\S]*?)res\.status\(404\)\.json\({ error: 'Property not found' }\);\n  }\n}\);/g;

code = code.replace(regex, (match, p1) => {
  return `app.delete('/api/properties/:id', requireAuth, async (req, res) => {\n  try {\n${p1}res.status(404).json({ error: 'Property not found' });\n  }\n  } catch (error) {\n    console.error("DELETE ERROR:", error);\n    res.status(500).json({ success: false, message: error.message });\n  }\n});`;
});

fs.writeFileSync('server.ts', code);
