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
let changedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    content = content.replace(/bg-\[\#050505\]/g, 'bg-royal-dark');
    content = content.replace(/from-\[\#050505\]/g, 'from-royal-dark');
    content = content.replace(/to-\[\#050505\]/g, 'to-royal-dark');
    content = content.replace(/via-\[\#050505\]/g, 'via-royal-dark');
    content = content.replace(/border-\[\#050505\]/g, 'border-royal-dark');
    
    if (content !== original) {
        fs.writeFileSync(file, content);
        changedCount++;
    }
});

console.log("Changed files:", changedCount);
