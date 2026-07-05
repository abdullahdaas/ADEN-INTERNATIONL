const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const loggerCode = `
app.use((req, res, next) => {
  const oldSend = res.send;
  res.send = function (data) {
    if (req.method === 'DELETE' || req.method === 'PUT') {
      fs.appendFileSync('req_log.txt', \`[\${new Date().toISOString()}] \${req.method} \${req.url} - Status: \${res.statusCode} - Body: \${data}\\n\`);
    }
    return oldSend.apply(res, arguments);
  };
  next();
});
`;

code = code.replace("app.use(express.json({ limit: '50mb' }));", "app.use(express.json({ limit: '50mb' }));" + loggerCode);
fs.writeFileSync('server.ts', code);
