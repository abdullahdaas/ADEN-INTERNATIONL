const fs = require('fs');
let code = fs.readFileSync('src/data/db.ts', 'utf-8');

// Remove Firebase Storage imports
code = code.replace("import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';", "");

// Remove storage init
code = code.replace("export const storage = getStorage(app);", "");

// Remove uploadPropertyImage and deletePropertyImageFromStorage
const uploadRegex = /export const uploadPropertyImage = async \([\s\S]*?\}\s*\}\s*};\s*/;
const deleteRegex = /export const deletePropertyImageFromStorage = async \([\s\S]*?\}\s*};\s*/;

code = code.replace(uploadRegex, "");
code = code.replace(deleteRegex, "");

fs.writeFileSync('src/data/db.ts', code);
console.log("Patched db.ts to remove Firebase Storage.");
