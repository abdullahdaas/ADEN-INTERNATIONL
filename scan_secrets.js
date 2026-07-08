const fs = require('fs');
const execSync = require('child_process').execSync;

const files = execSync('git ls-files', { encoding: 'utf8' })
  .split('\n')
  .map(f => f.trim())
  .filter(f => f && fs.existsSync(f) && fs.lstatSync(f).isFile() && f !== 'scan_secrets.js' && !f.includes('package-lock.json'));

const patterns = [
  { name: 'Firebase API key', regex: /Aiza[0-9A-Za-z_-]{20,}/ },
  { name: 'Supabase host', regex: /supabase\.co/ },
  { name: 'JWT-like token', regex: /eyJ[0-9A-Za-z_-]{20,}/ },
  { name: 'Generic assignment', regex: /(api[_-]?key|secret|token|password)\s*[:=]\s*['"][^'"]{8,}['"]/i }
];

files.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split(/\r?\n/);
    lines.forEach((line, index) => {
      patterns.forEach(p => {
        const match = line.match(p.regex);
        if (match) {
          console.log(`${file}:${index + 1}: ${line.trim()}`);
        }
      });
    });
  } catch (e) {}
});
