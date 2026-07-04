const fs = require('fs');
let code = fs.readFileSync('src/utils/api.ts', 'utf8');

if (!code.includes('fetchAgreements')) {
  code += `\n\nexport const fetchAgreements = async (): Promise<any[]> => {
  const res = await fetch('/api/agreements');
  if (!res.ok) throw new Error('Failed to fetch agreements');
  return res.json();
};\n
export const updateAgreementStatus = async (id: string, status: string): Promise<any> => {
  const res = await fetch('/api/agreements/' + id, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Failed to update agreement');
  return res.json();
};\n`;
  fs.writeFileSync('src/utils/api.ts', code);
  console.log("Patched api.ts");
}
