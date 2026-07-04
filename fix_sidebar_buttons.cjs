const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPortal.tsx', 'utf8');

const mapButton = `            {(!adminUser?.isSupervisor ||
              adminUser?.permissions?.manageProperties) && (
              <button
                onClick={() => setAdminView("map")}
                className={\`w-full flex items-center justify-between rounded-lg px-4 py-3 font-semibold transition-all \${
                  adminView === "gis"
                    ? "bg-white/5 text-gold-prestige"
                    : "text-slate-300 hover:bg-white/5"
                }\`}
              >
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4" />
                  <span>الخريطة التفاعلية</span>
                </div>
              </button>
            )}`;

code = code.replace(mapButton, '');

fs.writeFileSync('src/components/AdminPortal.tsx', code);
