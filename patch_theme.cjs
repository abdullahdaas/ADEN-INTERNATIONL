const fs = require('fs');

let appSrc = fs.readFileSync('src/App.tsx', 'utf8');

if (!appSrc.includes('const [theme, setTheme] = useState<"dark" | "light">')) {
    appSrc = appSrc.replace(
        'const [lang, setLang] = useState<"ar" | "en">("ar");',
        'const [lang, setLang] = useState<"ar" | "en">("ar");\n  const [theme, setTheme] = useState<"dark" | "light">(() => (localStorage.getItem("aden-theme") as "dark" | "light") || "dark");\n\n  useEffect(() => {\n    if (theme === "light") {\n      document.documentElement.setAttribute("data-theme", "light");\n    } else {\n      document.documentElement.removeAttribute("data-theme");\n    }\n    localStorage.setItem("aden-theme", theme);\n  }, [theme]);'
    );
    
    appSrc = appSrc.replace(
        '<Header',
        '<Header\n        theme={theme}\n        setTheme={setTheme}'
    );
    
    fs.writeFileSync('src/App.tsx', appSrc);
    console.log('App.tsx patched for theme state');
}

let headerSrc = fs.readFileSync('src/components/Header.tsx', 'utf8');
if (!headerSrc.includes('theme:')) {
    headerSrc = headerSrc.replace(
        "lang: 'ar' | 'en' | 'ku';",
        "lang: 'ar' | 'en' | 'ku';\n  theme: 'dark' | 'light';\n  setTheme: (theme: 'dark' | 'light') => void;"
    );
    
    headerSrc = headerSrc.replace(
        "lang,\n  setLang",
        "lang,\n  setLang,\n  theme,\n  setTheme"
    );
    
    headerSrc = headerSrc.replace(
        "import { Home, Search",
        "import { Home, Search, Moon, Sun"
    );
    
    const themeButton = `
          {/* Theme Toggle Button */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center justify-center rounded-lg border border-white/5 bg-white/5 w-9 h-9 text-slate-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
            title={lang === 'ar' ? 'تغيير المظهر' : 'Toggle Theme'}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-400" />}
          </button>
    `;
    
    headerSrc = headerSrc.replace(
        "{/* Language Switch Button */}",
        themeButton + "\n          {/* Language Switch Button */}"
    );
    
    fs.writeFileSync('src/components/Header.tsx', headerSrc);
    console.log('Header.tsx patched for theme button');
}

