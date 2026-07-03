const fs = require('fs');
let code = fs.readFileSync('src/utils/api.ts', 'utf-8');

code = code.replace(/fetch\(\`\$\{API_BASE\}\/properties\?\$\{params\.toString\(\)\}\`\)/, "fetch(`${API_BASE}/properties?${params.toString()}`, { headers: getAuthHeadersGET() })");
code = code.replace(/fetch\(\`\$\{API_BASE\}\/properties\/\$\{id\}\`\)/, "fetch(`${API_BASE}/properties/${id}`, { headers: getAuthHeadersGET() })");
code = code.replace(/fetch\(\`\$\{API_BASE\}\/agents\`\)/g, "fetch(`${API_BASE}/agents`, { headers: getAuthHeadersGET() })");
code = code.replace(/fetch\(\`\$\{API_BASE\}\/agents\/\$\{id\}\`\)/g, "fetch(`${API_BASE}/agents/${id}`, { headers: getAuthHeadersGET() })");
code = code.replace(/fetch\(\`\$\{API_BASE\}\/deals\`\)/g, "fetch(`${API_BASE}/deals`, { headers: getAuthHeadersGET() })");
code = code.replace(/fetch\(\`\$\{API_BASE\}\/messages\`\)/g, "fetch(`${API_BASE}/messages`, { headers: getAuthHeadersGET() })");
code = code.replace(/method: 'PUT'\n\s+\}\)/g, "method: 'PUT',\n    headers: getAuthHeaders()\n  })");
code = code.replace(/fetch\(\`\$\{API_BASE\}\/stats\`\)/g, "fetch(`${API_BASE}/stats`, { headers: getAuthHeadersGET() })");
code = code.replace(/fetch\(\`\$\{API_BASE\}\/supervisors\`\)/g, "fetch(`${API_BASE}/supervisors`, { headers: getAuthHeadersGET() })");
code = code.replace(/fetch\(\`\$\{API_BASE\}\/supervisors\/\$\{id\}\`,\s*\{\n\s*method: 'DELETE'\n\s*\}\)/, "fetch(`${API_BASE}/supervisors/${id}`, {\n    method: 'DELETE',\n    headers: getAuthHeaders()\n  })");
code = code.replace(/fetch\(\`\$\{API_BASE\}\/profiles\/\$\{encodeURIComponent\(identity\)\}\`\)/, "fetch(`${API_BASE}/profiles/${encodeURIComponent(identity)}`, { headers: getAuthHeadersGET() })");
code = code.replace(/fetch\(\`\$\{API_BASE\}\/profiles\`\)/, "fetch(`${API_BASE}/profiles`, { headers: getAuthHeadersGET() })");
code = code.replace(/fetch\(\`\$\{API_BASE\}\/settings\`\)/, "fetch(`${API_BASE}/settings`, { headers: getAuthHeadersGET() })");

fs.writeFileSync('src/utils/api.ts', code);
console.log('Patched API calls');
