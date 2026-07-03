const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Update Role selector in Auth block
const roleSelector = `<div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsRegisteringAdmin(false)}
                  className={\`flex-1 rounded-xl py-3 text-xs font-bold transition-all \${!isRegisteringAdmin ? 'bg-gold-prestige text-slate-900' : 'bg-slate-900 text-slate-400 border border-white/5'}\`}
                >
                  {lang === 'ar' ? 'مواطن / مكتب عقاري' : 'Citizen / Agency'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsRegisteringAdmin(true)}
                  className={\`flex-1 rounded-xl py-3 text-xs font-bold transition-all \${isRegisteringAdmin ? 'bg-emerald-500 text-slate-900' : 'bg-slate-900 text-slate-400 border border-white/5'}\`}
                >
                  {lang === 'ar' ? 'دخول المشرفين' : 'Admin Login'}
                </button>
              </div>`;

code = code.replace(/<div className="flex gap-2">[\s\S]*?\{lang === 'ar' \? 'دخول المشرفين' : 'Admin Login'\}[\s\S]*?<\/button>\s*<\/div>/, roleSelector);

// Add Agency form to citizen registration if they select agency
// Instead of messing with the auth form which is already complex, I'll let them update their profile to Agency from the Citizen Dashboard.

const agencyDashboardBlock = `          {user.role === 'agency' && (
            <div className="mb-8 p-6 bg-slate-900/50 border border-gold-prestige/30 rounded-2xl">
              <h3 className="text-gold-prestige font-bold mb-2 text-lg">لوحة تحكم المكتب العقاري</h3>
              <p className="text-xs text-slate-400 mb-4">بصفتك مكتب عقاري، تحظى عقاراتك بأولوية في الظهور ويتم تمييز حسابك كحساب أعمال احترافي.</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-white/5">
                  <div className="text-2xl font-black text-white">{myProperties.length}</div>
                  <div className="text-[10px] text-slate-400 mt-1">العقارات المنشورة</div>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-white/5">
                  <div className="text-2xl font-black text-emerald-400">{myProperties.reduce((acc, p) => acc + (p.phoneViews || 0), 0)}</div>
                  <div className="text-[10px] text-slate-400 mt-1">مشاهدات أرقام الهواتف</div>
                </div>
              </div>
            </div>
          )}`;

code = code.replace('{/* Stats Summary */}', agencyDashboardBlock + '\n\n          {/* Stats Summary */}');

fs.writeFileSync('src/App.tsx', code);
console.log('Patched App.tsx with Agency blocks');
