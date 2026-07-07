import React, { useState, useEffect } from 'react';
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
  const [showScrollHint, setShowScrollHint] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Hide scroll hint after 3 seconds
    const timer = setTimeout(() => {
      setShowScrollHint(false);
    }, 3000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
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
      className={`sticky top-0 z-50 w-full border-b border-white/5 transition-all duration-300 ${
        isScrolled ? 'bg-black/40 backdrop-blur-xl shadow-lg shadow-black/20' : 'bg-black/20 backdrop-blur-md'
      }`}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        
        {/* Brand Logo Only */}
        <div 
          className="flex cursor-pointer items-center gap-3 select-none"
          onClick={() => setView('home')}
          onDoubleClick={onLogoDoubleClick}
          title={t.doubleClickAdminTip}
        >
          <div className="animate-float">
            <AdenLogo size={42} />
          </div>
        </div>

        {/* Original Navigation Container */}
        <div className="relative flex-1 min-w-0 flex items-center justify-end">
          <div className="flex w-full items-center gap-2 sm:gap-4 overflow-x-auto scrollbar-hide [mask-image:linear-gradient(to_right,black_90%,transparent)] pr-8">
            
            {/* Nav Items */}
            {navItems?.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => setView(item.id as any)}
                  title={item.label}
                  className={`relative flex flex-shrink-0 items-center justify-center rounded-full p-2 sm:px-4 sm:py-2 transition-all ${
                    isActive 
                      ? 'bg-gradient-to-r from-[#F27D26] to-[#ff8a3d] text-white shadow-md' 
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-white' : ''}`} />
                  <span className="hidden lg:inline ml-2 text-sm font-medium">{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[#F27D26] text-[10px] font-black shadow-sm">
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
                className={`relative flex flex-shrink-0 items-center justify-center rounded-full p-2 sm:px-4 sm:py-2 transition-all ${
                  currentView === 'admin' ? 'bg-[#F27D26]/20 text-[#F27D26]' : 'text-red-400 hover:text-red-300 hover:bg-white/10'
                }`}
              >
                <ShieldAlert className="h-5 w-5" />
                <span className="hidden lg:inline ml-2 text-sm font-medium">{t.admin}</span>
              </button>
            )}

            {/* User Profile Summary */}
            {user && (
              <div className="hidden sm:flex flex-shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-white">
                 <User className="h-4 w-4 text-[#F27D26] mr-2" />
                 <span className="text-sm font-medium">{user.name || ''}</span>
              </div>
            )}

            <div className="h-6 w-px bg-white/20 mx-1 flex-shrink-0"></div>

            <button
              onClick={toggleLanguage}
              className="flex flex-shrink-0 items-center justify-center rounded-full p-2 text-slate-300 hover:bg-white/10 hover:text-white transition-all"
              title={lang === 'ar' ? 'Switch Language' : lang === 'en' ? 'گۆڕینی زمان' : 'Change Language'}
            >
              <Globe className="h-5 w-5 text-[#F27D26]" />
            </button>
            
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex flex-shrink-0 items-center justify-center rounded-full p-2 text-slate-300 hover:bg-white/10 hover:text-white transition-all"
              title={lang === 'ar' ? 'تغيير المظهر' : 'Toggle Theme'}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-slate-300" />}
            </button>

            {user && (
              <button
                onClick={() => setShowNotifications(true)}
                className="relative flex flex-shrink-0 items-center justify-center rounded-full p-2 text-slate-300 hover:bg-white/10 hover:text-white transition-all"
                title="الإشعارات"
              >
                <Bell className="h-5 w-5" />
                {unreadNotifs > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {unreadNotifs}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={onOpenFavorites}
              className="relative flex flex-shrink-0 items-center justify-center rounded-full p-2 text-slate-300 hover:bg-white/10 hover:text-white transition-all"
              title="المفضلة"
            >
              <Heart className="h-5 w-5" />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#ff8a3d] text-[10px] font-bold text-white">
                  {favorites.length}
                </span>
              )}
            </button>

            <div className="h-6 w-px bg-white/20 mx-1 flex-shrink-0"></div>

            <button
              onClick={onOpenAddProperty}
              className="flex flex-shrink-0 items-center justify-center rounded-full bg-[#F27D26] hover:bg-[#ff8a3d] text-white p-2 sm:px-4 sm:py-2 transition-all shadow-lg"
              title={t.addPropButton}
            >
              <PlusCircle className="h-5 w-5" />
              <span className="hidden lg:inline ml-2 text-sm font-bold">{t.addPropButton}</span>
            </button>
            
            {!user ? (
              <button
                onClick={onOpenLogin}
                className="flex flex-shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/5 p-2 sm:px-4 sm:py-2 text-white hover:bg-white/10 transition-all"
                title={t.loginButton}
              >
                <LogIn className="h-5 w-5 text-[#F27D26]" />
                <span className="hidden lg:inline ml-2 text-sm font-bold">{t.loginButton}</span>
              </button>
            ) : (
              <button
                onClick={onLogout}
                className="flex flex-shrink-0 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 p-2 sm:px-4 sm:py-2 text-red-300 hover:bg-red-500/20 transition-all"
                title={t.logout}
              >
                <LogOut className="h-5 w-5" />
                <span className="hidden lg:inline ml-2 text-sm font-bold">{t.logout}</span>
              </button>
            )}
            
          </div>
          {showScrollHint && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none pr-1 animate-pulse flex items-center justify-center">
              <div className="bg-black/50 backdrop-blur-sm rounded-full p-1 shadow-lg text-white">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
