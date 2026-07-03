const fs = require('fs');
let code = fs.readFileSync('src/components/PropertyDetails.tsx', 'utf-8');

// 1. Badge import
if (!code.includes('BadgeCheck,')) {
  code = code.replace("MessageSquare,", "MessageSquare, BadgeCheck, Phone, Banknote, ShieldAlert,");
}

// 2. Verified Badge UI
const titleBlock = `              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">
                    {property.title}
                  </h1>
                  {property.isVerified && (
                    <div className="flex items-center gap-1 bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded border border-emerald-500/30 text-[10px] font-bold" title="عقار موثق - تم مراجعة المستندات">
                      <BadgeCheck className="w-4 h-4" />
                      <span>عقار موثق</span>
                    </div>
                  )}
                </div>`;
code = code.replace(/<div className="flex-1">\s*<h1 className="text-2xl md:text-3xl font-black text-white leading-tight mb-2">\s*\{property\.title\}\s*<\/h1>/, titleBlock);


// 3. Smart Valuation block
const smartValuationStr = `            {/* Smart Valuation */}
            <div className="mt-6 p-4 rounded-xl border border-blue-500/20 bg-blue-500/5">
              <h3 className="text-blue-400 font-bold text-xs mb-2 flex items-center gap-1">
                <Banknote className="h-4 w-4" />
                التقييم الذكي للسعر (تقديري)
              </h3>
              <div className="flex justify-between items-end">
                <div className="text-xs text-slate-400 w-2/3 leading-relaxed">
                  بناءً على مساحة العقار ({property.space} م²) وموقعه ({property.district})، نقدر أن سعر هذا العقار العادل في السوق هو:
                </div>
                <div className="text-sm font-bold text-white bg-slate-900 px-3 py-1.5 rounded-lg border border-white/10">
                  {Math.round((property.price || 0) * 0.95).toLocaleString('ar-IQ')} د.ع - {Math.round((property.price || 0) * 1.05).toLocaleString('ar-IQ')} د.ع
                </div>
              </div>
            </div>`;

code = code.replace('{/* Documents Section */}', smartValuationStr + '\n\n            {/* Documents Section */}');

// 4. Contact Buttons modifications (Phone hide and Make Offer)
const contactButtonsStr = `              {/* Contact Actions */}
              <div className="space-y-2 mt-4">
                <button
                  onClick={async () => {
                    if (!showPhone) {
                      setShowPhone(true);
                      try {
                        await fetch(\`/api/properties/\${property.id}/phone-view\`, { method: 'POST', headers: {'x-user-id': user?.emailOrPhone || ''} });
                      } catch(e) {}
                    }
                  }}
                  className="w-full flex items-center justify-center space-x-2 space-x-reverse rounded-xl bg-gold-prestige py-3 text-xs font-bold text-slate-900 transition-all hover:bg-white"
                >
                  <Phone className="h-4 w-4" />
                  <span>{showPhone ? (property.advertiserPhone || property.ownerEmailOrPhone || agent.phone) : 'إظهار رقم الهاتف'}</span>
                </button>
                
                <button
                  onClick={() => {
                    if (!user) return window.alert('يجب تسجيل الدخول لتقديم عرض شراء.');
                    setShowOfferModal(true);
                  }}
                  className="w-full flex items-center justify-center space-x-2 space-x-reverse rounded-xl border border-gold-prestige/30 bg-slate-900/50 hover:bg-gold-prestige/10 py-3 text-xs font-bold text-gold-prestige transition-all"
                >
                  <Banknote className="h-4 w-4" />
                  <span>تقديم عرض شراء</span>
                </button>
              </div>`;
              
code = code.replace(/<div className="space-y-2 mt-4">[\s\S]*?<a href={`tel:.*?className="w-full flex items-center justify-center space-x-2 space-x-reverse rounded-xl bg-gold-prestige py-3 text-xs font-bold text-slate-900 transition-all hover:bg-white"[\s\S]*?<\/a>/, contactButtonsStr);

fs.writeFileSync('src/components/PropertyDetails.tsx', code);
console.log('Patched PropertyDetails basic blocks');
