const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const replacement = `app.get('/api/agreements', async (req, res) => {`;

const newRoutes = `// GIS Routes
app.get('/api/gis/:collection', async (req, res) => {
  try {
    const colName = req.params.collection;
    const col = db[colName];
    if (col && typeof col.getAll === 'function') {
      res.json(await col.getAll());
    } else {
      res.status(404).json({ error: 'Collection not found' });
    }
  } catch(e: any) {
    res.status(500).json({ error: e.message });
  }
});
app.post('/api/gis/:collection', async (req, res) => {
  try {
    const colName = req.params.collection;
    const col = db[colName];
    if (col && typeof col.add === 'function') {
      await col.add(req.body);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Collection not found' });
    }
  } catch(e: any) {
    res.status(500).json({ error: e.message });
  }
});
app.put('/api/gis/:collection/:id', async (req, res) => {
  try {
    const colName = req.params.collection;
    const col = db[colName];
    if (col && typeof col.update === 'function') {
      await col.update(req.params.id, req.body);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Collection not found' });
    }
  } catch(e: any) {
    res.status(500).json({ error: e.message });
  }
});
app.delete('/api/gis/:collection/:id', async (req, res) => {
  try {
    const colName = req.params.collection;
    const col = db[colName];
    if (col && typeof col.remove === 'function') {
      await col.remove(req.params.id);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Collection not found' });
    }
  } catch(e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/agreements', async (req, res) => {`;

code = code.replace(replacement, newRoutes);
fs.writeFileSync('server.ts', code);
console.log("Patched server.ts");
