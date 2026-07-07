const fs = require('fs');
let code = fs.readFileSync('src/components/Header.tsx', 'utf-8');

const regex = /<div \n          className="flex shrink-0 cursor-pointer items-center gap-2 select-none"[\s\S]*?<div className="hidden md:flex items-center justify-end gap-1\.5 xl:gap-3 flex-1 min-w-0">/;

const newHeader = `<div 
          className="flex shrink-0 cursor-pointer items-center gap-3 select-none px-2"
          onClick={() => setView('home')}
          onDoubleClick={onLogoDoubleClick}
          title={t.doubleClickAdminTip}
        >
          <div className="animate-float hover:scale-105 transition-transform duration-300">
            <AdenLogo size={42} className="w-10 h-10 md:w-11 md:h-11 xl:w-12 xl:h-12" />
          </div>
        </div>

        {/* Desktop Navigation & Controls (Visible on md and up - >= 768px) */}
        <div className="hidden md:flex items-center justify-end gap-3 xl:gap-5 flex-1 min-w-0">`;

if (code.match(regex)) {
  code = code.replace(regex, newHeader);
  console.log("Matched and replaced branding section");
}

code = code.replace(
  /<nav className="flex items-center gap-0\.5 xl:gap-1\.5 bg-white\/5 rounded-full px-1 py-1 xl:px-2 xl:py-1\.5 border border-white\/5 shadow-inner shrink min-w-0">/g,
  '<nav className="flex items-center gap-1.5 xl:gap-2.5 bg-white/5 rounded-full px-2 py-1.5 xl:px-3 xl:py-2 border border-white/5 shadow-inner shrink min-w-0">'
);

code = code.replace(
  /gap-1\.5 xl:gap-2 rounded-full px-2 py-1\.5 xl:px-4 xl:py-1\.5 text-\[10px\] xl:text-xs/g,
  'gap-2 xl:gap-2.5 rounded-full px-3 py-2 xl:px-5 xl:py-2 text-[11px] xl:text-sm'
);

code = code.replace(
  /h-3\.5 w-3\.5 xl:h-4 xl:w-4/g,
  'h-4 w-4 xl:h-5 xl:w-5'
);

code = code.replace(
  /absolute -top-1 -right-1 flex h-3\.5 w-3\.5 xl:h-4 xl:w-4 text-\[8px\] xl:text-\[9px\]/g,
  'absolute -top-1.5 -right-1.5 flex h-4 w-4 xl:h-5 xl:w-5 text-[9px] xl:text-[10px]'
);

code = code.replace(
  /<div className="flex items-center gap-1 xl:gap-2 shrink-0 md:border-r border-white\/10 md:pr-2 xl:pr-3">/,
  '<div className="flex items-center gap-2 xl:gap-3 shrink-0 md:border-r border-white/10 md:pr-3 xl:pr-4">'
);

code = code.replace(
  /flex h-8 w-8 xl:h-10 xl:w-auto xl:px-3/g,
  'flex h-9 w-9 xl:h-11 xl:w-auto xl:px-4'
);

code = code.replace(
  /flex h-8 w-8 xl:h-10 xl:w-10/g,
  'flex h-9 w-9 xl:h-11 xl:w-11'
);

code = code.replace(
  /absolute -top-1 -right-1 flex h-3\.5 w-3\.5 xl:h-4 xl:w-4 items-center justify-center rounded-full bg-white text-\[#F27D26\] text-\[8px\] xl:text-\[9px\] font-black shadow-sm/g,
  'absolute -top-1.5 -right-1.5 flex h-4 w-4 xl:h-5 xl:w-5 items-center justify-center rounded-full bg-white text-[#F27D26] text-[9px] xl:text-[10px] font-black shadow-sm'
);

fs.writeFileSync('src/components/Header.tsx', code);
