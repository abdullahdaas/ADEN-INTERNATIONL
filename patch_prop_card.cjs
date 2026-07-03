const fs = require('fs');
let code = fs.readFileSync('src/components/PropertyCard.tsx', 'utf-8');

// Imports
if (!code.includes('BadgeCheck,')) {
  code = code.replace("Heart,", "Heart, BadgeCheck,");
}

// Add verified badge to card title area
const titleBlock = `<div className="mt-3 flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-sm font-bold text-slate-100 line-clamp-1 flex items-center gap-1">
            {property.title}
            {property.isVerified && <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" title="عقار موثق" />}
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">{property.neighborhood}، {property.district}</p>
        </div>`;
code = code.replace(/<div className="mt-3 flex justify-between items-start">\s*<div className="flex-1">\s*<h3 className="text-sm font-bold text-slate-100 line-clamp-1">\{property\.title\}<\/h3>\s*<p className="text-\[10px\] text-slate-400 mt-0\.5">\{property\.neighborhood\}، \{property\.district\}<\/p>\s*<\/div>/, titleBlock);

// Featured border
code = code.replace('className={`group relative flex flex-col', 'className={`group relative flex flex-col ${property.isFeatured ? \'border border-gold-prestige/50 shadow-lg shadow-gold-prestige/10\' : \'border border-white/5\'}');
code = code.replace('overflow-hidden rounded-2xl bg-slate-900 border border-white/5', 'overflow-hidden rounded-2xl bg-slate-900'); // removed hardcoded border

fs.writeFileSync('src/components/PropertyCard.tsx', code);
console.log('Patched PropertyCard');
