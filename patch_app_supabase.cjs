const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Replace import
code = code.replace(
  'import { uploadPropertyImage } from "./data/db";',
  'import { batchUploadToSupabase } from "./data/supabaseStorage";'
);

// Replace handleImageUpload
const handleImageRegex = /const handleImageUpload = async \(e: React\.ChangeEvent<HTMLInputElement>\) => \{[\s\S]*?setUploadProgress\(0\);\s*\}/m;

const newHandleImageUpload = `const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setIsUploadingImage(true);
    setUploadProgress(0);
    setUploadError('');
    
    console.log("[handleImageUpload] Starting Supabase upload for", files.length, "files");
    const startTimeTotal = Date.now();
    
    const tempPropertyId = 'temp_' + Date.now() + Math.random().toString(36).substring(2,7);
    
    try {
      // First compress all files
      const compressedFiles = await Promise.all(
        Array.from(files).map(file => compressImage(file))
      );

      // Then batch upload to Supabase
      const results = await batchUploadToSupabase(tempPropertyId, compressedFiles, (prog) => {
        setUploadProgress(prog);
      });
      
      console.log(\`[handleImageUpload] All promises resolved in \${Date.now() - startTimeTotal}ms. URLs:\`, results);
      
      setUploadedImages((prev) => [...prev, ...results]);
      setIsUploadingImage(false);
      setUploadProgress(100);
      
      // Delay resetting progress to let the user see 100%
      setTimeout(() => setUploadProgress(0), 1000);
      
    } catch (err: any) {
      console.error("[handleImageUpload] Caught error:", err);
      const errorMsg = err.message || 'Unknown error';
      setUploadError(lang === 'ar' ? \`فشل الرفع: \${errorMsg}\` : \`Upload failed: \${errorMsg}\`);
      setIsUploadingImage(false);
      setUploadProgress(0);
    }
  }`;

code = code.replace(handleImageRegex, newHandleImageUpload);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx for Supabase.");
