const fs = require('fs');
const https = require('https');

https.get('https://github.com/google/fonts/raw/main/ofl/amiri/Amiri-Regular.ttf', (res) => {
  let chunks = [];
  res.on('data', (chunk) => chunks.push(chunk));
  res.on('end', () => {
    let buffer = Buffer.concat(chunks);
    fs.writeFileSync('public/Amiri-Regular.ttf', buffer);
    let base64 = buffer.toString('base64');
    fs.writeFileSync('src/utils/AmiriFont.ts', `export const AmiriRegular = "${base64}";`);
    console.log("Font downloaded");
  });
});
