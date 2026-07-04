const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const agreementGet = "app.get('/api/agreements/:id', async (req, res) => {";
const index = code.indexOf(agreementGet);

if (index !== -1) {
  const insert = `app.put('/api/agreements/:id', async (req, res) => {
  try {
    const agreement = await db.agreements.getById(req.params.id);
    if (!agreement) {
      res.status(404).json({ success: false, error: 'Not found' });
      return;
    }
    const updates = req.body;
    await db.agreements.update(req.params.id, updates);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});\n\n`;
  code = code.substring(0, index) + insert + code.substring(index);
  fs.writeFileSync('server.ts', code);
  console.log("Patched server.ts");
}
