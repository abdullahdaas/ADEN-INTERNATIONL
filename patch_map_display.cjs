const fs = require('fs');
let code = fs.readFileSync('src/components/MapDisplay.tsx', 'utf-8');

const fallback = `      <div className="h-48 bg-slate-900 border border-white/5 rounded-lg p-4 flex flex-col items-center justify-center text-center">
        <h2 className="text-white font-bold mb-1 text-[11px]">مفتاح Google Maps API مطلوب</h2>
        <p className="text-[10px] text-slate-400 max-w-[200px] leading-tight">
          أضف المفتاح GOOGLE_MAPS_PLATFORM_KEY في إعدادات Secrets لتفعيل الخريطة.
        </p>
      </div>`;

code = code.replace(/<div className="h-48 bg-slate-900 border border-white\/5 rounded-lg flex items-center justify-center text-xs text-slate-500">[\s\S]*?<\/div>/, fallback);
code = code.replace(/<Map\s+defaultCenter/g, '<Map\n           style={{width: "100%", height: "100%"}}\n           defaultCenter');

fs.writeFileSync('src/components/MapDisplay.tsx', code);
console.log('Patched MapDisplay');
