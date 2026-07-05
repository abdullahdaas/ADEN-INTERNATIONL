const fs = require('fs');
let code = fs.readFileSync('src/utils/api.ts', 'utf8');
code = code.replace("export async function deleteProperty(id: string, hard = false): Promise<boolean> {", "export async function deleteProperty(id: string, hard = false): Promise<boolean> { console.log('deleteProperty called. Token:', localStorage.getItem('aden-admin-token'), 'Headers:', getAuthHeaders());");
fs.writeFileSync('src/utils/api.ts', code);
