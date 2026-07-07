const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf-8');

// The sed command `sed -i 's/name: string;/name: string;\n  ownerName?: string;\n  whatsapp?: string;/' src/types.ts`
// duplicated ownerName and whatsapp everywhere `name: string;` was found.
// The sed command `sed -i 's/governorate: string;/governorate: string;\n  district?: string;\n  neighborhood?: string;/' src/types.ts`
// duplicated district and neighborhood everywhere `governorate: string;` was found.

// Since I have a backup of types.ts? No I don't.
// Let's just do a clean replace for the duplicate fields.

// I will just download a fresh types.ts if I could but I can just clean it up with regex.
// Wait, I can just remove all `  ownerName?: string;\n  whatsapp?: string;\n` that come after `name: string;\n` except inside ServiceProvider.
