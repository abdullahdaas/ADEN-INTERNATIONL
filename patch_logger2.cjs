const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const loggerCode = `
app.use((req, res, next) => {
  const oldJson = res.json;
  res.json = function(data) {
    if (req.method === 'DELETE' || req.method === 'PUT') {
      console.log(\`[\${new Date().toISOString()}] \${req.method} \${req.url} - Status: \${res.statusCode} - Body: \${JSON.stringify(data)} - Auth: \${req.headers.authorization}\`);
    }
    return oldJson.apply(res, arguments);
  };
  next();
});
`;

code = code.replace("app.use(express.json({ limit: '50mb' }));", "app.use(express.json({ limit: '50mb' }));" + loggerCode);
fs.writeFileSync('server.ts', code);
