const fs = require('fs');

const headerCode = `import React, { useState, useEffect } from 'react';
import { IraqMapIcon } from "./IraqMapIcon";
import { Home, Search, Moon, Sun, Heart, MessageSquare, ShieldAlert, GitCompare, PlusCircle, LogIn, LogOut, Globe, User, Briefcase, FileCheck, FileSignature, Bell, BellOff } from 'lucide-react';
import { Property } from '../types';
import { translations } from '../utils/translations';
import { fetchNotifications, markNotificationRead } from '../utils/api';
import { UserNotification } from '../types';
import AdenLogo from './AdenLogo';

interface HeaderProps {
  currentView: 'home' | 'listings' | 'map-search' | 'details' | 'admin' | 'contact' | 'compare' | 'my-properties' | 'profile';
  setView: (view: 'home' | 'listings' | 'map-search' | 'details' | 'admin' | 'contact' | 'compare' | 'my-properties' | 'profile') => void;
  favorites: Property[];
  onOpenFavorites: () => void;
  onLogoDoubleClick: () => void;
  selectedCompareCount: number;
  
  // Bilingual & Action Props
  lang: 'ar' | 'en' | 'ku';
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  setLang: (lang: 'ar' | 'en' | 'ku') => void;
  user: { name: string; role: 'admin' | 'citizen'; emailOrPhone?: string } | null;
  onOpenLogin: () => void;
  onOpenAddProperty: () => void;
  onLogout: () => void;
}

export default function Header({
  currentView,
  setView,
  favorites,
  onOpenFavorites,
  onLogoDoubleClick,
  selectedCompareCount,
  lang,
  setLang,
  theme,
  setTheme,
  user,
  onOpenLogin,
  onOpenAddProperty,
  onLogout
}: HeaderProps) {
  const t = translations[lang];
  const [isScrolled, setIsScrolled] = useState(false);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (user) {
      fetchNotifications().then(n => setNotifications(n)).catch(() => {});
      const interval = setInterval(() => {
        fetchNotifications().then(n => setNotifications(n)).catch(() => {});
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const unreadNotifs = notifications.filter(n => !n.isRead).length;

  const handleReadNotification = async (id: string) => {
    await markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const navItems = [
    { id: 'home', label: t.home, icon: Home },
    { id: 'listings', label: t.listings, icon: Search },
    { id: 'service-providers', label: lang === 'ar' ? 'مزودي الخدمات' : lang === 'en' ? 'Service Providers' : 'پێشکەشکارانی خزمەتگوزاری', icon: Briefcase },
    { id: 'map-search', label: lang === 'ar' ? 'الخريطة' : 'Map', icon: IraqMapIcon },
    { id: 'verify-agreement', label: lang === 'ar' ? 'تحقق من مكاتبة' : lang === 'en' ? 'Verify Agreement' : 'پشکنینی بەڵگەنامە', icon: FileCheck },
    ...(user?.role === 'citizen' ? [
      { id: 'my-properties', label: lang === 'ar' ? 'عقاراتي' : lang === 'en' ? 'My Properties' : 'خانووبەرەکانم', icon: User },
      { id: 'my-agreements', label: lang === 'ar' ? 'مكاتباتي' : lang === 'en' ? 'Agreements' : 'بەڵگەنامەکانم', icon: FileSignature }
    ] : []),
    { id: 'compare', label: t.compare, icon: GitCompare, badge: selectedCompareCount > 0 ? selectedCompareCount : undefined },
    { id: 'contact', label: t.contact, icon: MessageSquare }
  ];

  const toggleLanguage = () => {
    if (lang === 'ar') {
      setLang('en');
    } else if (lang === 'en') {
      setLang('ku');
    } else {
      setLang('ar');
    }
  };

  return (
    <header 
      id="app-header" 
      className={\`sticky top-0 z-50 w-full max-w-[100vw] border-b border-white/5 transition-all duration-300 box-border overflow-hidden \${
        isScrolled ? 'bg-black/30 backdrop-blur-xl shadow-lg shadow-black/20' : 'bg-[#050505]/60 backdrop-blur-md'
      }\`}
    >
      {/* Strict Single Line: flex flex-row flex-nowrap w-full max-w-[100vw] */}
      <div className="mx-auto flex flex-row flex-nowrap w-full max-w-[100vw] items-center justify-between gap-1 sm:gap-2 md:gap-4 px-1 py-2 sm:px-2 md:px-4 lg:px-6 box-border">
        
        {/* Brand Logo Only */}
        <div 
          className="flex shrink-0 cursor-pointer items-center justify-center select-none pl-1 pr-1 md:pl-2 md:pr-4"
          onClick={() => setView('home')}
          onDoubleClick={onLogoDoubleClick}
          title={t.doubleClickAdminTip}
        >
          <div className="animate-float hover:scale-105 transition-transform duration-300 drop-shadow-md">
            <AdenLogo size={36} className="w-7 h-7 sm:w-8 sm:h-8 md:w-11 md:h-11 xl:w-12 xl:h-12" />
          </div>
        </div>

        {/* Dynamic Shrinking Container: flex-1 flex justify-between items-center */}
        <div className="flex-1 flex flex-row flex-nowrap items-center justify-between gap-0.5 sm:gap-1 md:gap-2 xl:gap-4 min-w-0">
          
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
                className={\`relative flex items-center justify-center rounded-full p-1.5 sm:p-2 md:px-3 md:py-2 transition-all duration-300 shrink \${
                  isActive 
                    ? 'bg-gradient-to-r from-[#F27D26] to-[#ff8a3d] text-white shadow-md drop-shadow-md' 
                    : 'bg-white/10 border border-white/10 text-slate-100 hover:text-white hover:bg-white/20 hover:shadow-md backdrop-blur-sm'
                }\`}
              >
                <Icon className={\`h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 drop-shadow-sm shrink-0 \${isActive ? 'text-white' : ''}\`} />
                <span className="hidden lg:inline drop-shadow-sm whitespace-nowrap text-xs xl:text-sm font-bold ml-1.5 shrink">{item.label}</span>
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-1 md:-top-1.5 md:-right-1.5 flex h-3 w-3 md:h-4 md:w-4 items-center justify-center rounded-full bg-white text-[#F27D26] text-[8px] md:text-[9px] font-black shadow-sm drop-shadow-sm">
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
              className={\`relative flex items-center justify-center rounded-full p-1.5 sm:p-2 md:px-3 md:py-2 transition-all duration-300 shrink \${
                currentView === 'admin' ? 'bg-[#F27D26]/10 text-[#F27D26] border border-[#F27D26]/20 drop-shadow-md' : 'bg-white/10 border border-white/10 text-red-300 hover:bg-red-500/20 hover:text-red-200 backdrop-blur-sm'
              }\`}
            >
              <ShieldAlert className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 drop-shadow-sm shrink-0" />
              <span className="hidden lg:inline drop-shadow-sm whitespace-nowrap text-xs xl:text-sm font-bold ml-1.5 shrink">{t.admin}</span>
            </button>
          )}

          {/* User Profile Summary Header */}
          {user && (
            <div className="flex items-center justify-center rounded-full border border-white/10 bg-white/10 p-1 sm:p-1.5 md:px-3 md:py-1.5 text-white shrink backdrop-blur-sm shadow-sm">
               <div className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-white/20 shrink-0">
                 <User className="h-3 w-3 md:h-4 md:w-4 text-[#F27D26] drop-shadow-sm" />
               </div>
               <span className="font-bold text-[10px] md:text-xs hidden lg:inline drop-shadow-sm whitespace-nowrap ml-1.5 shrink">{user.name || ''}</span>
            </div>
          )}

          {/* Settings & Action Controls */}
          <div className="flex items-center justify-center gap-0.5 sm:gap-1 md:gap-2 shrink border-l border-r border-white/10 px-1 sm:px-2 md:px-3">
            
            <button
              onClick={toggleLanguage}
              className="flex h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-slate-100 hover:bg-white/20 hover:text-white transition-all shrink backdrop-blur-sm shadow-sm"
              title={lang === 'ar' ? 'Switch Language' : lang === 'en' ? 'گۆڕینی زمان' : 'Change Language'}
            >
              <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-[#F27D26] drop-shadow-sm shrink-0" />
            </button>
            
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-slate-100 hover:bg-white/20 hover:text-white transition-all shrink backdrop-blur-sm shadow-sm"
              title={lang === 'ar' ? 'تغيير المظهر' : 'Toggle Theme'}
            >
              {theme === 'dark' ? <Sun className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-amber-400 drop-shadow-sm shrink-0" /> : <Moon className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-slate-100 drop-shadow-sm shrink-0" />}
            </button>

            {user && (
              <button
                onClick={() => setShowNotifications(true)}
                className="relative flex h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-slate-100 hover:bg-white/20 hover:text-white transition-all shrink backdrop-blur-sm shadow-sm"
                title="الإشعارات"
              >
                <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 drop-shadow-sm shrink-0" />
                {unreadNotifs > 0 && (
                  <span className="absolute -top-1 -right-1 md:-top-1.5 md:-right-1.5 flex h-3 w-3 md:h-4 md:w-4 items-center justify-center rounded-full bg-red-500 text-[8px] md:text-[9px] font-bold text-white shadow-sm drop-shadow-md">
                    {unreadNotifs}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={onOpenFavorites}
              className="relative flex h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-slate-100 hover:bg-white/20 hover:text-white transition-all shrink backdrop-blur-sm shadow-sm"
              title="المفضلة"
            >
              <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 drop-shadow-sm shrink-0" />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 md:-top-1.5 md:-right-1.5 flex h-3 w-3 md:h-4 md:w-4 items-center justify-center rounded-full bg-[#ff8a3d] text-[8px] md:text-[9px] font-bold text-white shadow-sm drop-shadow-md">
                  {favorites.length}
                </span>
              )}
            </button>
          </div>

          {/* Add / Login / Logout */}
          <div className="flex items-center justify-center gap-0.5 sm:gap-1 md:gap-2 shrink">
            <button
              onClick={onOpenAddProperty}
              className="flex items-center justify-center rounded-full bg-gradient-to-r from-[#F27D26] to-[#ff8a3d] p-1.5 sm:p-2 md:px-3 md:py-2 transition-all shrink shadow-lg shadow-[#F27D26]/20 active:scale-95"
              title={t.addPropButton}
            >
              <PlusCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 drop-shadow-sm shrink-0" />
              <span className="hidden lg:inline drop-shadow-sm whitespace-nowrap text-xs xl:text-sm font-bold text-white ml-1.5 shrink">{t.addPropButton}</span>
            </button>
            
            {!user ? (
              <button
                onClick={onOpenLogin}
                className="flex items-center justify-center rounded-full border border-white/20 bg-white/10 p-1.5 sm:p-2 md:px-3 md:py-2 transition-all shrink backdrop-blur-sm shadow-sm hover:bg-white/20 active:scale-95"
                title={t.loginButton}
              >
                <LogIn className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-[#F27D26] drop-shadow-sm shrink-0" />
                <span className="hidden lg:inline drop-shadow-sm whitespace-nowrap text-xs xl:text-sm font-bold text-white ml-1.5 shrink">{t.loginButton}</span>
              </button>
            ) : (
              <button
                onClick={onLogout}
                className="flex items-center justify-center rounded-full border border-red-500/30 bg-red-500/20 p-1.5 sm:p-2 md:px-3 md:py-2 transition-all shrink backdrop-blur-sm shadow-sm hover:bg-red-500/30 active:scale-95"
                title={t.logout}
              >
                <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-red-300 drop-shadow-sm shrink-0" />
                <span className="hidden lg:inline drop-shadow-sm whitespace-nowrap text-xs xl:text-sm font-bold text-red-200 ml-1.5 shrink">{t.logout}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
`

fs.writeFileSync('src/components/Header.tsx', headerCode);
console.log("Header replaced for shrinking");
