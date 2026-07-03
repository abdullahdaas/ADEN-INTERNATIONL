const fs = require('fs');
let code = fs.readFileSync('src/utils/api.ts', 'utf-8');

const newMethods = `
export async function fetchOffers(): Promise<any[]> {
  const res = await fetch(\`\${API_BASE}/offers\`, { headers: getAuthHeaders() });
  return res.json();
}

export async function createOffer(offer: any): Promise<any> {
  const res = await fetch(\`\${API_BASE}/offers\`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(offer)
  });
  return res.json();
}

export async function updateOffer(id: string, updates: any): Promise<any> {
  const res = await fetch(\`\${API_BASE}/offers/\${id}\`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates)
  });
  return res.json();
}

export async function createComplaint(complaint: any): Promise<any> {
  const res = await fetch(\`\${API_BASE}/complaints\`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(complaint)
  });
  return res.json();
}

export async function fetchComplaints(): Promise<any[]> {
  const res = await fetch(\`\${API_BASE}/complaints\`, { headers: getAuthHeaders() });
  return res.json();
}

export async function updateComplaint(id: string, updates: any): Promise<any> {
  const res = await fetch(\`\${API_BASE}/complaints/\${id}\`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates)
  });
  return res.json();
}

export async function incrementPhoneViews(id: string): Promise<void> {
  await fetch(\`\${API_BASE}/properties/\${id}/phone-view\`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
}
`;

if (!code.includes('fetchOffers')) {
  code += '\n' + newMethods;
  fs.writeFileSync('src/utils/api.ts', code);
  console.log('Added api methods');
} else {
  console.log('API methods already exist');
}
