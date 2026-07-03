const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  'const [loginRole, setLoginRole] = useState<"citizen" | "admin">("citizen");',
  'const [loginRole, setLoginRole] = useState<"citizen" | "admin">("citizen");\n  const [authMode, setAuthMode] = useState<"login" | "register">("login");'
);

const loginSubmitTarget = `  // Perform Citizen/Admin Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (loginRole === "citizen") {
      const emailRegex = /^[\\s@]+@[\\s@]+\\.[\\s@]+$/;
      const phoneRegex = /^(\\+?\\d{8,15})$/;
      const identifier = citizenEmailOrPhone.trim();

      if (!emailRegex.test(identifier) && !phoneRegex.test(identifier)) {
        setLoginError(
          lang === "ar"
            ? "يرجى إدخال بريد إلكتروني صالح أو رقم هاتف صحيح!"
            : "Please enter a valid email or phone number!",
        );
        return;
      }

      if (!citizenEmailOrPhone.trim() || !citizenPassword.trim()) {
        setLoginError(
          lang === "ar"
            ? "يرجى إدخال البريد الإلكتروني أو رقم الهاتف مع كلمة المرور!"
            : "Please enter your email or phone and password!",
        );
        return;
      }
      if (citizenPassword.length !== 4) {
        setLoginError(
          lang === "ar"
            ? "كلمة المرور يجب أن تتكون من 4 أرقام أو حروف فقط!"
            : "Password must be exactly 4 characters or digits!",
        );
        return;
      }

      try {
        const res = await fetch("/api/citizen-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            emailOrPhone: citizenEmailOrPhone,
            password: citizenPassword,
            name: citizenName,
          }),
        });
        const data = await res.json();

        if (data.success) {
          setUser(data.profile);
          localStorage.setItem("aden-user", JSON.stringify(data.profile));
          setIsLoginOpen(false);
          setCitizenName("");
          setCitizenEmailOrPhone("");
          setCitizenPassword("");
          alert(t.loginSuccess);
        } else {
          setLoginError(data.message || t.loginError);
        }
      } catch (err) {
        setLoginError(
          lang === "ar"
            ? "خطأ في الاتصال بالخادم!"
            : "Server connection failed!",
        );
      }
    } else {`;

const fixedRegexCode = `  // Perform Citizen/Admin Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (loginRole === "citizen") {
      const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
      const phoneRegex = /^(\\+?\\d{8,15})$/;
      const identifier = citizenEmailOrPhone.trim();

      if (!emailRegex.test(identifier) && !phoneRegex.test(identifier)) {
        setLoginError(
          lang === "ar"
            ? "يرجى إدخال بريد إلكتروني صالح أو رقم هاتف صحيح!"
            : "Please enter a valid email or phone number!",
        );
        return;
      }

      if (!citizenEmailOrPhone.trim() || !citizenPassword.trim()) {
        setLoginError(
          lang === "ar"
            ? "يرجى إدخال البريد الإلكتروني أو رقم الهاتف مع كلمة المرور!"
            : "Please enter your email or phone and password!",
        );
        return;
      }
      if (citizenPassword.length !== 4) {
        setLoginError(
          lang === "ar"
            ? "كلمة المرور يجب أن تتكون من 4 أرقام أو حروف فقط!"
            : "Password must be exactly 4 characters or digits!",
        );
        return;
      }
      
      if (authMode === "register" && !citizenName.trim()) {
        setLoginError(
          lang === "ar"
            ? "يرجى إدخال الاسم الكريم للتسجيل!"
            : "Please enter your name for registration!",
        );
        return;
      }

      try {
        const endpoint = authMode === "register" ? "/api/citizen-register" : "/api/citizen-login";
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            emailOrPhone: citizenEmailOrPhone,
            password: citizenPassword,
            name: citizenName,
          }),
        });
        const data = await res.json();

        if (data.success) {
          setUser(data.profile);
          localStorage.setItem("aden-user", JSON.stringify(data.profile));
          setIsLoginOpen(false);
          setCitizenName("");
          setCitizenEmailOrPhone("");
          setCitizenPassword("");
          alert(authMode === "register" ? (lang === "ar" ? "تم إنشاء الحساب وتسجيل الدخول بنجاح!" : "Account created successfully!") : t.loginSuccess);
        } else {
          setLoginError(data.message || t.loginError);
        }
      } catch (err) {
        setLoginError(
          lang === "ar"
            ? "خطأ في الاتصال بالخادم!"
            : "Server connection failed!",
        );
      }
    } else {`;

code = code.replace(loginSubmitTarget.replace('const emailRegex = /^[\\s@]+@[\\s@]+\\.[\\s@]+$/;', 'const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;'), fixedRegexCode);

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx handleLoginSubmit replaced successfully');
