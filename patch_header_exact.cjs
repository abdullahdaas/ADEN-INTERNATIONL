const fs = require('fs');
let code = fs.readFileSync('src/components/Header.tsx', 'utf-8');

// Replace everything inside the return statement to fix the layout and styles.
// We'll just replace the entire return block.

const newReturn = `return (
    <header 
      id="app-header" 
      className={\`sticky top-0 z-50 w-full border-b border-white/5 transition-all duration-300 box-border \${
        isScrolled ? 'bg-black/30 backdrop-blur-xl shadow-lg shadow-black/20' : 'bg-[#050505]/95'
      }\`}
    >
      <div className="mx-auto flex flex-row flex-nowrap w-full max-w-[1920px] items-center justify-between gap-4 px-2 py-3 sm:px-4 lg:px-6 box-border">
        
        {/* Brand Logo Only */}
        <div 
          className="flex shrink-0 cursor-pointer items-center justify-center select-none pl-1 pr-2"
          onClick={() => setView('home')}
          onDoubleClick={onLogoDoubleClick}
          title={t.doubleClickAdminTip}
        >
          <div className="animate-float hover:scale-105 transition-transform duration-300 drop-shadow-md">
            <AdenLogo size={42} className="w-10 h-10 md:w-11 md:h-11" />
          </div>
        </div>

        {/* Unified Navigation & Controls Container with Flex Nowrap */}
        <div className="flex flex-row flex-nowrap items-center gap-3 xl:gap-4 flex-1 min-w-0 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] pb-1 pt-1 justify-start md:justify-center">
          
          {/* Nav Items */}
          {navItems?.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                id={\`nav-\${item.id}\`}
                onClick={() => setView(item.id as any)}
                title={item.label}
                className={\`relative flex flex-row flex-nowrap items-center justify-center gap-1.5 rounded-full px-3 py-2 text-[11px] xl:text-sm font-bold transition-all duration-300 shrink-0 \${
                  isActive 
                    ? 'bg-gradient-to-r from-[#F27D26] to-[#ff8a3d] text-white shadow-md drop-shadow-md' 
                    : 'bg-white/10 border border-white/10 text-slate-100 hover:text-white hover:bg-white/20 hover:shadow-md backdrop-blur-sm'
                }\`}
              >
                <Icon className={\`h-4 w-4 xl:h-5 xl:w-5 drop-shadow-sm \${isActive ? 'text-white' : ''}\`} />
                <span className="hidden sm:inline drop-shadow-sm whitespace-nowrap">{item.label}</span>
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 xl:h-5 xl:w-5 items-center justify-center rounded-full bg-white text-[#F27D26] text-[9px] xl:text-[10px] font-black shadow-sm drop-shadow-sm">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
          
          {user?.role === 'admin' && (
            <button
              onClick={() => setView('admin')}
              title={t.admin}
              className={\`relative flex flex-row flex-nowrap items-center justify-center gap-1.5 rounded-full px-3 py-2 text-[11px] xl:text-sm font-bold transition-all duration-300 shrink-0 \${
                currentView === 'admin' ? 'bg-[#F27D26]/10 text-[#F27D26] border border-[#F27D26]/20 drop-shadow-md' : 'bg-white/10 border border-white/10 text-red-300 hover:bg-red-500/20 hover:text-red-200 backdrop-blur-sm'
              }\`}
            >
              <ShieldAlert className="h-4 w-4 xl:h-5 xl:w-5 drop-shadow-sm" />
              <span className="hidden sm:inline drop-shadow-sm whitespace-nowrap">{t.admin}</span>
            </button>
          )}

          {/* User Profile Summary Header */}
          {user && (
            <div className="flex flex-row flex-nowrap items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-sm text-white shrink-0 backdrop-blur-sm shadow-sm">
               <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                 <User className="h-3 w-3 text-[#F27D26] drop-shadow-sm" />
               </div>
               <span className="font-bold text-[11px] xl:text-xs hidden sm:inline drop-shadow-sm whitespace-nowrap">{user.name || ''}</span>
            </div>
          )}

          {/* Settings & Action Controls */}
          <div className="flex flex-row flex-nowrap items-center gap-3 shrink-0 border-r border-white/10 pr-3 ml-1">
            
            <button
              onClick={toggleLanguage}
              className="flex h-9 w-9 xl:h-10 xl:w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-slate-100 hover:bg-white/20 hover:text-white transition-all shrink-0 backdrop-blur-sm shadow-sm"
              title={lang === 'ar' ? 'Switch Language' : lang === 'en' ? 'گۆڕینی زمان' : 'Change Language'}
            >
              <Globe className="h-4 w-4 xl:h-5 xl:w-5 text-[#F27D26] drop-shadow-sm" />
            </button>
            
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex h-9 w-9 xl:h-10 xl:w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-slate-100 hover:bg-white/20 hover:text-white transition-all shrink-0 backdrop-blur-sm shadow-sm"
              title={lang === 'ar' ? 'تغيير المظهر' : 'Toggle Theme'}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 xl:h-5 xl:w-5 text-amber-400 drop-shadow-sm" /> : <Moon className="h-4 w-4 xl:h-5 xl:w-5 text-slate-100 drop-shadow-sm" />}
            </button>

            {user && (
              <button
                onClick={() => setShowNotifications(true)}
                className="relative flex h-9 w-9 xl:h-10 xl:w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-slate-100 hover:bg-white/20 hover:text-white transition-all shrink-0 backdrop-blur-sm shadow-sm"
                title="الإشعارات"
              >
                <Bell className="h-4 w-4 xl:h-5 xl:w-5 drop-shadow-sm" />
                {unreadNotifs > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 xl:h-5 xl:w-5 items-center justify-center rounded-full bg-red-500 text-[9px] xl:text-[10px] font-bold text-white shadow-sm drop-shadow-md">
                    {unreadNotifs}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={onOpenFavorites}
              className="relative flex h-9 w-9 xl:h-10 xl:w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-slate-100 hover:bg-white/20 hover:text-white transition-all shrink-0 backdrop-blur-sm shadow-sm"
              title="المفضلة"
            >
              <Heart className="h-4 w-4 xl:h-5 xl:w-5 drop-shadow-sm" />
              {favorites.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 xl:h-5 xl:w-5 items-center justify-center rounded-full bg-[#ff8a3d] text-[9px] xl:text-[10px] font-bold text-white shadow-sm drop-shadow-md">
                  {favorites.length}
                </span>
              )}
            </button>
          </div>

          {/* Add / Login / Logout */}
          <div className="flex flex-row flex-nowrap items-center gap-3 shrink-0">
            <button
              onClick={onOpenAddProperty}
              className="flex flex-row flex-nowrap items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#F27D26] to-[#ff8a3d] px-3 py-2 text-[11px] xl:text-sm font-bold text-white shadow-lg shadow-[#F27D26]/20 active:scale-95 transition-all shrink-0"
            >
              <PlusCircle className="h-4 w-4 xl:h-5 xl:w-5 drop-shadow-sm" />
              <span className="hidden sm:inline drop-shadow-sm whitespace-nowrap">{t.addPropButton}</span>
            </button>
            
            {!user ? (
              <button
                onClick={onOpenLogin}
                className="flex flex-row flex-nowrap items-center justify-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-[11px] xl:text-sm font-bold text-white hover:bg-white/20 active:scale-95 transition-all shrink-0 backdrop-blur-sm shadow-sm"
              >
                <LogIn className="h-4 w-4 xl:h-5 xl:w-5 text-[#F27D26] drop-shadow-sm" />
                <span className="hidden sm:inline drop-shadow-sm whitespace-nowrap">{t.loginButton}</span>
              </button>
            ) : (
              <button
                onClick={onLogout}
                className="flex flex-row flex-nowrap items-center justify-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/20 px-3 py-2 text-[11px] xl:text-sm font-bold text-red-200 hover:bg-red-500/30 active:scale-95 transition-all shrink-0 backdrop-blur-sm shadow-sm"
              >
                <LogOut className="h-4 w-4 xl:h-5 xl:w-5 drop-shadow-sm" />
                <span className="hidden sm:inline drop-shadow-sm whitespace-nowrap">{t.logout}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
`;

const replaceIndex = code.indexOf('return (');
if (replaceIndex !== -1) {
  code = code.substring(0, replaceIndex) + newReturn;
  fs.writeFileSync('src/components/Header.tsx', code);
  console.log("Patched Header return statement.");
} else {
  console.log("Could not find return statement");
}
