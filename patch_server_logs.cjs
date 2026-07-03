const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const logsEndpoint = `
app.post('/api/logs', async (req, res) => {
  const newLog = {
    ...req.body,
    id: 'log-' + Date.now(),
    timestamp: new Date().toISOString()
  };
  await db.activityLogs.add(newLog);
  res.status(201).json(newLog);
});
`;

if (!code.includes('/api/logs"')) {
  code = code.replace("app.get('/api/logs'", logsEndpoint + "\napp.get('/api/logs'");
  fs.writeFileSync('server.ts', code);
  console.log('Added logs endpoint');
} else {
  console.log('Logs endpoint already exists');
}
