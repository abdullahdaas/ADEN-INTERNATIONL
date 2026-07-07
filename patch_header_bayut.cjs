const fs = require('fs');
const headerCode = `import React, { useState, useEffect } from 'react';
import { IraqMapIcon } from "./IraqMapIcon";
import { Home, Search, Moon, Sun, Heart, MessageSquare, ShieldAlert, GitCompare, PlusCircle, LogIn, LogOut, Globe, User, Briefcase, FileCheck, FileSignature, Bell } from 'lucide-react';
import { Property, UserNotification } from '../types';
import { translations } from '../utils/translations';
import { fetchNotifications, markNotificationRead } from '../utils/api';
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
    if (lang === 'ar') setLang('en');
    else if (lang === 'en') setLang('ku');
    else setLang('ar');
  };

  return (
    <header 
      id="app-header" 
      className={\`sticky top-0 z-50 w-full border-b border-white/5 transition-all duration-300 box-border \${
        isScrolled ? 'bg-black/30 backdrop-blur-xl shadow-lg shadow-black/20' : 'bg-[#050505]/80 backdrop-blur-md'
      }\`}
    >
      <div className="mx-auto flex flex-row items-center w-full max-w-[1920px] box-border relative px-2 md:px-6 py-2 md:py-3 gap-2 md:gap-4">
        
        {/* Brand Logo - Fixed Left */}
        <div 
          className="flex-shrink-0 cursor-pointer items-center justify-center select-none pl-2 pr-1"
          onClick={() => setView('home')}
          onDoubleClick={onLogoDoubleClick}
          title={t.doubleClickAdminTip}
        >
          <div className="animate-float hover:scale-105 transition-transform duration-300 drop-shadow-md">
            <AdenLogo size={36} className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 xl:w-12 xl:h-12" />
          </div>
        </div>

        {/* The "Bayut" Scroll Logic Container */}
        <div className="flex flex-row flex-nowrap items-center overflow-x-auto whitespace-nowrap scroll-smooth scrollbar-hide w-full md:overflow-x-visible md:flex-wrap gap-2 px-1 py-1 md:px-0 md:py-0 md:justify-end pr-4">
          
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
                className={\`flex-shrink-0 inline-flex items-center justify-center rounded-full px-3 py-2 transition-all duration-300 \${
                  isActive 
                    ? 'bg-gradient-to-r from-[#F27D26] to-[#ff8a3d] text-white shadow-md' 
                    : 'bg-white/5 border border-white/10 text-slate-200 hover:text-white hover:bg-white/20 hover:shadow-md'
                }\`}
              >
                <Icon className={\`w-4 h-4 md:w-5 md:h-5 drop-shadow-sm \${isActive ? 'text-white' : ''}\`} />
                <span className="hidden lg:inline whitespace-nowrap text-sm font-bold ml-1.5">{item.label}</span>
                {item.badge !== undefined && (
                  <span className="ml-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[#F27D26] text-[10px] font-black shadow-sm">
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
              className={\`flex-shrink-0 inline-flex items-center justify-center rounded-full px-3 py-2 transition-all duration-300 \${
                currentView === 'admin' ? 'bg-[#F27D26]/10 text-[#F27D26] border border-[#F27D26]/20 shadow-md' : 'bg-white/5 border border-white/10 text-red-300 hover:bg-red-500/20 hover:text-red-200'
              }\`}
            >
              <ShieldAlert className="w-4 h-4 md:w-5 md:h-5 drop-shadow-sm" />
              <span className="hidden lg:inline whitespace-nowrap text-sm font-bold ml-1.5">{t.admin}</span>
            </button>
          )}

          {/* Divider */}
          <div className="w-[1px] h-6 bg-white/20 flex-shrink-0 mx-1 hidden md:block" />

          {/* User Profile Summary Header */}
          {user && (
            <div className="flex-shrink-0 inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-white shadow-sm">
               <div className="flex w-6 h-6 items-center justify-center rounded-full bg-white/20">
                 <User className="w-4 h-4 text-[#F27D26]" />
               </div>
               <span className="font-bold text-xs md:text-sm whitespace-nowrap ml-2">{user.name || ''}</span>
            </div>
          )}

          <button
            onClick={toggleLanguage}
            className="flex-shrink-0 inline-flex items-center justify-center rounded-full p-2 border border-white/10 bg-white/5 text-slate-200 hover:bg-white/20 hover:text-white transition-all shadow-sm"
            title={lang === 'ar' ? 'Switch Language' : lang === 'en' ? 'گۆڕینی زمان' : 'Change Language'}
          >
            <Globe className="w-4 h-4 md:w-5 md:h-5 text-[#F27D26]" />
          </button>
          
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex-shrink-0 inline-flex items-center justify-center rounded-full p-2 border border-white/10 bg-white/5 text-slate-200 hover:bg-white/20 hover:text-white transition-all shadow-sm"
            title={lang === 'ar' ? 'تغيير المظهر' : 'Toggle Theme'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 md:w-5 md:h-5 text-amber-400" /> : <Moon className="w-4 h-4 md:w-5 md:h-5 text-slate-200" />}
          </button>

          {user && (
            <button
              onClick={() => setShowNotifications(true)}
              className="flex-shrink-0 inline-flex relative items-center justify-center rounded-full p-2 border border-white/10 bg-white/5 text-slate-200 hover:bg-white/20 hover:text-white transition-all shadow-sm"
              title="الإشعارات"
            >
              <Bell className="w-4 h-4 md:w-5 md:h-5" />
              {unreadNotifs > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm">
                  {unreadNotifs}
                </span>
              )}
            </button>
          )}

          <button
            onClick={onOpenFavorites}
            className="flex-shrink-0 inline-flex relative items-center justify-center rounded-full p-2 border border-white/10 bg-white/5 text-slate-200 hover:bg-white/20 hover:text-white transition-all shadow-sm"
            title="المفضلة"
          >
            <Heart className="w-4 h-4 md:w-5 md:h-5" />
            {favorites.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#ff8a3d] text-[9px] font-bold text-white shadow-sm">
                {favorites.length}
              </span>
            )}
          </button>

          {/* Divider */}
          <div className="w-[1px] h-6 bg-white/20 flex-shrink-0 mx-1 hidden md:block" />

          {/* Add / Login / Logout */}
          <button
            onClick={onOpenAddProperty}
            className="flex-shrink-0 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#F27D26] to-[#ff8a3d] px-3 py-2 transition-all shadow-lg shadow-[#F27D26]/20 active:scale-95"
            title={t.addPropButton}
          >
            <PlusCircle className="w-4 h-4 md:w-5 md:h-5 text-white" />
            <span className="hidden lg:inline whitespace-nowrap text-sm font-bold text-white ml-1.5">{t.addPropButton}</span>
          </button>
          
          {!user ? (
            <button
              onClick={onOpenLogin}
              className="flex-shrink-0 inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-3 py-2 transition-all shadow-sm hover:bg-white/20 active:scale-95"
              title={t.loginButton}
            >
              <LogIn className="w-4 h-4 md:w-5 md:h-5 text-[#F27D26]" />
              <span className="hidden lg:inline whitespace-nowrap text-sm font-bold text-white ml-1.5">{t.loginButton}</span>
            </button>
          ) : (
            <button
              onClick={onLogout}
              className="flex-shrink-0 inline-flex items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 px-3 py-2 transition-all shadow-sm hover:bg-red-500/30 active:scale-95"
              title={t.logout}
            >
              <LogOut className="w-4 h-4 md:w-5 md:h-5 text-red-400" />
              <span className="hidden lg:inline whitespace-nowrap text-sm font-bold text-red-200 ml-1.5">{t.logout}</span>
            </button>
          )}
          
          {/* Spacer for extra padding at the end on mobile to prevent touching the edge */}
          <div className="w-4 flex-shrink-0 md:hidden" />
        </div>
      </div>
    </header>
  );
}
`
fs.writeFileSync('src/components/Header.tsx', headerCode);
