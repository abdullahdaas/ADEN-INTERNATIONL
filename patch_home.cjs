const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const featuredSection = `
        {view === 'explore' && properties.filter(p => p.isFeatured && p.isApproved).length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
              <Star className="w-5 h-5 text-gold-prestige" />
              <h2 className="text-xl font-bold text-white tracking-wide">{lang === 'ar' ? 'العقارات المميزة' : 'Featured Properties'}</h2>
            </div>
            <div className="flex overflow-x-auto pb-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto hide-scrollbar snap-x gap-4">
              {properties.filter(p => p.isFeatured && p.isApproved).map(p => (
                <div key={p.id} className="min-w-[280px] sm:min-w-[320px] snap-start">
                  <PropertyCard property={p} onClick={() => { setSelectedProperty(p); setView('details'); }} />
                </div>
              ))}
            </div>
          </div>
        )}`;

code = code.replace(/\{view === 'explore' && \(\s*<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3/g, featuredSection + '\n\n        {view === \'explore\' && (\n          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3');

// Map drawing button
const mapDrawBtn = `
                <button 
                  onClick={() => window.alert(lang === 'ar' ? 'سيتم إطلاق ميزة الرسم على الخريطة قريباً لتحديد مناطق البحث بدقة.' : 'Map drawing search will be available soon.')}
                  className="absolute top-4 right-4 z-10 bg-slate-900 border border-gold-prestige/50 text-gold-prestige p-2 rounded-xl shadow-lg hover:bg-gold-prestige/10 transition-all flex items-center gap-2 text-xs font-bold"
                >
                  <MapPin className="w-4 h-4" />
                  {lang === 'ar' ? 'بحث بالرسم على الخريطة' : 'Draw to Search'}
                </button>`;

code = code.replace(/<div className="absolute inset-0 bg-\[#020813\]">/, '<div className="absolute inset-0 bg-[#020813]">' + mapDrawBtn);

fs.writeFileSync('src/App.tsx', code);
console.log('Patched home with featured and map button');
