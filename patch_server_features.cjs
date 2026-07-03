const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const newEndpoints = `
// --- Offers ---
app.get('/api/offers', async (req, res) => {
  const userId = req.headers['x-user-id'];
  const isAdmin = req.headers['x-admin'] === 'true';
  const allOffers = await db.offers.getAll();
  
  if (isAdmin) return res.json(allOffers);
  if (!userId) return res.json([]);
  
  res.json(allOffers.filter(o => o.buyerId === userId || o.ownerId === userId));
});

app.post('/api/offers', async (req, res) => {
  const newOffer = {
    ...req.body,
    id: 'offer-' + Date.now(),
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  await db.offers.add(newOffer);
  res.status(201).json(newOffer);
});

app.put('/api/offers/:id', async (req, res) => {
  const offer = await db.offers.getById(req.params.id);
  if (!offer) return res.status(404).json({error: 'Not found'});
  await db.offers.update(offer.id, req.body);
  res.json(await db.offers.getById(offer.id));
});

// --- Complaints ---
app.post('/api/complaints', async (req, res) => {
  const newComp = {
    ...req.body,
    id: 'comp-' + Date.now(),
    status: 'open',
    createdAt: new Date().toISOString()
  };
  await db.complaints.add(newComp);
  res.status(201).json(newComp);
});

app.get('/api/complaints', async (req, res) => {
  res.json(await db.complaints.getAll());
});

app.put('/api/complaints/:id', async (req, res) => {
  const comp = await db.complaints.getById(req.params.id);
  if (!comp) return res.status(404).json({error: 'Not found'});
  await db.complaints.update(comp.id, req.body);
  res.json(await db.complaints.getById(comp.id));
});

// --- Phone View Increment ---
app.post('/api/properties/:id/phone-view', async (req, res) => {
  const prop = await db.properties.getById(req.params.id);
  if (prop) {
    await db.properties.update(prop.id, {
      phoneViews: (prop.phoneViews || 0) + 1
    });
    res.json({ success: true });
  } else {
    res.status(404).json({error: 'Not found'});
  }
});
`;

if (!code.includes('/api/offers')) {
  code = code.replace("app.get('/api/supervisors'", newEndpoints + "\napp.get('/api/supervisors'");
  fs.writeFileSync('server.ts', code);
  console.log('Added feature endpoints');
} else {
  console.log('Endpoints already exist');
}
