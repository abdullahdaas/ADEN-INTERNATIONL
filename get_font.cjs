const fs = require('fs');
const https = require('https');

https.get('https://github.com/google/fonts/raw/main/ofl/cairo/Cairo-Regular.ttf', (res) => {
  let chunks = [];
  res.on('data', (chunk) => chunks.push(chunk));
  res.on('end', () => {
    let buffer = Buffer.concat(chunks);
    let base64 = buffer.toString('base64');
    fs.writeFileSync('src/utils/CairoFont.ts', `export const CairoRegular = "${base64}";`);
    console.log("Font downloaded");
  });
}).on('error', (e) => {
  console.log("Error", e);
});
