const fs = require('fs');
let config = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
if (!config.exclude) config.exclude = [];
if (!config.exclude.includes('dist')) config.exclude.push('dist');
fs.writeFileSync('tsconfig.json', JSON.stringify(config, null, 2));
