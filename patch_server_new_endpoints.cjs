const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const newEndpoints = `
// --- Visits Endpoints ---
app.get('/api/visits', async (req, res) => {
  const isAdmin = req.headers['x-admin'] === 'true';
  const userId = req.headers['x-user-id'] as string;
  const visits = await db.visits.getAll();

  if (isAdmin) {
    return res.json(visits);
  }

  if (!userId) {
    return res.json([]);
  }

  // user's visits (either they requested it, or they are the owner)
  const userVisits = visits.filter(v => 
    (v.requesterPhone && v.requesterPhone.toLowerCase() === userId.toLowerCase()) || 
    (v.ownerId && v.ownerId.toLowerCase() === userId.toLowerCase())
  );
  res.json(userVisits);
});

app.post('/api/visits', async (req, res) => {
  const newVisit = {
    ...req.body,
    id: 'visit-' + Date.now(),
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  await db.visits.add(newVisit);
  
  // Log activity
  await db.activityLogs.add({
    id: 'log-' + Date.now(),
    userId: req.body.requesterId || 'guest',
    userName: req.body.requesterName || 'Guest',
    action: 'BOOK_VISIT',
    details: 'Booked a visit for property ' + req.body.propertyId,
    timestamp: new Date().toISOString()
  });

  res.status(201).json(newVisit);
});

app.put('/api/visits/:id', async (req, res) => {
  const visit = await db.visits.getById(req.params.id);
  if (!visit) return res.status(404).json({ error: 'Not found' });
  
  await db.visits.update(visit.id, req.body);
  const updated = await db.visits.getById(visit.id);
  res.json(updated);
});

// --- Auction Endpoints ---
app.get('/api/auctions/:propertyId/participants', async (req, res) => {
  const participants = await db.auctionParticipants.getAll();
  res.json(participants.filter(p => p.propertyId === req.params.propertyId));
});

app.post('/api/auctions/:propertyId/bids', async (req, res) => {
  const { userId, userName, amount } = req.body;
  const propId = req.params.propertyId;
  const prop = await db.properties.getById(propId);
  if (!prop) return res.status(404).json({ error: 'Property not found' });
  
  if (amount <= (prop.highestBid || prop.startingPrice || 0)) {
    return res.status(400).json({ error: 'Bid must be higher than current highest bid' });
  }

  const newBid = {
    id: 'bid-' + Date.now(),
    propertyId: propId,
    userId,
    userName,
    amount,
    createdAt: new Date().toISOString()
  };
  await db.bids.add(newBid);
  await db.properties.update(propId, {
    highestBid: amount,
    highestBidderId: userId
  });
  
  // Log activity
  await db.activityLogs.add({
    id: 'log-' + Date.now(),
    userId: userId || 'guest',
    userName: userName || 'Guest',
    action: 'PLACE_BID',
    details: 'Placed bid of ' + amount + ' on property ' + propId,
    timestamp: new Date().toISOString()
  });

  res.status(201).json(newBid);
});

app.get('/api/auctions/:propertyId/bids', async (req, res) => {
  const bids = await db.bids.getAll();
  res.json(bids.filter(b => b.propertyId === req.params.propertyId).sort((a, b) => b.amount - a.amount));
});
`;

if (!code.includes('/api/visits')) {
  code = code.replace("app.get('/api/supervisors'", newEndpoints + "\napp.get('/api/supervisors'");
  fs.writeFileSync('server.ts', code);
  console.log('Added new endpoints');
} else {
  console.log('Endpoints already exist');
}
