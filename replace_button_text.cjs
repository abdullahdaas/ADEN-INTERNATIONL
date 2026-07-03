const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.resolve(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('./src');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // If a line has bg-[#F27D26] and text-white, replace text-white with text-[#ffffff]
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if ((lines[i].includes('bg-[#F27D26]') || lines[i].includes('bg-red-500') || lines[i].includes('bg-emerald-500') || lines[i].includes('bg-green-500')) && lines[i].includes('text-white')) {
            lines[i] = lines[i].replace(/text-white/g, 'text-[#ffffff]');
        }
    }
    content = lines.join('\n');
    
    if (content !== original) {
        fs.writeFileSync(file, content);
        console.log("Updated buttons in:", file);
    }
});
