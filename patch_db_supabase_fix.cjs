const fs = require('fs');
let code = fs.readFileSync('src/data/db.ts', 'utf-8');

// The function starts at export const uploadPropertyImage and ends at the next export
const startIdx = code.indexOf('export const uploadPropertyImage');
if (startIdx !== -1) {
  const endIdx = code.indexOf('export const deletePropertyImageFromStorage', startIdx);
  if (endIdx !== -1) {
    const endOfDelete = code.indexOf('export class FirestoreCollection', endIdx);
    if (endOfDelete !== -1) {
      code = code.substring(0, startIdx) + code.substring(endOfDelete);
    }
  }
}

fs.writeFileSync('src/data/db.ts', code);
console.log("Successfully removed old functions from db.ts");
