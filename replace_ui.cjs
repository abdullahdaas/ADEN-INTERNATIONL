const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetUI = `            <div className="flex gap-2 mb-6 border-b border-white/5 pb-4">
              <button
                onClick={() => {
                  setLoginRole("citizen");
                  setLoginError("");
                }}
                className={\`py-2 text-xs font-bold rounded-lg transition-all \${
                  loginRole === "citizen"
                    ? "bg-[#F27D26] text-white shadow-lg shadow-[#F27D26]/20"
                    : "text-slate-400 hover:text-white"
                }\`}
              >
                {t.generalUserRole}
              </button>
              <button
                onClick={() => {
                  setLoginRole("admin");
                  setLoginError("");
                }}
                className={\`py-2 text-xs font-bold rounded-lg transition-all \${
                  loginRole === "admin"
                    ? "bg-red-500 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }\`}
              >
                {t.platformManagerRole}
              </button>
            </div>`;

const newUI = `            <div className="flex gap-2 mb-6 border-b border-white/5 pb-4">
              <button
                type="button"
                onClick={() => {
                  setLoginRole("citizen");
                  setAuthMode("login");
                  setLoginError("");
                }}
                className={\`flex-1 py-2 text-xs font-bold rounded-lg transition-all \${
                  loginRole === "citizen" && authMode === "login"
                    ? "bg-[#F27D26] text-white shadow-lg shadow-[#F27D26]/20"
                    : "text-slate-400 hover:text-white"
                }\`}
              >
                {lang === "ar" ? "دخول المواطنين" : "Citizen Login"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginRole("citizen");
                  setAuthMode("register");
                  setLoginError("");
                }}
                className={\`flex-1 py-2 text-xs font-bold rounded-lg transition-all \${
                  loginRole === "citizen" && authMode === "register"
                    ? "bg-[#F27D26] text-white shadow-lg shadow-[#F27D26]/20"
                    : "text-slate-400 hover:text-white"
                }\`}
              >
                {lang === "ar" ? "حساب جديد" : "Register"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginRole("admin");
                  setLoginError("");
                }}
                className={\`flex-1 py-2 text-xs font-bold rounded-lg transition-all \${
                  loginRole === "admin"
                    ? "bg-red-500 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }\`}
              >
                {t.platformManagerRole}
              </button>
            </div>`;

code = code.replace(targetUI, newUI);
fs.writeFileSync('src/App.tsx', code);
console.log("UI updated!");
