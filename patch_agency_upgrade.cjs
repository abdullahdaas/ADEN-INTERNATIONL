const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const upgradeBtn = `                {user.role === 'citizen' && (
                  <button
                    onClick={() => {
                      if(window.confirm('هل أنت متأكد من ترقية حسابك إلى مكتب عقاري؟ سيتم إرسال الطلب للإدارة.')) {
                        window.alert('تم إرسال طلب الترقية بنجاح.');
                      }
                    }}
                    className="w-full flex items-center justify-center space-x-2 space-x-reverse rounded-xl border border-gold-prestige/30 bg-gold-prestige/10 hover:bg-gold-prestige/20 py-3 text-xs font-semibold text-gold-prestige transition-all mt-4"
                  >
                    <Star className="h-4 w-4" />
                    <span>الترقية إلى حساب مكتب عقاري (أعمال)</span>
                  </button>
                )}`;

code = code.replace('{/* Sign Out Button */}', upgradeBtn + '\n\n                {/* Sign Out Button */}');

fs.writeFileSync('src/App.tsx', code);
console.log('Patched agency upgrade');
