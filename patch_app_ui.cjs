const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /catch \(err: any\) \{\s*console\.error\("\[handleImageUpload\] Caught error in Promise\.all:", err\);\s*setUploadError\([\s\S]*?\);\s*setIsUploadingImage\(false\);\s*setUploadProgress\(0\);\s*\}/;

const newCatch = `catch (err: any) {
      console.error("[handleImageUpload] Caught error in Promise.all:", err);
      // Extra details for Firebase errors
      const errorMsg = err.code ? \`\${err.code} - \${err.message}\` : err.message;
      setUploadError(lang === 'ar' ? \`فشل الرفع: \${errorMsg}\` : \`Upload failed: \${errorMsg}\`);
      setIsUploadingImage(false);
      setUploadProgress(0);
    }`;

if (code.match(regex)) {
  code = code.replace(regex, newCatch);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Patched App.tsx error handling");
}

let citCode = fs.readFileSync('src/components/CitizenProperties.tsx', 'utf-8');
const citRegex = /catch \(err: any\) \{\s*console\.error\("\[CitizenProperties handlePropertyImageAdd\] Failed to upload edit image", err\);\s*alert\([\s\S]*?\);\s*\}/;
const citNewCatch = `catch (err: any) {
        console.error("[CitizenProperties handlePropertyImageAdd] Failed to upload edit image", err);
        const errorMsg = err.code ? \`\${err.code} - \${err.message}\` : err.message;
        alert('فشل الرفع: ' + errorMsg);
      }`;

if (citCode.match(citRegex)) {
  citCode = citCode.replace(citRegex, citNewCatch);
  fs.writeFileSync('src/components/CitizenProperties.tsx', citCode);
  console.log("Patched CitizenProperties error handling");
}
