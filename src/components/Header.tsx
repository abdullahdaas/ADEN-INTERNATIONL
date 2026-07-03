import React, { useState } from 'react';
import { Home, Search, Heart, MessageSquare, ShieldAlert, GitCompare, Menu, X, PlusCircle, LogIn, LogOut, Globe, User, Briefcase, FileCheck, FileSignature } from 'lucide-react';
import { Property } from '../types';
import { translations } from '../utils/translations';
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
  user,
  onOpenLogin,
  onOpenAddProperty,
  onLogout
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = translations[lang];

  const navItems = [
    { id: 'home', label: t.home, icon: Home },
    { id: 'listings', label: t.listings, icon: Search },
    { id: 'service-providers', label: lang === 'ar' ? 'الخدمات العقارية' : lang === 'en' ? 'Services' : 'خزمەتگوزارییەکان', icon: Briefcase },
    { id: 'map-search', label: lang === 'ar' ? 'الخريطة' : 'Map', icon: Search },
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
    <header id="app-header" className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#050505]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        
        {/* Brand Logo Only - Large, Clear and Beautiful, No side text, Float Animation */}
        <div 
          className="flex cursor-pointer items-center select-none animate-float hover:scale-105 transition-transform duration-300"
          onClick={() => setView('home')}
          onDoubleClick={onLogoDoubleClick}
          title={t.doubleClickAdminTip}
        >
          {/* Beautiful calligraphic animated AdenLogo */}
          <AdenLogo size={85} />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1 space-x-reverse">
          {navItems?.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => setView(item.id as any)}
                className={`relative flex items-center space-x-2 space-x-reverse rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-[#F27D26]/10 text-[#F27D26] border border-[#F27D26]/20' 
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -left-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#F27D26] text-[10px] font-bold text-white shadow-md animate-bounce">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
          
          {/* Admin link helper if already logged in */}
          {user?.role === 'admin' && (
            <button
              onClick={() => setView('admin')}
              className={`flex items-center space-x-1.5 space-x-reverse rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                currentView === 'admin' ? 'bg-[#F27D26]/10 text-[#F27D26]' : 'text-red-400 hover:bg-red-500/5'
              }`}
            >
              <ShieldAlert className="h-4 w-4" />
              <span>{t.admin}</span>
            </button>
          )}
        </nav>

        {/* Action Controls & Language Switcher */}
        <div className="flex items-center space-x-2 space-x-reverse">
          {/* Language Switch Button */}
          <button
            onClick={toggleLanguage}
            className="flex items-center space-x-1 space-x-reverse rounded-lg border border-white/5 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
            title={lang === 'ar' ? 'Switch Language' : lang === 'en' ? 'گۆڕینی زمان' : 'Change Language'}
          >
            <Globe className="h-3.5 w-3.5 text-[#F27D26]" />
            <span>{lang === 'ar' ? 'العربية' : lang === 'en' ? 'English' : 'کوردی'}</span>
          </button>

          {/* Add Property Button */}
          <button
            onClick={onOpenAddProperty}
            className="hidden sm:flex items-center space-x-1.5 space-x-reverse rounded-lg bg-gradient-to-r from-[#F27D26] to-[#ff8a3d] px-3.5 py-2 text-xs font-bold text-white shadow-lg shadow-[#F27D26]/10 hover:shadow-[#F27D26]/20 hover:scale-105 active:scale-95 transition-all"
          >
            <PlusCircle className="h-4 w-4" />
            <span>{t.addPropButton}</span>
          </button>

          {/* Favorites Button */}
          <button
            id="btn-favorites"
            onClick={onOpenFavorites}
            className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-white/5 bg-white/5 text-slate-300 transition-all hover:bg-[#F27D26]/10 hover:text-[#F27D26] hover:border-[#F27D26]/20"
            title="المفضلة"
          >
            <Heart className={`h-5 w-5 ${favorites.length > 0 ? 'fill-[#F27D26] text-[#F27D26]' : ''}`} />
            {favorites.length > 0 && (
              <span className="absolute -top-1 -left-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#ff8a3d] text-[9px] font-bold text-white">
                {favorites.length}
              </span>
            )}
          </button>

          {/* User Status / Login Button */}
          {user ? (
            <div className="relative group flex items-center space-x-1 space-x-reverse">
              <button
                onClick={onLogout}
                className="flex items-center space-x-1.5 space-x-reverse rounded-lg border border-red-500/10 bg-red-500/5 hover:bg-red-500/15 px-3 py-2 text-xs font-bold text-red-400 transition-all"
                title={t.logout}
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">{t.logout}</span>
              </button>
              
              <div className="hidden sm:flex items-center space-x-1.5 space-x-reverse rounded-lg border border-white/5 bg-white/5 px-2.5 py-2 text-xs text-slate-300">
                <User className="h-3.5 w-3.5 text-[#F27D26]" />
                <span className="max-w-[100px] truncate">{user.name?.split(' ')[0] || ''}</span>
                <span className={`inline-block h-1.5 w-1.5 rounded-full ${user.role === 'admin' ? 'bg-red-500' : 'bg-green-500'}`}></span>
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center space-x-1.5 space-x-reverse rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 text-xs font-bold text-white transition-all"
            >
              <LogIn className="h-3.5 w-3.5 text-[#F27D26]" />
              <span>{t.loginButton}</span>
            </button>
          )}

          {/* Admin Indicator */}
          {user?.role === 'admin' && currentView === 'admin' && (
            <div className="hidden lg:flex items-center space-x-1 space-x-reverse rounded-full bg-red-500/10 px-3 py-1 border border-red-500/20 text-[10px] text-red-400">
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>{t.admin}</span>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            id="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/5 bg-white/5 text-slate-300 hover:bg-white/10 md:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div id="mobile-nav-menu" className="border-t border-white/5 bg-[#050505]/95 backdrop-blur-lg md:hidden">
          <div className="space-y-2 px-4 py-4">
            {navItems?.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setView(item.id as any);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-base font-medium transition-all ${
                    isActive 
                      ? 'bg-[#F27D26]/15 text-[#F27D26]' 
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="rounded-full bg-[#F27D26] px-2.5 py-0.5 text-xs font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Mobile-Only Action: Add Property */}
            <button
              onClick={() => {
                onOpenAddProperty();
                setMobileMenuOpen(false);
              }}
              className="flex w-full items-center space-x-3 space-x-reverse rounded-lg bg-gradient-to-r from-[#F27D26] to-[#ff8a3d] px-4 py-3 text-base font-bold text-white shadow-md"
            >
              <PlusCircle className="h-5 w-5" />
              <span>{t.addProperty}</span>
            </button>
            
            {/* Mobile Admin link */}
            {user?.role === 'admin' && (
              <button
                onClick={() => {
                  setView('admin');
                  setMobileMenuOpen(false);
                }}
                className={`flex w-full items-center space-x-3 space-x-reverse rounded-lg px-4 py-3 text-base font-medium ${
                  currentView === 'admin' ? 'bg-[#F27D26]/15 text-[#F27D26]' : 'text-red-400 hover:bg-white/5'
                }`}
              >
                <ShieldAlert className="h-5 w-5" />
                <span>{t.admin}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
