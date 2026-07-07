const fs = require('fs');
let code = fs.readFileSync('src/data/db.ts', 'utf-8');

const startIdx = code.indexOf('export const uploadPropertyImage');
const endIdx = code.indexOf('export class FirestoreCollection');

if (startIdx !== -1 && endIdx !== -1) {
  code = code.substring(0, startIdx) + code.substring(endIdx);
  fs.writeFileSync('src/data/db.ts', code);
  console.log("Successfully removed uploadPropertyImage");
}
