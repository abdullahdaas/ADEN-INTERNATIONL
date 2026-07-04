const fs = require('fs');
let code = fs.readFileSync('src/utils/api.ts', 'utf8');

const gisApi = `
// GIS Data Management
export async function getGisCollection(collection: string) {
  const res = await fetch(\`\${API_BASE}/gis/\${collection}\`);
  return res.json();
}
export async function addGisItem(collection: string, data: any) {
  const res = await fetch(\`\${API_BASE}/gis/\${collection}\`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
}
export async function updateGisItem(collection: string, id: string, data: any) {
  const res = await fetch(\`\${API_BASE}/gis/\${collection}/\${id}\`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
}
export async function deleteGisItem(collection: string, id: string) {
  const res = await fetch(\`\${API_BASE}/gis/\${collection}/\${id}\`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return res.json();
}
`;

code = code + gisApi;
fs.writeFileSync('src/utils/api.ts', code);
console.log("Patched api.ts with GIS functions");
