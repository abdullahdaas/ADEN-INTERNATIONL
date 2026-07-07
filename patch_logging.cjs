const fs = require('fs');
let code = fs.readFileSync('src/data/db.ts', 'utf-8');

const regex = /export const uploadPropertyImage = async \([\s\S]*?\};\s*$/m;

const newUploadPropertyImage = `export const uploadPropertyImage = async (propertyId: string, file: File, onProgress?: (progress: number) => void): Promise<string> => {
  console.log("[uploadPropertyImage] بدء رفع الصورة:", file.name, "الحجم:", file.size);
  const startTime = Date.now();
  const extension = file.name.split('.').pop() || 'webp';
  const fileName = \`\${Date.now()}-\${Math.random().toString(36).substring(2, 7)}.\${extension}\`;
  
  try {
    const storageRef = ref(storage, \`properties/\${propertyId}/\${fileName}\`);
    console.log("[uploadPropertyImage] Storage Ref created for:", storageRef.fullPath);
    
    const uploadTask = uploadBytesResumable(storageRef, file);

    return await new Promise((resolve, reject) => {
      let isFinished = false;
      
      const timeout = setTimeout(() => {
        if (!isFinished) {
          console.error("[uploadPropertyImage] انتهى وقت الرفع (15 ثانية) - قد يكون Firebase Storage غير مفعل أو هناك مشكلة في CORS");
          uploadTask.cancel();
          reject(new Error("Upload timed out. Storage bucket might not be initialized or CORS issue."));
        }
      }, 15000);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(\`[uploadPropertyImage] تقدم الرفع: \${progress.toFixed(2)}%\`);
          if (onProgress) onProgress(progress);
        },
        (error) => {
          isFinished = true;
          clearTimeout(timeout);
          console.error("[uploadPropertyImage] خطأ من Firebase Storage:", error);
          reject(error);
        },
        async () => {
          isFinished = true;
          clearTimeout(timeout);
          console.log(\`[uploadPropertyImage] اكتمل الرفع في \${Date.now() - startTime}ms\`);
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log(\`[uploadPropertyImage] رابط الصورة: \${downloadURL}\`);
            resolve(downloadURL);
          } catch (err) {
            console.error("[uploadPropertyImage] خطأ أثناء جلب الرابط:", err);
            reject(err);
          }
        }
      );
    });
  } catch (error) {
    console.error("[uploadPropertyImage] خطأ عام أثناء تجهيز الرفع:", error);
    throw error;
  }
};
`;

if (code.match(regex)) {
  code = code.replace(regex, newUploadPropertyImage);
  fs.writeFileSync('src/data/db.ts', code);
  console.log("Patched db.ts with upload logging.");
} else {
  console.log("Could not patch db.ts!");
}
