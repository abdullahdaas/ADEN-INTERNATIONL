const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Add global background to the top of App layout
const globalBgCode = `
      {/* Global Hero Background Image (Persistent) */}
      <div 
        className="absolute top-0 left-0 w-full h-[800px] z-0 bg-cover bg-center pointer-events-none"
        style={{ 
          backgroundImage: \`url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2075&q=80')\`,
        }}
      />
      <div className="absolute top-0 left-0 w-full h-[800px] z-0 bg-gradient-to-b from-[#050505]/60 via-[#050505]/80 to-[#050505] pointer-events-none" />

      {/* Dynamic Background Mesh Grid */}`;

code = code.replace(
  "{/* Dynamic Background Mesh Grid */}", 
  globalBgCode
);

// 2. Remove the background from inside hero-banner
const localBgRegex = /<div\s+className="absolute inset-0 z-0 bg-cover bg-center"[\s\S]*?to-\[#050505\]" \/>/m;
code = code.replace(localBgRegex, "");

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx background");
