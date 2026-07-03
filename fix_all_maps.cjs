const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // We only want to replace .map( with ?.map( where the object could be undefined.
      // E.g. array.map( -> array?.map(
      // We should be careful about replacing already optional maps: ??.map(
      // So we replace `.map(` with `?.map(` but if it's already `?.map(`, we don't.
      
      content = content.replace(/(?<!\?)\.map\(/g, '?.map(');
      fs.writeFileSync(fullPath, content);
    }
  }
}

processDir('src');
console.log('Done mapping.');
