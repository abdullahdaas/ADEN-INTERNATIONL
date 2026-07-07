const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /<div\s+id="hero-banner"\s+className="relative rounded-3xl border border-white\/5 bg-gradient-to-b from-\[#F27D26\]\/10 to-transparent p-6 sm:p-12 text-center overflow-hidden"\s*>[\s\S]*?<div className="max-w-4xl mx-auto">/m;

const newHero = `<div
              id="hero-banner"
              className="relative rounded-3xl border border-white/5 p-6 sm:p-12 text-center overflow-hidden"
            >
              {/* Background Image with Gradient Overlay */}
              <div 
                className="absolute inset-0 z-0 bg-cover bg-center"
                style={{ 
                  backgroundImage: \`url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2075&q=80')\`,
                }}
              />
              <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#0f172a]/70 to-[#0f172a]" />

              <div className="relative z-10 max-w-3xl mx-auto space-y-4 mb-8">
                <span className="inline-flex flex-wrap items-center gap-2 rounded-full bg-[#F27D26]/20 px-3.5 py-1 text-xs font-bold text-[#F27D26] border border-[#F27D26]/30 backdrop-blur-md">
                  <Award className="h-3.5 w-3.5 animate-pulse" />
                  <span>الوجهة الأذكى لخياراتك العقارية</span>
                </span>
                <h1 className="text-3xl font-black text-white sm:text-5xl leading-normal drop-shadow-lg">
                  {t.sloganTitle}
                </h1>
                <p className="text-sm sm:text-base text-slate-200 leading-relaxed sm:leading-loose max-w-2xl mx-auto font-sans drop-shadow-md">
                  اكتشف مساحتك المثالية مع أدق أدوات البحث. نوفر لك تجربة سلسة وآمنة لبيع، شراء، واستثمار العقارات بمعايير استثنائية وشفافية تامة.
                </p>
              </div>

              {/* Advanced Hierarchical Search Widget */}
              <div className="relative z-10 max-w-4xl mx-auto">`;

if (code.match(regex)) {
  code = code.replace(regex, newHero);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Patched App.tsx for Hero background and text.");
} else {
  console.log("Could not find regex in App.tsx!");
}
