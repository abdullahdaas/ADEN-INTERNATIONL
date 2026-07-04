const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const insertCode = `
// Service Providers
app.get('/api/service-providers', async (req, res) => {
  res.json(await db.serviceProviders.getAll());
});
app.post('/api/service-providers', async (req, res) => {
  await db.serviceProviders.add(req.body);
  res.json({ success: true, provider: req.body });
});
app.put('/api/service-providers/:id', async (req, res) => {
  await db.serviceProviders.update(req.params.id, req.body);
  res.json({ success: true });
});
app.delete('/api/service-providers/:id', async (req, res) => {
  await db.serviceProviders.remove(req.params.id);
  res.json({ success: true });
});

// Provider Applications
app.get('/api/provider-applications', async (req, res) => {
  res.json(await db.providerApplications.getAll());
});
app.post('/api/provider-applications', async (req, res) => {
  await db.providerApplications.add(req.body);
  res.json({ success: true, application: req.body });
});
app.put('/api/provider-applications/:id', async (req, res) => {
  await db.providerApplications.update(req.params.id, req.body);
  res.json({ success: true });
});
`;

code = code.replace(
  "app.get('/api/agreements', async (req, res) => {",
  insertCode + "\napp.get('/api/agreements', async (req, res) => {"
);

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts for providers");
