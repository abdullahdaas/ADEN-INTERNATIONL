const fs = require('fs');
let code = fs.readFileSync('src/data/db.ts', 'utf8');

code = code.replace("return snap.docs?.map(d => d.data() as T);", "return snap.docs?.map(d => ({ id: d.id, ...d.data() } as T));");
code = code.replace("return snap.exists() ? snap.data() as T : null;", "return snap.exists() ? { id: snap.id, ...snap.data() } as T : null;");

fs.writeFileSync('src/data/db.ts', code);
console.log("Updated db.ts to include document IDs");
