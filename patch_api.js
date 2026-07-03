const fs = require('fs');
let code = fs.readFileSync('src/utils/api.ts', 'utf8');

// Add getAuthHeaders
const authHelper = `
function getAuthHeaders(): HeadersInit {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  try {
    const user = localStorage.getItem('aden-user');
    if (user) {
      const parsed = JSON.parse(user);
      if (parsed.emailOrPhone) {
        headers['x-user-id'] = parsed.emailOrPhone;
      }
    }
  } catch (e) {}
  return headers;
}

function getAuthHeadersGET(): HeadersInit {
  const headers: Record<string, string> = {};
  try {
    const user = localStorage.getItem('aden-user');
    if (user) {
      const parsed = JSON.parse(user);
      if (parsed.emailOrPhone) {
        headers['x-user-id'] = parsed.emailOrPhone;
      }
    }
  } catch (e) {}
  return headers;
}
`;

if (!code.includes('getAuthHeaders')) {
  code = code.replace("export async function fetchProperties", authHelper + "\nexport async function fetchProperties");
}

code = code.replace(/headers: \{ 'Content-Type': 'application\/json' \}/g, "headers: getAuthHeaders()");

// For GET requests, we need to add headers too, e.g. fetchProperties
code = code.replace(/const res = await fetch\(\`\$\{API_BASE\}\/properties\$\{queryStr\}\`\);/g, "const res = await fetch(`${API_BASE}/properties${queryStr}`, { headers: getAuthHeadersGET() });");

// And fetchPayments
code = code.replace(/const res = await fetch\(\`\$\{API_BASE\}\/payments\`\);/g, "const res = await fetch(`${API_BASE}/payments`, { headers: getAuthHeadersGET() });");

fs.writeFileSync('src/utils/api.ts', code);
