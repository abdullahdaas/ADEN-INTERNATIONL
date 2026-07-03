const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPortal.tsx', 'utf-8');

code = code.replace('loadData();', 'loadAdminData();');

// Verify Button
const verifyBtn = `                          {!p.isVerified && (
                            <button
                              onClick={async () => {
                                try {
                                  await updateProperty(p.id, { isVerified: true });
                                  loadAdminData();
                                } catch(e) {}
                              }}
                              className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 flex items-center gap-1"
                              title="توثيق العقار"
                            >
                              <BadgeCheck className="w-3.5 h-3.5" />
                              توثيق
                            </button>
                          )}`;

code = code.replace('{/* Approval Controls */}', verifyBtn + '\n\n                          {/* Approval Controls */}');

if (!code.includes('BadgeCheck,')) {
  code = code.replace("Banknote,", "Banknote, BadgeCheck,");
}


fs.writeFileSync('src/components/AdminPortal.tsx', code);
console.log('Fixed loadAdminData and added verify button');
