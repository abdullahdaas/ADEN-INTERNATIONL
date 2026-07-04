const fs = require('fs');
let code = fs.readFileSync('src/components/ServiceProvidersList.tsx', 'utf8');

const correctHero = `
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-slate-900 to-royal-dark border-b border-white/5 py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-white mb-4">
              مزودي الخدمات
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl">
              دليل شامل لجميع مزودي الخدمات في العراق. ابحث عن مقاولين،
              مهندسين، محامين، وشركات الصيانة الموثوقة والمعتمدة.
            </p>
          </div>
          <button onClick={() => setShowAppModal(true)} className="bg-[#F27D26] hover:bg-[#d96a1a] text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#F27D26]/20 shrink-0">
            <Plus className="w-5 h-5" /> انضم كمزود خدمة
          </button>
        </div>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 bg-slate-900/50 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
`;

code = code.replace(
  /\{\/\* Hero Section \*\/\}[\s\S]*?<div className="flex flex-col md:flex-row gap-4 bg-slate-900\/50 p-4 rounded-2xl border border-white\/10 backdrop-blur-md">/m,
  correctHero
);

fs.writeFileSync('src/components/ServiceProvidersList.tsx', code);
console.log("Patched ServiceProvidersList hero");
