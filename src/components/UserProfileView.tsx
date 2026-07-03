import React, { useState, useEffect } from 'react';
import { Phone, MessageSquare, ArrowLeft, BadgeCheck, MapPin, Sparkles, Building, Layers, Briefcase } from 'lucide-react';
import { Property, CitizenProfile } from '../types';
import { fetchProfileByIdentity } from '../utils/api';
import PropertyCard from './PropertyCard';

interface UserProfileViewProps {
  profileIdentity: string;
  lang: 'ar' | 'en' | 'ku';
  onBack: () => void;
  onViewPropertyDetails: (prop: Property) => void;
}

export default function UserProfileView({ profileIdentity, lang, onBack, onViewPropertyDetails }: UserProfileViewProps) {
  const [profile, setProfile] = useState<CitizenProfile | null>(null);
  const [userProps, setUserProps] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchProfileByIdentity(profileIdentity);
      setProfile(data.profile);
      setUserProps(data.properties || []);
    } catch (err: any) {
      console.error(err);
      setError(lang === 'ar' ? 'فشل تحميل الملف الشخصي للمستخدم.' : lang === 'ku' ? 'بارکردنی پرۆفایلی بەکارهێنەر سەرکەوتوو نەبوو.' : 'Failed to load user profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profileIdentity) {
      loadProfile();
    }
  }, [profileIdentity]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-right" dir="rtl">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-t-[#F27D26] border-white/10"></div>
        <p className="mt-4 text-xs text-slate-400 font-sans">جاري تحميل الملف التعريفي والصفحة الفريدة للعقاري...</p>
      </div>
    );
  }

  // Handle case when no profile exists but there are properties matched by ownerEmailOrPhone
  const displayName = profile ? profile.name : profileIdentity?.split('@')?.[0] || '';
  const displayBio = profile?.bio || (lang === 'ar' ? 'مستشار عقاري مستقل ومسوق معتمد عبر منصتنا.' : lang === 'ku' ? 'ڕاوێژکاری خانووبەرەی سەربەخۆ و ڕیکلامکاری پەسەندکراو لە پلاتفۆرمەکەمان.' : 'Independent verified real estate consultant.');
  const displayAvatar = profile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';
  const displayCover = profile?.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80';
  const displayPhone = profile?.phone || (profileIdentity.includes('@') ? '' : profileIdentity);
  const displayWhatsapp = profile?.whatsapp || displayPhone;

  return (
    <div id="user-profile-page" className="space-y-8 animate-fade-in text-right" dir="rtl">
      
      {/* Back button */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/5 bg-white/5 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{lang === 'ar' ? 'الرجوع للخلف' : lang === 'ku' ? 'گەڕانەوە بۆ دواوە' : 'Back'}</span>
        </button>
      </div>

      {/* Hero Header with Banner & Avatar */}
      <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-slate-950 shadow-xl">
        {/* Cover Photo */}
        <div className="h-48 sm:h-64 w-full relative">
          <img 
            src={displayCover} 
            alt="Cover" 
            className="h-full w-full object-cover opacity-60"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
        </div>

        {/* Profile Details Block */}
        <div className="relative p-6 pt-0 sm:px-10 -mt-16 sm:-mt-24 flex flex-col md:flex-row items-center md:items-end justify-between gap-6 pb-8 border-b border-white/5">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-5 text-center md:text-right">
            {/* Avatar */}
            <div className="h-28 w-28 sm:h-36 sm:w-36 rounded-2xl overflow-hidden border-4 border-[#070707] bg-slate-900 shadow-2xl relative">
              <img 
                src={displayAvatar} 
                alt={displayName} 
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Title / Slug */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <h2 className="text-2xl font-black text-white leading-tight">{displayName}</h2>
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  <span>{lang === 'ar' ? 'معلن معتمد' : lang === 'ku' ? 'ڕیکلامکاری پشتڕاستکراو' : 'Verified Publisher'}</span>
                </span>
              </div>
              
              <p className="text-xs text-slate-400 font-sans">
                {profile ? `@${profile.customSlug}` : `@${profileIdentity?.split('@')?.[0] || ''}`}
              </p>
            </div>
          </div>

          {/* Quick Contact Controls */}
          <div className="flex gap-3">
            {displayPhone && (
              <a
                href={`tel:${displayPhone}`}
                className="rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 px-5 py-3 text-xs font-bold text-white flex items-center gap-2 transition-all cursor-pointer shadow-lg"
              >
                <Phone className="h-4 w-4 text-[#F27D26]" />
                <span>{lang === 'ar' ? 'اتصال مباشر' : lang === 'ku' ? 'پەیوەندی ڕاستەوخۆ' : 'Call Phone'}</span>
              </a>
            )}

            {displayWhatsapp && (
              <a
                href={`https://wa.me/${displayWhatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-3 text-xs font-bold text-white flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-600/10"
              >
                <MessageSquare className="h-4 w-4" />
                <span>{lang === 'ar' ? 'واتساب مباشر' : lang === 'ku' ? 'واتسئاپی ڕاستەوخۆ' : 'WhatsApp'}</span>
              </a>
            )}
          </div>
        </div>

        {/* Bio Section */}
        <div className="p-6 sm:px-10 bg-slate-950/40">
          <h3 className="text-xs font-bold text-[#F27D26] uppercase tracking-wider mb-2">
            {lang === 'ar' ? 'نبذة وسيرة ذاتية' : lang === 'ku' ? 'دەربارە / ژیاننامە' : 'About / Bio'}
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed font-sans whitespace-pre-line max-w-4xl">
            {displayBio}
          </p>
        </div>

        {/* Join as Service Provider CTA */}
        <div className="p-6 sm:px-10 bg-gradient-to-r from-slate-900/80 to-[#F27D26]/5 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-white font-bold mb-1 flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-[#F27D26]" />
              {lang === 'ar' ? 'هل أنت مقدم خدمات عقارية؟' : 'Are you a Real Estate Service Provider?'}
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'ar' 
                ? 'انضم الآن لتعرض خدماتك الهندسية أو القانونية أو الصيانة لآلاف العملاء في منصة عدن.'
                : 'Join now to offer your engineering, legal, or maintenance services to thousands of clients on Aden Platform.'}
            </p>
          </div>
          <button className="whitespace-nowrap bg-white/10 hover:bg-[#F27D26] text-white px-5 py-2.5 rounded-lg text-xs font-bold transition-all border border-white/10 hover:border-[#F27D26]">
            {lang === 'ar' ? 'تسجيل كمقدم خدمة' : 'Register as Provider'}
          </button>
        </div>
      </div>

      {/* Grid of active properties belonging to this advertiser */}
      <div className="space-y-6">
        <div className="border-b border-white/5 pb-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Building className="h-5 w-5 text-[#F27D26]" />
            <span>{lang === 'ar' ? `العقارات المعروضة بواسطة ${displayName}` : lang === 'ku' ? `خانووبەرە نیشاندراوەکان لەلایەن ${displayName}` : `Properties Listed by ${displayName}`} ({userProps.length})</span>
          </h3>
          <p className="text-xs text-slate-400 font-sans mt-1">تصفح كافة العروض العقارية المصنفة والنشطة لدى هذا المعلن</p>
        </div>

        {userProps.length === 0 ? (
          <div className="rounded-3xl border border-white/5 bg-slate-950/20 p-12 text-center">
            <Layers className="mx-auto h-12 w-12 text-slate-600 mb-3" />
            <p className="text-sm text-slate-400">لا توجد أي عقارات معتمدة معروضة حالياً تحت هذه الصفحة.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {userProps?.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                isFavorite={false}
                onToggleFavorite={() => {}}
                onSelect={() => onViewPropertyDetails(property)}
                isComparing={false}
                onToggleCompare={() => {}}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
