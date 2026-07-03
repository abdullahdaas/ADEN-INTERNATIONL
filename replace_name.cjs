const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetNameField = `                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">
                      <span>
                        {lang === "ar"
                          ? "الاسم الكريم بالكامل"
                          : lang === "ku"
                            ? "ناوی تەواو"
                            : "Your Full Name"}
                      </span>
                      <span className="text-xs text-slate-500 mr-2 font-normal">
                        (
                        {lang === "ar"
                          ? "اختياري للتسجيل الجديد"
                          : lang === "ku"
                            ? "ئارەزوومەندانە بۆ هەژماری نوێ"
                            : "optional for new accounts"}
                        )
                      </span>
                    </label>
                    <input
                      type="text"
                      placeholder={
                        lang === "ar"
                          ? "أدخل اسمك الكريم (اختياري)..."
                          : lang === "ku"
                            ? "ناوی خۆت بنووسە (ئارەزوومەندانە)..."
                            : "Enter your name (optional)..."
                      }
                      value={citizenName}
                      onChange={(e) => setCitizenName(e.target.value)}
                      className="w-full rounded-xl border border-white/5 bg-slate-950 px-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-[#F27D26]/40"
                    />
                  </div>
                  <p className="text-xs text-[#F27D26]/80 text-center font-sans">
                    ⚡{" "}
                    {lang === "ar"
                      ? "قم بتسجيل الدخول أو إنشاء حساب جديد فوراً إذا لم تكن مسجلاً"
                      : lang === "ku"
                        ? "بچۆ ژوورەوە یان هەژمارێکی نوێ دروست بکە دەستبەجێ"
                        : "Log in or create a new account instantly if not registered"}
                  </p>`;

const newNameField = `                  {authMode === "register" && (
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">
                        <span>
                          {lang === "ar"
                            ? "الاسم الكريم بالكامل"
                            : lang === "ku"
                              ? "ناوی تەواو"
                              : "Your Full Name"}
                        </span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={
                          lang === "ar"
                            ? "أدخل اسمك الكريم..."
                            : lang === "ku"
                              ? "ناوی خۆت بنووسە..."
                              : "Enter your name..."
                        }
                        value={citizenName}
                        onChange={(e) => setCitizenName(e.target.value)}
                        className="w-full rounded-xl border border-white/5 bg-slate-950 px-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-[#F27D26]/40"
                      />
                    </div>
                  )}
                  {authMode === "login" && (
                    <p className="text-xs text-[#F27D26]/80 text-center font-sans">
                      ⚡{" "}
                      {lang === "ar"
                        ? "ليس لديك حساب؟ اضغط على زر حساب جديد في الأعلى"
                        : "Don't have an account? Click Register above"}
                    </p>
                  )}`;

code = code.replace(targetNameField, newNameField);
fs.writeFileSync('src/App.tsx', code);
console.log("Name field updated!");
