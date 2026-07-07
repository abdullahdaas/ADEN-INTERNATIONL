const fs = require('fs');
let code = fs.readFileSync('src/components/CitizenProperties.tsx', 'utf-8');

// Replace import
code = code.replace(
  "import { uploadPropertyImage } from '../data/db';",
  "import { batchUploadToSupabase } from '../data/supabaseStorage';"
);

// Replace handlePropertyImageAdd
const handleImageRegex = /const handlePropertyImageAdd = async \(e: React\.ChangeEvent<HTMLInputElement>\) => \{[\s\S]*?setIsUploadingEditImage\(false\);\s*\}\s*\}\s*\};/m;

const newHandleImageUpload = `const handlePropertyImageAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingEditImage(true);
      console.log("[CitizenProperties handlePropertyImageAdd] Starting Supabase upload for", file.name);
      const startTime = Date.now();
      try {
        const compressed = await compressImage(file);
        const tempId = editingProperty?.id || 'temp';
        
        const urls = await batchUploadToSupabase(tempId, [compressed], (prog) => {
           console.log(\`[CitizenProperties handlePropertyImageAdd] Progress: \${prog}%\`);
        });
        
        if (urls && urls.length > 0) {
          console.log(\`[CitizenProperties handlePropertyImageAdd] Upload complete in \${Date.now() - startTime}ms. URL:\`, urls[0]);
          setEditImages(prev => [...prev, urls[0]]);
        }
      } catch (err: any) {
        console.error("[CitizenProperties handlePropertyImageAdd] Failed to upload edit image", err);
        const errorMsg = err.message || 'Unknown error';
        alert('فشل الرفع: ' + errorMsg);
      } finally {
        setIsUploadingEditImage(false);
      }
    }
  };`;

code = code.replace(handleImageRegex, newHandleImageUpload);

fs.writeFileSync('src/components/CitizenProperties.tsx', code);
console.log("Patched CitizenProperties.tsx for Supabase.");
