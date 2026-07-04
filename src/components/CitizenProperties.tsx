import React, { useState, useEffect } from 'react';
import { 
  Sparkles, CheckCircle, Clock, AlertTriangle, CreditCard, Send, 
  ShieldAlert, BadgeCheck, Upload, Trash2, Edit, User, ClipboardList,
  MapPin, Eye, Building, Plus, X, Globe, Phone, MessageSquare
} from 'lucide-react';
import { Property, PaymentProof, CitizenProfile } from '../types';
import { fetchProperties, submitPaymentProof, updateProperty, deleteProperty, fetchProfileByIdentity, saveProfile, fetchSettings, fetchPayments } from '../utils/api';
import { IRAQ_LOCATIONS } from '../data/iraqLocations';
import { SmartLocationPicker } from './SmartLocationPicker';

interface CitizenPropertiesProps {
  user: { name: string; role: 'citizen'; emailOrPhone?: string };
  lang: 'ar' | 'en' | 'ku';
  onViewPropertyDetails: (prop: Property) => void;
}

export default function CitizenProperties({ user, lang, onViewPropertyDetails }: CitizenPropertiesProps) {
  const [activeTab, setActiveTab] = useState<'my-props' | 'profile'>('my-props');
  const [myProps, setMyProps] = useState<Property[]>([]);
  const [myPayments, setMyPayments] = useState<PaymentProof[]>([]);
  const [settings, setSettings] = useState<{ mastercard: string; zainCash: string }>({ mastercard: '910190714683', zainCash: '07810060292' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Promotion modal state
  const [selectedProp, setSelectedProp] = useState<Property | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<'basic' | 'medium' | 'premium' | 'unlimited'>('basic');
  const [paymentMethod, setPaymentMethod] = useState<'zain_cash' | 'qi_card'>('zain_cash');
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [proofImage, setProofImage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Edit Property modal state
  const [selectedEditProp, setSelectedEditProp] = useState<Property | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editSpace, setEditSpace] = useState('');
  const [editStatus, setEditStatus] = useState<any>('للبيع');
  const [editBuildingType, setEditBuildingType] = useState('منزل');
  const [editLocationData, setEditLocationData] = useState<any>(null);
  const [isEditLocationValid, setIsEditLocationValid] = useState(true);
  const [editBedrooms, setEditBedrooms] = useState(1);
  const [editBathrooms, setEditBathrooms] = useState(1);
  const [editLivingRooms, setEditLivingRooms] = useState(1);
  const [editFloors, setEditFloors] = useState(1);
  const [editConstructionYear, setEditConstructionYear] = useState(2025);
  const [editIsFurnished, setEditIsFurnished] = useState(false);
  const [editHasGarage, setEditHasGarage] = useState(false);
  const [editHasGarden, setEditHasGarden] = useState(false);
  const [editHasElevator, setEditHasElevator] = useState(false);
  const [editHasGenerator, setEditHasGenerator] = useState(false);
  const [editHasSolarPower, setEditHasSolarPower] = useState(false);
  const [editHasPool, setEditHasPool] = useState(false);
  const [editImages, setEditImages] = useState<string[]>([]);
  const [editVideoUrl, setEditVideoUrl] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Profile Form state
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileSlug, setProfileSlug] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileWhatsapp, setProfileWhatsapp] = useState('');
  const [profileBio, setProfileBio] = useState('');
  const [profileAvatar, setProfileAvatar] = useState('');
  const [profileCover, setProfileCover] = useState('');
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);
  const [profileSaveError, setProfileSaveError] = useState('');

  // Location dropdown synchronization for Edit Property
  const [districtsList, setDistrictsList] = useState<any[]>([]);
  const [subDistrictsList, setSubDistrictsList] = useState<any[]>([]);
  const [neighborhoodsList, setNeighborhoodsList] = useState<string[]>([]);

  const packagesInfo = {
    basic: { nameAr: 'الباقة البرونزية (عادي تمويل)', nameEn: 'Bronze Package', price: 5, priceAr: '5$ (7,500 د.ع)', descAr: 'إبراز الإعلان في نتائج البحث العادية وزيادة نسبة المشاهدات بنسبة 1.5x لمدة 7 أيام.', descEn: 'Highlight in search results for 7 days.' },
    medium: { nameAr: 'الباقة الفضية (مميز الفئة)', nameEn: 'Silver Package', price: 10, priceAr: '10$ (15,000 د.ع)', descAr: 'إعلان مميز يظهر في مقدمة القضاء والنواحي التابع لها العقار مع شارة "مميز" الفضية لمدة 15 يوماً.', descEn: 'Featured in your specific district for 15 days.' },
    premium: { nameAr: 'الباقة الذهبية (ترقية كبرى)', nameEn: 'Gold Package', price: 25, priceAr: '25$ (37,500 د.ع)', descAr: 'ظهور فائق التمييز على مستوى المحافظة بالكامل باللون البرتقالي اللامع وشارة "نجمة" ذهبية مع إرسال إشعارات للمهتمين.', descEn: 'High-visibility county-wide featured listing for 30 days.' },
    unlimited: { nameAr: 'الباقة البلاتينية (التمويل اللامحدود)', nameEn: 'Platinum Package', price: 50, priceAr: '50$ (75,000 د.ع)', descAr: 'تثبيت العقار في السلايدر الرئيسي بصفحة البداية وتغطية ترويجية شاملة على صفحات السوشيال ميديا الخاصة بالمنصة.', descEn: 'Sticky on homepage banner slider + social media campaigns.' }
  };

  const loadMyProperties = async () => {
    try {
      setLoading(true);
      setError('');
      // Fetch settings
      try {
        const sysSettings = await fetchSettings();
        if (sysSettings) setSettings(sysSettings);
      } catch (e) {
        console.error('Error fetching settings', e);
      }
      
      // Fetch all properties
      const allProps = await fetchProperties({ isApproved: 'all' });
      // Filter by owner identity (emailOrPhone)
      const filtered = allProps.filter(
        p => p.ownerEmailOrPhone && p.ownerEmailOrPhone.trim().toLowerCase() === user.emailOrPhone?.trim().toLowerCase()
      );
      setMyProps(filtered);
      
      try {
        const allPays = await fetchPayments();
        setMyPayments(allPays.filter(p => filtered.some(f => f.id === p.propertyId)));
      } catch (e) {}
    } catch (err: any) {
      console.error(err);
      setError(lang === 'ar' ? 'فشل في تحميل العقارات الخاصة بك.' : lang === 'ku' ? 'بارکردنی خانووبەرەکانت سەرکەوتوو نەبوو.' : 'Failed to load your properties.');
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async () => {
    if (!user.emailOrPhone) return;
    try {
      setProfileLoading(true);
      const data = await fetchProfileByIdentity(user.emailOrPhone);
      if (data.profile) {
        setProfileName(data.profile.name);
        setProfileSlug(data.profile.customSlug);
        setProfilePhone(data.profile.phone);
        setProfileWhatsapp(data.profile.whatsapp);
        setProfileBio(data.profile.bio);
        setProfileAvatar(data.profile.avatar);
        setProfileCover(data.profile.coverImage);
      } else {
        // Default placeholder profile
        setProfileName(user.name);
        setProfileSlug('user-' + user.emailOrPhone.replace(/[^a-zA-Z0-9]/g, '').toLowerCase());
        setProfilePhone('');
        setProfileWhatsapp('');
        setProfileBio('');
        setProfileAvatar('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80');
        setProfileCover('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    if (user?.emailOrPhone) {
      loadMyProperties();
      loadProfile();
    }
  }, [user]);

  // Sync Districts list based on Governorate
  

  // Sync Sub-Districts list based on District
  

  // Sync Neighborhoods list based on Sub-District
  

  // Handle proof image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Profile Avatar Upload
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Profile Cover Upload
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileCover(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle property image additions
  const handlePropertyImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveEditImage = (index: number) => {
    setEditImages(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleDeleteProp = async (id: string) => {
    if (!window.confirm(lang === 'ar' ? 'هل أنت متأكد من رغبتك في إلغاء نشر هذا العقار؟ (سيخضع العقار لمراجعة الإدارة قبل الحذف النهائي)' : lang === 'ku' ? 'دڵنیای لە هەڵوەشاندنەوەی بڵاوکردنەوەی ئەم خانووبەرەیە؟ (خانووبەرەکە پێش سڕینەوەی یەکجاری پێداچوونەوەی بۆ دەکرێت لەلایەن بەڕێوەبەرایەتییەوە)' : 'Are you sure you want to unpublish this property? (It will be reviewed by admin before final deletion)')) return;
    try {
      await updateProperty(id, { pendingDeletion: true, isApproved: false });
      alert(lang === 'ar' ? 'تم إرسال طلب الحذف للإدارة للمراجعة.' : lang === 'ku' ? 'داواکاری سڕینەوە نێردرا بۆ بەڕێوەبەرایەتی بۆ پێداچوونەوە.' : 'Deletion request sent to admin for review.');
      loadMyProperties();
    } catch (err) {
      alert(lang === 'ar' ? 'حدث خطأ أثناء إلغاء نشر العقار' : lang === 'ku' ? 'هەڵەیەک ڕوویدا لە کاتی هەڵوەشاندنەوەی بڵاوکردنەوەی خانووبەرە' : 'Error unpublishing property');
    }
  };

  // Open property editor
  const handleOpenEditModal = (prop: Property) => {
    setSelectedEditProp(prop);
    setEditTitle(prop.title);
    setEditDesc(prop.description);
    setEditPrice(prop.price.toString());
    setEditSpace(prop.space.toString());
    setEditStatus(prop.status);
    setEditBuildingType(prop.buildingType);
    
    setEditBedrooms(prop.bedrooms);
    setEditBathrooms(prop.bathrooms);
    setEditLivingRooms(prop.livingRooms);
    setEditFloors(prop.floors);
    setEditConstructionYear(prop.constructionYear);
    setEditIsFurnished(prop.isFurnished);
    setEditHasGarage(prop.hasGarage);
    setEditHasGarden(prop.hasGarden);
    setEditHasElevator(prop.hasElevator);
    setEditHasGenerator(prop.hasGenerator);
    setEditHasSolarPower(prop.hasSolarPower);
    setEditHasPool(prop.hasPool);
    setEditImages(prop.images || []);
    setEditVideoUrl(prop.videoUrl || '');
  };

  const handlePropertyEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEditProp) return;

    try {
      setIsSavingEdit(true);
      const parsedPrice = parseFloat(editPrice) || 0;
      const parsedSpace = parseFloat(editSpace) || 0;

      const updatedPayload: Partial<Property> = {
        title: editTitle,
        description: editDesc,
        price: parsedPrice,
        space: parsedSpace,
        status: editStatus,
        buildingType: editBuildingType,
        ...editLocationData,
        bedrooms: editBedrooms,
        bathrooms: editBathrooms,
        livingRooms: editLivingRooms,
        floors: editFloors,
        constructionYear: editConstructionYear,
        isFurnished: editIsFurnished,
        hasGarage: editHasGarage,
        hasGarden: editHasGarden,
        hasElevator: editHasElevator,
        hasGenerator: editHasGenerator,
        hasSolarPower: editHasSolarPower,
        hasPool: editHasPool,
        images: editImages,
        videoUrl: editVideoUrl || undefined
      };

      await updateProperty(selectedEditProp.id, updatedPayload);
      alert(lang === 'ar' ? 'تم حفظ تعديلات العقار بنجاح!' : lang === 'ku' ? 'گۆڕانکارییەکانی خانووبەرە بە سەرکەوتوویی پاشەکەوت کران!' : 'Property updated successfully!');
      setSelectedEditProp(null);
      loadMyProperties();
    } catch (err: any) {
      console.error(err);
      alert(lang === 'ar' ? 'فشل حفظ التعديلات' : lang === 'ku' ? 'پاشەکەوتکردنی گۆڕانکارییەکان سەرکەوتوو نەبوو' : 'Failed to save edits');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handlePromotionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProp) return;
    if (!senderName || !senderPhone || !proofImage) {
      alert(lang === 'ar' ? 'يرجى ملء كافة الحقول ورفع صورة إيصال التحويل المالي!' : lang === 'ku' ? 'تکایە هەموو خانەکان پڕ بکەرەوە و وێنەی پسوولەی پارەدانەکە باربکە!' : 'Please fill all fields and upload the payment receipt proof image!');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        propertyId: selectedProp.id,
        packageName: selectedPackage,
        amount: packagesInfo[selectedPackage].price,
        paymentMethod,
        proofImage,
        senderName,
        senderPhone,
        transactionId: transactionId || undefined
      };

      await submitPaymentProof(payload);
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setSelectedProp(null);
        // Reset fields
        setSenderName('');
        setSenderPhone('');
        setTransactionId('');
        setProofImage('');
        loadMyProperties();
      }, 3000);
    } catch (err: any) {
      console.error(err);
      alert(lang === 'ar' ? 'فشل إرسال طلب التمويل!' : lang === 'ku' ? 'ناردنی داواکاری پارەدانەکە سەرکەوتوو نەبوو!' : 'Failed to submit funding request!');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit profile details
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user.emailOrPhone) return;

    try {
      setProfileSaveSuccess(false);
      setProfileSaveError('');
      
      const payload = {
        emailOrPhone: user.emailOrPhone,
        name: profileName,
        customSlug: profileSlug,
        phone: profilePhone,
        whatsapp: profileWhatsapp,
        bio: profileBio,
        avatar: profileAvatar,
        coverImage: profileCover
      };

      await saveProfile(payload);
      setProfileSaveSuccess(true);
      loadProfile();
    } catch (err: any) {
      console.error(err);
      setProfileSaveError(err.message || (lang === 'ar' ? 'حدث خطأ أثناء حفظ التغييرات.' : lang === 'ku' ? 'هەڵەیەک ڕوویدا لە کاتی پاشەکەوتکردنی گۆڕانکارییەکان.' : 'Failed to save profile changes.'));
    }
  };

  return (
    <div id="citizen-dashboard" className="space-y-8 animate-fade-in text-right" dir="rtl">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white font-sans flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-[#F27D26] animate-pulse" />
            <span>لوحة تحكم شؤون المواطن</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            مرحباً بك، <span className="text-[#F27D26] font-bold">{user.name}</span>. صمم وعدّل ملفك التعريفي الفريد، وقم بمتابعة وتعديل كافة عقاراتك وتمويلها بيسر وسرعة.
          </p>
        </div>
      </div>

      {/* TABS SWITCHER */}
      <div className="flex border-b border-white/5 gap-2 pb-px">
        <button
          onClick={() => setActiveTab('my-props')}
          className={`flex items-center gap-1.5 px-5 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'my-props'
              ? 'border-[#F27D26] text-[#F27D26] bg-[#F27D26]/5'
              : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
          } rounded-t-xl`}
        >
          <ClipboardList className="h-4.5 w-4.5" />
          <span>عقاراتي المعروضة</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-1.5 px-5 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'profile'
              ? 'border-[#F27D26] text-[#F27D26] bg-[#F27D26]/5'
              : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
          } rounded-t-xl`}
        >
          <User className="h-4.5 w-4.5" />
          <span>الملف التعريفي والصفحة الفريدة</span>
        </button>
      </div>

      {/* TAB 1: PROPERTIES DIRECTORY */}
      {activeTab === 'my-props' && (
        <>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-t-[#F27D26] border-white/10"></div>
              <p className="mt-4 text-xs text-slate-400">جاري تحميل عقاراتك الخاصة من الخادم العراقي...</p>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-500/10 bg-red-500/5 p-6 text-center">
              <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-2" />
              <p className="text-sm font-bold text-red-400">{error}</p>
              <button onClick={loadMyProperties} className="mt-4 text-xs font-bold text-[#ffffff] bg-red-500/25 border border-red-500/40 rounded-xl px-4 py-2 hover:bg-red-500/40 transition-all">إعادة المحاولة</button>
            </div>
          ) : myProps.length === 0 ? (
            <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/5 text-slate-400 mb-4">
                <CreditCard className="h-8 w-8" />
              </div>
              <h3 className="text-base font-bold text-white">لا توجد عقارات منشورة بعد</h3>
              <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto font-sans">
                لم تقم بنشر أي عقار تحت هذا الحساب ({user.emailOrPhone}) حتى الآن. قم بنشر عقارك الأول مجاناً من الزر العلوي "أضف عقارك"!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myProps?.map((prop) => (
                <div 
                  key={prop.id} 
                  className="group relative rounded-2xl border border-white/5 bg-gradient-to-b from-slate-900/60 to-slate-950/60 p-4 transition-all duration-300 hover:border-[#F27D26]/30 hover:shadow-2xl hover:shadow-[#F27D26]/5"
                >
                  {/* Image Container */}
                  <div className="relative h-44 w-full overflow-hidden rounded-xl bg-slate-900">
                    <img 
                      src={prop.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'} 
                      alt={prop.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Overlay status tag */}
                    <div className="absolute top-3 right-3 flex gap-1.5">
                      {prop.isApproved ? (
                        <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 text-xs font-bold text-emerald-400 backdrop-blur-md">
                          <CheckCircle className="h-3 w-3" />
                          <span>معتمد ونشط للعامة</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 text-xs font-bold text-amber-400 backdrop-blur-md animate-pulse">
                          <Clock className="h-3 w-3" />
                          <span>قيد المراجعة والتدقيق</span>
                        </span>
                      )}

                      {prop.isFeatured && (
                        <span className="flex items-center gap-1 rounded-full bg-[#F27D26]/20 border border-[#F27D26]/30 px-2.5 py-1 text-xs font-bold text-[#F27D26] backdrop-blur-md">
                          <BadgeCheck className="h-3 w-3 text-[#F27D26]" />
                          <span>مميز</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Stats */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-slate-500">#{prop.id}</span>
                      <span className="text-xs font-bold text-emerald-400">{(prop.price ?? 0).toLocaleString()} د.ع</span>
                    </div>
                    <h3 className="text-sm font-black text-white line-clamp-1">{prop.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-1">{prop.governorate} • {prop.district} • {prop.subDistrict}</p>
                  </div>

                  {/* Action buttons */}
                  <div className="mt-5 pt-3 border-t border-white/5 flex flex-wrap gap-2">
                    <button 
                      onClick={() => onViewPropertyDetails(prop)}
                      className="flex-1 rounded-xl bg-white/5 border border-white/5 py-2 text-xs font-bold text-slate-300 hover:bg-[#F27D26]/10 hover:text-[#F27D26] hover:border-[#F27D26]/20 transition-all cursor-pointer text-center "
                    >
                      عرض كامل التفاصيل
                    </button>

                    <button 
                      onClick={() => {
                        setSelectedProp(prop);
                        setSubmitSuccess(false);
                      }}
                      className="flex-1 rounded-xl bg-[#F27D26]/10 border border-[#F27D26]/20 py-2 text-xs font-black text-[#F27D26] hover:bg-[#F27D26] hover:text-[#ffffff] transition-all cursor-pointer flex items-center justify-center gap-1.5 "
                    >
                      <CreditCard className="h-3.5 w-3.5" />
                      <span>تمويل الإعلان</span>
                    </button>

                    <button
                      onClick={() => handleOpenEditModal(prop)}
                      className="p-2 rounded-xl border border-white/10 hover:border-[#F27D26]/30 bg-white/5 hover:bg-[#F27D26]/10 text-slate-300 hover:text-[#F27D26] transition-all"
                      title="تعديل تفاصيل العقار"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteProp(prop.id)}
                      className="p-2 rounded-xl border border-red-500/10 hover:border-red-500/30 bg-red-500/5 hover:bg-red-500/20 text-red-400 transition-all"
                      title="حذف العقار نهائياً"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  
                  {/* Payment Proof Status */}
                  {myPayments.filter(p => p.propertyId === prop.id)?.map(pay => (
                    <div key={pay.id} className="mt-3 p-3 rounded-xl border border-white/5 bg-slate-950/50 text-xs">
                      {pay.status === 'pending' ? (
                        <p className="text-amber-400 flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
                          جاري تدقيق الدفع (قيد الانتظار)
                        </p>
                      ) : pay.status === 'rejected' ? (
                        <div className="text-rose-400">
                          <p className="font-bold flex items-center gap-1.5 mb-1">
                            <span className="h-2 w-2 rounded-full bg-rose-400"></span>
                            تم رفض الدفع
                          </p>
                          <p className="text-xs text-slate-400">{pay.rejectionReason}</p>
                        </div>
                      ) : (
                        <p className="text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle className="h-3.5 w-3.5" />
                          تم التمويل ({pay.packageName})
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* TAB 2: PROFILE PAGE BUILDER */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* PROFILE FORM */}
          <form onSubmit={handleProfileSave} className="lg:col-span-2 rounded-3xl border border-white/5 bg-slate-950 p-6 space-y-6">
            <div className="border-b border-white/5 pb-4">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <User className="h-5.5 w-5.5 text-[#F27D26]" />
                <span>إعدادات وتخصيص الصفحة الشخصية العامة</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-sans">
                هذه الصفحة عامة وحصرية لك ومحفوظة ضد التكرار. يستطيع الزوار العثور عليها وتصفح كل عقاراتك منها.
              </p>
            </div>

            {profileSaveSuccess && (
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs font-bold text-emerald-400 text-center font-sans">
                ✓ تم حفظ وتحديث ملفك الشخصي والصفحة العامة بنجاح!
              </div>
            )}

            {profileSaveError && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-xs font-bold text-red-400 text-center font-sans">
                ⚠️ {profileSaveError}
              </div>
            )}

            {/* Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">اسم العرض العام (أو اسم المكتب)</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: مكتب النبلاء للعقارات"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full rounded-xl border border-white/5 bg-slate-900 px-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-[#F27D26]/40"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5">رابط الصفحة الفريد (Username Slug)</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="مثال: al-nobala-estate"
                    value={profileSlug}
                    onChange={(e) => setProfileSlug(e.target.value)}
                    className="w-full rounded-xl border border-white/5 bg-slate-900 px-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-[#F27D26]/40 text-left font-mono"
                  />
                  <span className="absolute left-3 top-2.5 text-xs text-slate-500">@</span>
                </div>
                <p className="text-xs text-slate-500 mt-1 font-sans">
                  سيصبح رابطك: <span className="text-[#F27D26] font-mono">?profile={profileSlug || 'slug'}</span>
                </p>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5">رقم هاتف الاتصال للعملاء</label>
                <input
                  type="text"
                  placeholder="مثال: 07801122334"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className="w-full rounded-xl border border-white/5 bg-slate-900 px-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-[#F27D26]/40 text-left font-mono"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5">رقم واتساب المباشر</label>
                <input
                  type="text"
                  placeholder="مثال: 07801122334"
                  value={profileWhatsapp}
                  onChange={(e) => setProfileWhatsapp(e.target.value)}
                  className="w-full rounded-xl border border-white/5 bg-slate-900 px-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-[#F27D26]/40 text-left font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1.5">نبذة تعريفية وسيرة للمكتب أو المعلن</label>
              <textarea
                rows={4}
                placeholder="اكتب نبذة مهنية عن تخصصكم العقاري ومناطق تغطيتكم لكسب ثقة المشترين..."
                value={profileBio}
                onChange={(e) => setProfileBio(e.target.value)}
                className="w-full rounded-xl border border-white/5 bg-slate-900 px-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none font-sans"
              />
            </div>

            {/* Images */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Avatar Upload */}
              <div className="space-y-2">
                <label className="block text-xs text-slate-400">صورة الحساب / الشعار (Avatar)</label>
                <div className="flex items-center gap-4 bg-slate-900 p-3 rounded-xl border border-white/5">
                  <div className="h-12 w-12 rounded-lg overflow-hidden bg-slate-800">
                    <img src={profileAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'} alt="Avatar" className="h-full w-full object-cover" />
                  </div>
                  <div className="relative flex-1">
                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="absolute inset-0 opacity-0 cursor-pointer h-full w-full" />
                    <button type="button" className="w-full rounded-lg bg-white/5 border border-white/5 text-xs py-1.5 text-slate-300 font-bold hover:bg-white/10 transition-all">رفع صورة</button>
                  </div>
                </div>
              </div>

              {/* Cover Upload */}
              <div className="space-y-2">
                <label className="block text-xs text-slate-400">صورة غلاف صفحتك الشخصية</label>
                <div className="flex items-center gap-4 bg-slate-900 p-3 rounded-xl border border-white/5">
                  <div className="h-12 w-16 rounded-lg overflow-hidden bg-slate-800">
                    <img src={profileCover || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'} alt="Cover" className="h-full w-full object-cover" />
                  </div>
                  <div className="relative flex-1">
                    <input type="file" accept="image/*" onChange={handleCoverChange} className="absolute inset-0 opacity-0 cursor-pointer h-full w-full" />
                    <button type="button" className="w-full rounded-lg bg-white/5 border border-white/5 text-xs py-1.5 text-slate-300 font-bold hover:bg-white/10 transition-all">رفع غلاف</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-white/5 pt-5 flex justify-end">
              <button
                type="submit"
                disabled={profileLoading}
                className="rounded-xl bg-gradient-to-r from-[#F27D26] to-[#ff8a3d] px-6 py-3 text-xs font-black text-white hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="h-4 w-4" />
                <span>حفظ ونشر التغييرات العامة</span>
              </button>
            </div>
          </form>

          {/* LIVE PREVIEW CARD */}
          <div className="rounded-3xl border border-white/5 bg-slate-950 p-6 space-y-4 h-fit sticky top-6">
            <h4 className="text-xs font-bold text-[#F27D26] flex items-center gap-1">
              <Globe className="h-4 w-4" />
              <span>معاينة حية لصفحتك العامة للعملاء:</span>
            </h4>

            <div className="rounded-2xl border border-white/10 bg-slate-900 overflow-hidden shadow-2xl relative">
              {/* Cover */}
              <div className="h-24 bg-slate-800 relative">
                <img src={profileCover} alt="Cover" className="h-full w-full object-cover opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent"></div>
              </div>

              {/* Identity overlapping */}
              <div className="p-4 pt-0 -mt-8 relative text-center">
                <div className="h-16 w-16 rounded-xl border-2 border-slate-900 bg-slate-950 overflow-hidden mx-auto shadow-xl">
                  <img src={profileAvatar} alt="Avatar" className="h-full w-full object-cover" />
                </div>

                <div className="mt-2.5">
                  <h5 className="text-sm font-black text-white flex items-center justify-center gap-1">
                    <span>{profileName || 'اسمك الكريم'}</span>
                    <BadgeCheck className="h-3.5 w-3.5 text-emerald-400" />
                  </h5>
                  <p className="text-[9px] text-[#F27D26] font-mono">?profile={profileSlug || 'username'}</p>
                </div>

                <p className="text-xs text-slate-400 font-sans mt-2 line-clamp-2 leading-relaxed">
                  {profileBio || 'نبذة تصف نشاطك العقاري في السوق العراقي...'}
                </p>

                {/* Contact triggers mock */}
                <div className="mt-4 pt-3 border-t border-white/5 flex gap-2 justify-center">
                  <div className="px-2.5 py-1 rounded bg-white/5 border border-white/5 text-[9px] text-slate-300 flex items-center gap-1">
                    <Phone className="h-3 w-3 text-[#F27D26]" />
                    <span>هاتف</span>
                  </div>
                  <div className="px-2.5 py-1 rounded bg-emerald-600/20 border border-emerald-600/20 text-[9px] text-emerald-400 flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    <span>واتساب</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F27D26]/10 border border-[#F27D26]/10 text-[10.5px] text-slate-300 leading-relaxed font-sans">
              يستطيع العامة والزبائن الضغط على اسمك في أي بطاقة عقار لفتح هذه الصفحة الحصرية، لرؤية نبذتك والتواصل المباشر معك وتصفح كافة عقاراتك المعتمدة المنشورة دفعة واحدة!
            </div>
          </div>

        </div>
      )}

      {/* COMPREHENSIVE PROPERTY EDIT MODAL */}
      {selectedEditProp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-3xl border border-white/10 bg-[#0a0a0a] p-6 shadow-2xl my-8 text-right" dir="rtl">
            
            {/* Close trigger */}
            <button
              onClick={() => setSelectedEditProp(null)}
              className="absolute top-4 left-4 rounded-lg bg-white/5 border border-white/5 p-1.5 text-slate-400 hover:text-white transition-all cursor-pointer z-10"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <div className="border-b border-white/5 pb-4 mb-5">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Edit className="h-5.5 w-5.5 text-[#F27D26]" />
                <span>تعديل وتحيين بيانات العقار: #{selectedEditProp.id}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-sans">قم بمراجعة وتعديل كافة التفاصيل والمواصفات وسيتم تحديثها فورياً في السوق.</p>
            </div>

            <form onSubmit={handlePropertyEditSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              
              {/* Title & Type */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">عنوان الإعلان العقاري</label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full rounded-xl border border-white/5 bg-slate-950 px-3.5 py-2 text-xs text-white outline-none focus:border-[#F27D26]/40"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">تصنيف البناء والعقار</label>
                  <select
                    value={editBuildingType}
                    onChange={(e) => setEditBuildingType(e.target.value)}
                    className="w-full rounded-xl border border-white/5 bg-slate-950 px-3.5 py-2 text-xs text-white outline-none cursor-pointer"
                  >
                    <option value="منزل">منزل سكني (بيت)</option>
                    <option value="شقة">شقة سكنية</option>
                    <option value="فيلا">فيلا فاخرة</option>
                    <option value="أرض">أرض سكنية أو زراعية</option>
                    <option value="مجمع تجاري">مجمع أو محل تجاري</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs text-slate-400 mb-1">تفاصيل ومواصفات العقار الشاملة</label>
                <textarea
                  rows={3}
                  required
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full rounded-xl border border-white/5 bg-slate-950 px-3.5 py-2 text-xs text-white outline-none font-sans"
                />
              </div>

              {/* Price, Space, Status */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">السعر الكلي بالدينار العراقي (IQD)</label>
                  <input
                    type="number"
                    required
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full rounded-xl border border-white/5 bg-slate-950 px-3.5 py-2 text-xs text-white outline-none focus:border-[#F27D26]/40"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">المساحة الإجمالية (م²)</label>
                  <input
                    type="number"
                    required
                    value={editSpace}
                    onChange={(e) => setEditSpace(e.target.value)}
                    className="w-full rounded-xl border border-white/5 bg-slate-950 px-3.5 py-2 text-xs text-white outline-none focus:border-[#F27D26]/40"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">حالة العرض</label>
                  <select
                    value={editStatus}
                    onChange={(e: any) => setEditStatus(e.target.value)}
                    className="w-full rounded-xl border border-white/5 bg-slate-950 px-3.5 py-2 text-xs text-white outline-none cursor-pointer"
                  >
                    <option value="للبيع">للبيع</option>
                    <option value="للإيجار">للإيجار</option>
                    <option value="محجوز">محجوز</option>
                    <option value="تم البيع">تم البيع</option>
                    <option value="تم التأجير">تم التأجير</option>
                  </select>
                </div>
              </div>

              {/* Location Hierarchical Selectors */}
              <div className="bg-slate-950 rounded-xl p-4 border border-white/5 space-y-3">
                <h4 className="text-xs font-bold text-[#F27D26] flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>تعديل وتدقيق الموقع الجغرافي العراقي:</span>
                </h4>

                <SmartLocationPicker 
                      initialLocation={editLocationData} 
                      onChange={(loc, isValid) => { setEditLocationData(loc); setIsEditLocationValid(isValid); }} 
                      lang={lang} 
                    />
              </div>
              
              {/* Specs & Features Grid */}
              <div className="bg-slate-950 rounded-xl p-4 border border-white/5">
                <h4 className="text-xs font-bold text-[#F27D26] mb-3 flex items-center gap-1">
                  <Building className="h-4 w-4" />
                  <span>مواصفات ومرافق العقار الأساسية:</span>
                </h4>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 text-right mb-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">غرف النوم</label>
                    <input type="number" value={editBedrooms} onChange={(e) => setEditBedrooms(parseInt(e.target.value) || 0)} className="w-full rounded-lg bg-slate-900 border border-white/5 px-2 py-1 text-xs text-white text-center" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">الحمامات</label>
                    <input type="number" value={editBathrooms} onChange={(e) => setEditBathrooms(parseInt(e.target.value) || 0)} className="w-full rounded-lg bg-slate-900 border border-white/5 px-2 py-1 text-xs text-white text-center" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">الصالات المفتوحة</label>
                    <input type="number" value={editLivingRooms} onChange={(e) => setEditLivingRooms(parseInt(e.target.value) || 0)} className="w-full rounded-lg bg-slate-900 border border-white/5 px-2 py-1 text-xs text-white text-center" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">عدد الطوابق</label>
                    <input type="number" value={editFloors} onChange={(e) => setEditFloors(parseInt(e.target.value) || 0)} className="w-full rounded-lg bg-slate-900 border border-white/5 px-2 py-1 text-xs text-white text-center" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">سنة التشييد</label>
                    <input type="number" value={editConstructionYear} onChange={(e) => setEditConstructionYear(parseInt(e.target.value) || 0)} className="w-full rounded-lg bg-slate-900 border border-white/5 px-2 py-1 text-xs text-white text-center" />
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 pt-2 border-t border-white/5 text-xs">
                  {[
                    { label: 'مؤثث بالكامل', val: editIsFurnished, set: setEditIsFurnished },
                    { label: 'كراج سيارات واسع', val: editHasGarage, set: setEditHasGarage },
                    { label: 'حديقة منسقة', val: editHasGarden, set: setEditHasGarden },
                    { label: 'يحتوي مصعد كهربائي', val: editHasElevator, set: setEditHasElevator },
                    { label: 'مولد كهربائي خاص', val: editHasGenerator, set: setEditHasGenerator },
                    { label: 'منظومة طاقة شمسية', val: editHasSolarPower, set: setEditHasSolarPower },
                    { label: 'مسبح خاص', val: editHasPool, set: setEditHasPool }
                  ]?.map((chk, idx) => (
                    <label key={idx} className="flex items-center gap-2 cursor-pointer select-none text-slate-300 hover:text-white">
                      <input type="checkbox" checked={chk.val} onChange={(e) => chk.set(e.target.checked)} className="rounded border-white/10 bg-slate-900 accent-[#F27D26]" />
                      <span>{chk.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Videos and images */}
              <div className="bg-slate-950 rounded-xl p-4 border border-white/5 space-y-3">
                <h4 className="text-xs font-bold text-[#F27D26]">الوسائط الإعلامية المرئية:</h4>
                
                <div>
                  <label className="block text-xs text-slate-400 mb-1">رابط جولة الفيديو (YouTube/Drive)</label>
                  <input
                    type="text"
                    value={editVideoUrl}
                    onChange={(e) => setEditVideoUrl(e.target.value)}
                    placeholder="e.g. https://youtube.com/watch?v=..."
                    className="w-full rounded-lg border border-white/5 bg-slate-900 px-3 py-1.5 text-xs text-white outline-none focus:border-[#F27D26]/40 font-mono text-left"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">صور العقار المنشورة ({editImages.length})</label>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {editImages?.map((img, i) => (
                      <div key={i} className="relative h-16 rounded-lg bg-slate-900 border border-white/5 overflow-hidden group">
                        <img src={img} alt="Property" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveEditImage(i)}
                          className="absolute inset-0 bg-red-600/75 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-xs"
                        >
                          حذف
                        </button>
                      </div>
                    ))}
                    
                    <div className="relative h-16 rounded-lg border border-dashed border-white/10 flex items-center justify-center bg-slate-900/40 hover:border-[#F27D26]/40 cursor-pointer">
                      <input type="file" accept="image/*" onChange={handlePropertyImageAdd} className="absolute inset-0 opacity-0 cursor-pointer" />
                      <Plus className="h-5 w-5 text-slate-500" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-white/5 pt-5 flex justify-end gap-3">
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="rounded-xl bg-gradient-to-r from-[#F27D26] to-[#ff8a3d] px-6 py-2.5 text-xs font-black text-white hover:shadow-lg transition-all flex items-center gap-1"
                >
                  {isSavingEdit ? 'جاري الحفظ...' : 'حفظ التغييرات الكبرى للعقار'}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedEditProp(null)}
                  className="rounded-xl border border-white/5 bg-white/5 px-5 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/10 transition-all"
                >
                  إلغاء التعديل
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Promotion & Payment Modal */}
      {selectedProp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0a0a0a] p-6 shadow-2xl md:p-8 animate-scale-in text-right">
            
            {/* Close Button */}
            <button 
              onClick={() => setSelectedProp(null)}
              className="absolute top-4 left-4 flex h-9 w-9 items-center justify-center rounded-xl border border-white/5 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-all"
            >
              ✕
            </button>

            {submitSuccess ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 mb-4 animate-bounce">
                  <CheckCircle className="h-10 w-10" />
                </div>
                <h3 className="text-lg font-black text-white">تم إرسال إيصال الدفع والطلب بنجاح!</h3>
                <p className="text-xs text-slate-400 mt-2 max-w-md">
                  شكراً لك! تم إرسال معلومات التحويل المالي وصورة الإيصال إلى الإدارة. سيتم تفعيل باقة التمويل "{packagesInfo[selectedPackage].nameAr}" مباشرة بعد التحقق والتدقيق الإداري.
                </p>
              </div>
            ) : (
              <form onSubmit={handlePromotionSubmit} className="space-y-6">
                <div>
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                    <Sparkles className="h-5.5 w-5.5 text-[#F27D26]" />
                    <span>تمويل وترقية الإعلان للقمة</span>
                  </h3>
                  <p className="text-xs text-[#F27D26] mt-1 font-bold">عقارك: {selectedProp.title}</p>
                </div>

                {/* 1. Package Selection Grid */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-3">اختر الباقة التسويقية المناسبة لميزانيتك:</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(Object.keys(packagesInfo) as Array<keyof typeof packagesInfo>)?.map((pkgKey) => {
                      const info = packagesInfo[pkgKey];
                      const isSelected = selectedPackage === pkgKey;
                      return (
                        <div
                          key={pkgKey}
                          onClick={() => setSelectedPackage(pkgKey)}
                          className={`cursor-pointer rounded-2xl border p-3.5 transition-all flex flex-col justify-between ${
                            isSelected 
                              ? 'border-[#F27D26] bg-[#F27D26]/10 shadow-lg shadow-[#F27D26]/5' 
                              : 'border-white/5 bg-white/5 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <h4 className={`text-xs font-black ${isSelected ? 'text-[#F27D26]' : 'text-white'}`}>{info.nameAr}</h4>
                            <span className="text-xs font-mono font-bold text-emerald-400">{info.priceAr}</span>
                          </div>
                          <p className="text-xs text-slate-400 mt-2 leading-relaxed">{info.descAr}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Payment Method Switcher */}
                <div className="border-t border-white/5 pt-4">
                  <label className="block text-xs font-bold text-slate-300 mb-3">اختر وسيلة الدفع العراقية المعتمدة:</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      onClick={() => setPaymentMethod('zain_cash')}
                      className={`cursor-pointer rounded-xl border p-3 text-center transition-all flex items-center justify-center gap-2 ${
                        paymentMethod === 'zain_cash' 
                          ? 'border-[#F27D26] bg-[#F27D26]/10 text-[#ffffff] font-bold' 
                          : 'border-white/5 bg-white/5 hover:bg-white/10 text-slate-400'
                      }`}
                    >
                      <CreditCard className="h-4 w-4 text-amber-500" />
                      <span className="text-xs">محفظة زين كاش العراق</span>
                    </div>

                    <div
                      onClick={() => setPaymentMethod('qi_card')}
                      className={`cursor-pointer rounded-xl border p-3 text-center transition-all flex items-center justify-center gap-2 ${
                        paymentMethod === 'qi_card' 
                          ? 'border-emerald-500 bg-emerald-500/10 text-[#ffffff] font-bold' 
                          : 'border-white/5 bg-white/5 hover:bg-white/10 text-slate-400'
                      }`}
                    >
                      <CreditCard className="h-4 w-4 text-emerald-500" />
                      <span className="text-xs">بطاقة الماستر كارد / الكي كارد</span>
                    </div>
                  </div>

                  {/* Transfer Details Guide */}
                  <div className="mt-3.5 rounded-2xl bg-slate-950 p-4 border border-white/5">
                    <p className="text-xs font-bold text-white mb-2 flex items-center gap-1">
                      <ShieldAlert className="h-4 w-4 text-[#F27D26]" />
                      <span>تعليمات إرسال الأموال:</span>
                    </p>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      الرجاء إرسال مبلغ الباقة المختار <span className="text-emerald-400 font-bold">({packagesInfo[selectedPackage].priceAr})</span> إلى المحفظة الرسمية للمنصة التالية:
                    </p>
                    <div className="mt-3 flex items-center justify-between bg-white/5 rounded-xl px-4 py-2 text-xs">
                      <span className="text-slate-400 font-sans">رقم التحويل المعتمد للمنصة:</span>
                      <span className="text-white font-mono font-black tracking-widest text-[#F27D26] text-sm select-all">
                        {paymentMethod === 'zain_cash' ? settings.zainCash : settings.mastercard}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Transaction Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/5 pt-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">اسم المرسل بالكامل (صاحب المحفظة)</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: علي جاسم محمد..."
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full rounded-xl border border-white/5 bg-slate-950 px-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-[#F27D26]/40"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">رقم هاتف المرسل</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: 07801234567..."
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      className="w-full rounded-xl border border-white/5 bg-slate-950 px-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-[#F27D26]/40 text-left font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">رقم العملية (الاختياري / Transaction ID)</label>
                    <input
                      type="text"
                      placeholder="مثال: 85938205..."
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="w-full rounded-xl border border-white/5 bg-slate-950 px-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-[#F27D26]/40 text-left font-mono"
                    />
                  </div>

                  {/* Proof receipt upload */}
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">صورة إيصال التحويل المالي (مهم جداً)</label>
                    <div className="relative flex items-center justify-center border border-dashed border-white/10 hover:border-[#F27D26]/40 rounded-xl bg-slate-950 cursor-pointer h-10 transition-all overflow-hidden">
                      <input
                        type="file"
                        accept="image/*"
                        required
                        onChange={handleImageChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      {proofImage ? (
                        <span className="text-xs text-emerald-400 font-bold">✓ تم رفع صورة الإيصال بنجاح</span>
                      ) : (
                        <span className="text-xs text-slate-500 flex items-center gap-1.5">
                          <Upload className="h-3.5 w-3.5" />
                          <span>اضغط لرفع لقطة شاشة الإيصال</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submission Button */}
                <div className="border-t border-white/5 pt-5 flex gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 rounded-xl bg-gradient-to-r from-[#F27D26] to-[#ff8a3d] py-3 text-xs font-black text-white shadow-lg shadow-[#F27D26]/10 hover:shadow-[#F27D26]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-white border-white/10"></div>
                        <span>جاري إرسال الإثبات...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>إرسال إثبات الدفع للتدقيق والموافقة</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedProp(null)}
                    className="rounded-xl border border-white/5 bg-white/5 px-5 py-3 text-xs font-bold text-slate-300 hover:bg-white/10 transition-all"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
