const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetBtn = `                  {loginRole === "citizen"
                    ? t.generalUserRole
                    : t.platformManagerRole}
                </span>
                {t.login}
              </button>`;

const newBtn = `                  {loginRole === "citizen"
                    ? (authMode === "register" ? (lang === "ar" ? "إنشاء حساب" : "Register") : t.generalUserRole)
                    : t.platformManagerRole}
                </span>
                {loginRole === "citizen" && authMode === "register" ? (lang === "ar" ? "الآن" : "Now") : t.login}
              </button>`;

code = code.replace(targetBtn, newBtn);
fs.writeFileSync('src/App.tsx', code);
console.log("Button updated!");
