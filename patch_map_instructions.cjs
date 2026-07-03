const fs = require('fs');

const fallback = `      <div className="h-full bg-slate-900 border border-white/5 rounded-lg p-6 flex flex-col items-center justify-center text-center">
        <h2 className="text-white font-bold mb-2 text-sm">مفتاح Google Maps API مطلوب</h2>
        <p className="text-xs text-slate-400 mb-4 max-w-sm">
          الخطوة 1: احصل على مفتاح من <a href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais" target="_blank" rel="noopener" className="text-blue-400 underline">Google Cloud Console</a>.<br/><br/>
          الخطوة 2: أضف المفتاح في إعدادات AI Studio:<br/>
          - افتح الإعدادات (⚙️)<br/>
          - اختر Secrets<br/>
          - اكتب GOOGLE_MAPS_PLATFORM_KEY والصق المفتاح.<br/>
        </p>
      </div>`;

// Patch MapLocationPicker
let code1 = fs.readFileSync('src/components/MapLocationPicker.tsx', 'utf-8');
code1 = code1.replace(/<div className="h-64 bg-slate-900 border border-white\/5 rounded-lg flex items-center justify-center text-xs text-slate-500">[\s\S]*?<\/div>/, fallback.replace('h-full', 'h-64'));
fs.writeFileSync('src/components/MapLocationPicker.tsx', code1);

// Patch MapSearch
let code2 = fs.readFileSync('src/components/MapSearch.tsx', 'utf-8');
code2 = code2.replace(/<div className="h-full min-h-\[500px\] bg-slate-900 border border-white\/5 rounded-2xl flex items-center justify-center text-sm text-slate-500">[\s\S]*?<\/div>/, fallback.replace('h-full', 'h-[80vh] w-full'));
fs.writeFileSync('src/components/MapSearch.tsx', code2);

console.log('Patched map instructions');
