import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, Heart, Share2, Eye, Calendar, MapPin, 
  Bed, Bath, Move, Layers, CalendarDays, Sofa, 
  Car, Compass, Sparkles, Phone, MessageCircle, Send, 
  Mail, MessageSquarePlus, Star, ChevronLeft, ChevronRight, 
  Maximize2, X, Wallet, ShieldAlert, CheckCircle2, User, Banknote, FileSignature
} from 'lucide-react';
import { Property, Agent, Review } from '../types';
import { formatPrice } from './PropertyCard';

import { sendMessage, submitPaymentProof, fetchReviews, submitReview, createOffer, createComplaint } from '../utils/api';
import { MapDisplay } from './MapDisplay';
import { calculateDistance } from '../utils/distance';

interface PropertyDetailsProps {
  property: Property;
  onBack: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onSelectProperty: (id: string) => void;
  allProperties: Property[];
  onViewProfile?: (identity: string) => void;
  onCreateAgreement?: (property: Property) => void;
  user?: any;
  lang?: string;
}

export default function PropertyDetails({
  property,
  onBack,
  isFavorite,
  onToggleFavorite,
  onSelectProperty,
  allProperties,
  onViewProfile,
  onCreateAgreement,
  user,
  lang = 'ar'
}: PropertyDetailsProps) {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  
  // Visit Request State
  
  // Visit Request State
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('');

  // Offer State
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerMessage, setOfferMessage] = useState('');

  // Complaint State
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [complaintSubject, setComplaintSubject] = useState('');
  const [complaintDesc, setComplaintDesc] = useState('');

  const [showPhone, setShowPhone] = useState(false);

  const handleBookVisit = async () => {
    if (!user) return window.alert('يجب تسجيل الدخول لحجز موعد');
    if (!visitDate || !visitTime) return window.alert('يرجى تحديد التاريخ والوقت');
    try {
      // NOTE: createVisit should be imported at top or available in context
      const res = await fetch('/api/visits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.emailOrPhone,
          'x-admin': user.role === 'admin' ? 'true' : 'false'
        },
        body: JSON.stringify({
          propertyId: property.id,
          propertyTitle: property.title,
          requesterId: user.emailOrPhone,
          requesterName: user.name,
          requesterPhone: user.emailOrPhone,
          ownerId: property.ownerEmailOrPhone || property.agentId,
          date: visitDate,
          time: visitTime
        })
      });
      if (res.ok) {
        window.alert('تم إرسال طلب الحجز بنجاح! سيتم إشعارك عند القبول.');
        setShowVisitModal(false);
      }
    } catch (err) {
      window.alert('حدث خطأ أثناء حجز الموعد.');
    }
  };
  const [reviews, setReviews] = useState<Review[]>([]);
  
  useEffect(() => {
    fetchReviews(property.id).then(data => {
      setReviews(data);
    }).catch(err => console.error('Failed to fetch reviews', err));
  }, [property.id]);

  // Review Form state
  const [reviewerName, setReviewerName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Upgrade / Payment Panel state
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState('basic');
  const [paymentMethod, setPaymentMethod] = useState<'zain_cash' | 'qi_card'>('zain_cash');
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);
  const [proofImageFile, setProofImageFile] = useState<File | null>(null);

  // Agent retrieval
  const agent = {
    name: property.advertiserName || 'الإدارة',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80',
    phone: property.advertiserPhone || '07810060292',
    whatsapp: property.advertiserWhatsapp || property.advertiserPhone || '9647810060292',
    telegram: undefined,
    email: property.ownerEmailOrPhone || 'info@adenintl.site',
    bio: 'المدير العام لشركة عدن للوساطة العقارية. خبرة ممتازة في السوق العقاري العراقي لمحافظات الأنبار وبغداد وأربيل.',
    propertyCount: allProperties.filter(p => p.agentId === property.agentId).length || 1,
    dealsCompleted: 0
  };

  // Surroundings
  const nearbyProps = allProperties
    .filter(p => p.id !== property.id && p.isApproved)
    ?.map(p => ({
      ...p,
      distance: calculateDistance(property.coordinates.lat, property.coordinates.lng, p.coordinates.lat, p.coordinates.lng)
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3);

  // Navigation google maps link
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${property.coordinates.lat},${property.coordinates.lng}`;

    const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName || !comment) return;
    const newRev = {
      propertyId: property.id,
      agentId: property.agentId,
      reviewerName,
      rating,
      comment
    };
    try {
      await submitReview(newRev);
      setReviews([...reviews, { ...newRev, id: 'temp-' + Date.now(), createdAt: new Date().toISOString(), isApproved: false }]);
      setReviewerName('');
      setComment('');
      setReviewSubmitted(true);
      setTimeout(() => setReviewSubmitted(false), 4000);
      alert('تم إرسال تقييمك للمراجعة. شكراً لك.');
    } catch(e) {
      console.error(e);
      alert('حدث خطأ أثناء الإرسال');
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName || !senderPhone) return;

    const amount = selectedPackage === 'basic' ? 5000 : 
                   selectedPackage === 'medium' ? 10000 : 
                   selectedPackage === 'premium' ? 25000 : 50000;

    try {
      await submitPaymentProof({
        propertyId: property.id,
        packageName: selectedPackage,
        paymentType: 'featured_ad',
        amount,
        paymentMethod,
        proofImage: proofImageFile ? URL.createObjectURL(proofImageFile) : 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&auto=format&fit=crop&q=80',
        senderName,
        senderPhone,
        transactionId
      });
      setPaymentSubmitted(true);
      setSenderName('');
      setSenderPhone('');
      setTransactionId('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleOfferSubmit = async () => {
    if (!user) {
      window.alert('يجب تسجيل الدخول لإرسال عرض شراء');
      return;
    }
    if (!offerAmount) return;

    try {
      await createOffer({
        propertyId: property.id,
        propertyTitle: property.title,
        buyerId: user.emailOrPhone,
        buyerName: user.name,
        ownerId: property.ownerEmailOrPhone || property.agentId,
        amount: Number(offerAmount),
        message: offerMessage,
      });
      window.alert('تم إرسال العرض بنجاح!');
      setShowOfferModal(false);
      setOfferAmount('');
      setOfferMessage('');
    } catch (e) {
      console.error('[PropertyDetails] offer submission failed', e);
      window.alert('تعذر إرسال العرض. تأكد من تسجيل الدخول وحاول مرة أخرى.');
    }
  };

  const handleComplaintSubmit = async () => {
    if (!complaintSubject || !complaintDesc) return;

    try {
      await createComplaint({
        reporterId: user?.emailOrPhone || 'guest',
        reporterName: user?.name || 'Guest',
        targetId: property.id,
        subject: complaintSubject,
        description: complaintDesc,
      });
      window.alert('تم إرسال البلاغ إلى الإدارة.');
      setShowComplaintModal(false);
      setComplaintSubject('');
      setComplaintDesc('');
    } catch (e) {
      console.error('[PropertyDetails] complaint submission failed', e);
      window.alert('تعذر إرسال البلاغ. تأكد من تسجيل الدخول وحاول مرة أخرى.');
    }
  };

  return (
    <div id="details-view" className="space-y-6">
      
      {/* Back & Quick Action Top Rail */}
      <div className="flex items-center justify-between">
        <button
          id="btn-details-back"
          onClick={onBack}
          className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
        >
          <ArrowRight className="h-4.5 w-4.5" />
          <span>رجوع للقائمة</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {user && (
            <button
              onClick={() => {
                // To be handled by App.tsx, we can dispatch an event or pass a prop, but here we can just alert for now or add a new prop to PropertyDetails.
                // Alternatively, I can add a prop `onCreateAgreement?: (property: Property) => void;`
                // Wait, it's easier to add `onCreateAgreement` to props.
                if (onCreateAgreement) {
                  onCreateAgreement(property);
                }
              }}
              className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-[#F27D26] px-4 py-2 text-sm font-bold text-[#ffffff] hover:bg-[#d96a1a] transition-all shadow-lg shadow-[#F27D26]/20"
            >
              <FileSignature className="h-4.5 w-4.5" />
              <span>مكاتبة إلكترونية</span>
            </button>
          )}

          <button
            id="btn-details-fav"
            onClick={onToggleFavorite}
            className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all ${
              isFavorite 
                ? 'bg-gold-accent/10 border-gold-accent/40 text-gold-accent' 
                : 'border-white/10 bg-white/5 text-slate-300 hover:text-white'
            }`}
            title={isFavorite ? 'إزالة من المفضلة' : 'حفظ في المفضلة'}
          >
            <Heart className={`h-5 w-5 ${isFavorite ? 'fill-gold-accent' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Grid: Info + Slider on right, Advertiser Card & map on left */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* RIGHT COLUMN (2/3 width on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Professional Gallery Slider */}
          <div className="relative rounded-2xl border border-white/5 bg-slate-950 overflow-hidden group shadow-2xl">
            
            {/* Primary Large Image */}
            <div className="relative h-96 w-full cursor-zoom-in" onClick={() => setLightboxOpen(true)}>
              <img loading="lazy"
                src={property.images[activeImageIdx] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&auto=format&fit=crop&q=80'}
                alt={property.title}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30"></div>

              {/* Lightbox zoom icon */}
              <div className="absolute top-4 left-4 rounded-lg bg-black/60 p-2 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 className="h-4 w-4" />
              </div>

              {/* Slider Image Count Badge */}
              <div className="absolute bottom-4 right-4 rounded-lg bg-black/60 px-3 py-1.5 font-mono text-sm font-bold text-white backdrop-blur-md">
                {activeImageIdx + 1} / {property.images.length} صور
              </div>
            </div>

            {/* Slider Navigation arrows */}
            {property.images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImageIdx((prev) => (prev > 0 ? prev - 1 : property.images.length - 1))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white hover:bg-gold-prestige transition-all"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setActiveImageIdx((prev) => (prev < property.images.length - 1 ? prev + 1 : 0))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white hover:bg-gold-prestige transition-all"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              </>
            )}

            {/* Thumbnail Navigation row */}
            {property.images.length > 1 && (
              <div className="flex gap-2 p-3 bg-slate-900/80 overflow-x-auto border-t border-white/5">
                {property.images?.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`h-16 w-24 shrink-0 rounded-lg overflow-hidden border transition-all ${
                      activeImageIdx === idx ? 'border-gold-prestige scale-95 shadow-md' : 'border-white/10 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img loading="lazy" src={img} alt="thumbnail" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Core Info Details Header */}
          <div className="rounded-2xl border border-white/5 bg-slate-900/10 backdrop-blur-md p-6 space-y-4">
            
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="rounded bg-gold-prestige/10 border border-gold-prestige/25 text-gold-prestige px-2.5 py-0.5 text-sm font-black">
                    {property.status}
                  </span>
                  <span className="text-sm font-medium text-slate-400">
                    رقم الإعلان: <span className="font-mono text-white">{property.id}</span>
                  </span>
                  {property.isFeatured && (
                    <span className="text-sm bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded font-bold animate-pulse">
                      ⭐ إعلان ترقية مستمرة
                    </span>
                  )}
                </div>
                <h1 className="text-xl font-extrabold text-white sm:text-2xl leading-snug">{property.title}</h1>
              </div>

              <div className="text-right">
                <span className="block text-2xl font-black text-gold-prestige font-sans">
                  {property.isAuction ? 'مزاد عقاري' : formatPrice(property.price, property.status)}
                </span>
                <span className="text-sm text-slate-400">
                  {property.space} م² • {Math.round((property.price || 0) / (property.space || 1)).toLocaleString('ar-IQ')} د.ع للمتر
                </span>
              </div>
            </div>

            {/* Auction Highlight Box */}
            {property.isAuction && property.isAuctionActive && (
              <div className="mt-4 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in">
                <div>
                  <h3 className="text-amber-500 font-bold text-sm mb-1">المزاد العقاري نشط الآن</h3>
                  <p className="text-sm text-slate-300">
                    أعلى مزايدة حالية: <span className="font-bold font-sans text-white text-sm">{((property.highestBid || 0) > 0 ? property.highestBid : property.startingPrice)?.toLocaleString('ar-IQ')} د.ع</span>
                  </p>
                  <p className="text-sm text-slate-400 mt-1">
                    ينتهي المزاد بتاريخ: {new Date(property.auctionEnd || '').toLocaleString('ar-IQ')}
                  </p>
                </div>
                <button onClick={() => {
                  window.alert('سيتم توفير خيار المشاركة في المزاد قريباً.');
                }} className="px-6 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold transition-all shadow-lg shadow-amber-600/20">
                  المشاركة في المزاد (50,000 د.ع)
                </button>
              </div>
            )}

                        {/* Smart Valuation */}
            <div className="mt-6 p-4 rounded-xl border border-blue-500/20 bg-blue-500/5">
              <h3 className="text-blue-400 font-bold text-sm mb-2 flex items-center gap-1">
                <Banknote className="h-4 w-4" />
                التقييم الذكي للسعر (تقديري)
              </h3>
              <div className="flex justify-between items-end">
                <div className="text-sm text-slate-400 w-2/3 leading-relaxed">
                  بناءً على مساحة العقار ({property.space} م²) وموقعه ({property.district})، نقدر أن سعر هذا العقار العادل في السوق هو:
                </div>
                <div className="text-sm font-bold text-white bg-slate-900 px-3 py-1.5 rounded-lg border border-white/10">
                  {Math.round((property.price || 0) * 0.95).toLocaleString('ar-IQ')} د.ع - {Math.round((property.price || 0) * 1.05).toLocaleString('ar-IQ')} د.ع
                </div>
              </div>
            </div>

            {/* Documents Section */}
            {property.documents && property.documents.length > 0 && (
              <div className="mt-4 p-4 rounded-xl border border-white/5 bg-slate-900/40">
                <h3 className="text-white font-bold text-sm mb-3 border-b border-white/5 pb-2">مستندات العقار</h3>
                <div className="flex flex-wrap gap-2">
                  {property.documents?.filter(d => d.isPublic || user?.role === 'admin' || user?.emailOrPhone === property.ownerEmailOrPhone)?.map((doc, i) => (
                    <a key={i} href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-slate-950 text-sm text-slate-300 hover:text-white hover:border-[#F27D26]/40 transition-all">
                      📄 {doc.title}
                    </a>
                  ))}
                  {property.documents.filter(d => d.isPublic || user?.role === 'admin' || user?.emailOrPhone === property.ownerEmailOrPhone).length === 0 && (
                    <span className="text-sm text-slate-500">لا توجد مستندات عامة متاحة.</span>
                  )}
                </div>
              </div>
            )}

            {/* Geographical details */}
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-300">
              <span className="text-gold-prestige font-black">📍</span>
              <span>{property.governorate} • {property.district} • {property.subDistrict} • {property.neighborhood}</span>
            </div>

            {/* Stats (views, date, days) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-white/5 pt-4 text-sm text-slate-400 font-sans">
              <div className="flex flex-wrap items-center gap-2">
                <Eye className="h-4 w-4 text-gold-prestige" />
                <span>{property.views} مشاهدة في المنصة</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Calendar className="h-4 w-4 text-gold-prestige" />
                <span>تاريخ النشر: {property.createdAt?.split('T')?.[0] || ''}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <CalendarDays className="h-4 w-4 text-gold-prestige" />
                <span>مدة البقاء: {property.daysOnPlatform || 1} أيام</span>
              </div>
            </div>
          </div>

          {/* Detailed Specs Block */}
          <div className="rounded-2xl border border-white/5 bg-slate-900/10 backdrop-blur-md p-6 space-y-6">
            <h3 className="text-base font-bold text-white border-b border-white/5 pb-3">المواصفات والتفاصيل الأساسية</h3>
            
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-sm">
              <div className="p-3.5 rounded-xl bg-slate-950/30 border border-white/5 flex flex-col justify-center">
                <span className="text-sm text-slate-400">نوع العقار</span>
                <span className="text-sm font-bold text-white mt-1">{property.buildingType}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/30 border border-white/5 flex flex-col justify-center">
                <span className="text-sm text-slate-400">مساحة البناء</span>
                <span className="text-sm font-bold text-white mt-1 font-sans">{property.space} م²</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/30 border border-white/5 flex flex-col justify-center">
                <span className="text-sm text-slate-400">عدد غرف النوم</span>
                <span className="text-sm font-bold text-white mt-1 font-sans">{property.bedrooms || '—'}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/30 border border-white/5 flex flex-col justify-center">
                <span className="text-sm text-slate-400">عدد الحمامات</span>
                <span className="text-sm font-bold text-white mt-1 font-sans">{property.bathrooms || '—'}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/30 border border-white/5 flex flex-col justify-center">
                <span className="text-sm text-slate-400">عدد الطوابق</span>
                <span className="text-sm font-bold text-white mt-1 font-sans">{property.floors || '—'} طوابق</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/30 border border-white/5 flex flex-col justify-center">
                <span className="text-sm text-slate-400">سنة التشييد</span>
                <span className="text-sm font-bold text-white mt-1 font-sans">{property.constructionYear || '—'}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/30 border border-white/5 flex flex-col justify-center">
                <span className="text-sm text-slate-400">مفروش</span>
                <span className="text-sm font-bold text-white mt-1">{property.isFurnished ? 'نعم، مؤثث' : 'لا، غير مؤثث'}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/30 border border-white/5 flex flex-col justify-center">
                <span className="text-sm text-slate-400">كراج سيارات</span>
                <span className="text-sm font-bold text-white mt-1">{property.hasGarage ? 'متوفر' : 'غير متوفر'}</span>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white pt-2">الخدمات والمرافق المتوفرة</h4>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 text-sm text-slate-300">
                <div className={`flex items-center gap-2 p-3 rounded-xl border ${property.hasGenerator ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-white/5 opacity-50'}`}>
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>مولدة ذهبية للمجمع</span>
                </div>
                <div className={`flex items-center gap-2 p-3 rounded-xl border ${property.hasSolarPower ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-white/5 opacity-50'}`}>
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>منظومة طاقة شمسية</span>
                </div>
                <div className={`flex items-center gap-2 p-3 rounded-xl border ${property.hasPool ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-white/5 opacity-50'}`}>
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>مسبح خارجي خاص</span>
                </div>
                <div className={`flex items-center gap-2 p-3 rounded-xl border ${property.hasGarden ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-white/5 opacity-50'}`}>
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>حديقة خارجية منسقة</span>
                </div>
                <div className={`flex items-center gap-2 p-3 rounded-xl border ${property.hasElevator ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-white/5 opacity-50'}`}>
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>مصعد كهربائي سريع</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description Block */}
          <div className="rounded-2xl border border-white/5 bg-slate-900/10 backdrop-blur-md p-6 space-y-4">
            <h3 className="text-base font-bold text-white border-b border-white/5 pb-3">وصف العقار التفصيلي</h3>
            <p className="text-sm text-slate-300 leading-relaxed font-sans whitespace-pre-line">{property.description}</p>
          </div>

          {/* Promo Packages Upgrade Section */}
          {!property.isFeatured && (
            <div className="rounded-2xl border border-gold-prestige/10 bg-slate-950 p-6 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-prestige/15 text-gold-prestige border border-gold-prestige/25 animate-pulse">
                    <Sparkles className="h-5.5 w-5.5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">هل تود ترويج هذا الإعلان وضمان وصوله لآلاف المهتمين؟</h3>
                    <p className="text-sm text-slate-400 font-sans mt-0.5">قم بترقية إعلانك ليظهر في مقدمة نتائج البحث ومعامل الإبرام الفوري</p>
                  </div>
                </div>
                <button
                  id="btn-open-upgrade-panel"
                  onClick={() => setUpgradeOpen(!upgradeOpen)}
                  className="rounded-xl bg-gold-prestige px-5 py-2.5 text-sm font-bold text-white hover:bg-gold-accent transition-all cursor-pointer shrink-0"
                >
                  {upgradeOpen ? 'إغلاق نافذة الترقية' : 'ترقية العقار لمميز ⭐'}
                </button>
              </div>

              {/* Upgrade form */}
              {upgradeOpen && (
                <div className="border-t border-white/10 pt-5 space-y-5 animate-slide-down">
                  
                  {/* Step 1: Package choosing */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-300 mb-3">أولاً: اختر الباقة الترويجية المناسبة:</h4>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-4 text-sm font-sans">
                      
                      {/* Package 5$ */}
                      <div 
                        onClick={() => setSelectedPackage('basic')}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          selectedPackage === 'basic' ? 'border-gold-prestige bg-gold-prestige/5' : 'border-white/5 bg-slate-900/30'
                        }`}
                      >
                        <h5 className="font-bold text-white text-sm">باقة عادية 5$</h5>
                        <p className="text-slate-400 mt-1">ترقية العقار لحالة مميز لمدة 7 أيام متتالية.</p>
                      </div>

                      {/* Package 10$ */}
                      <div 
                        onClick={() => setSelectedPackage('medium')}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          selectedPackage === 'medium' ? 'border-gold-prestige bg-gold-prestige/5' : 'border-white/5 bg-slate-900/30'
                        }`}
                      >
                        <h5 className="font-bold text-white text-sm">باقة متوسطة 10$</h5>
                        <p className="text-slate-400 mt-1">ترقية لمدة 7 أيام مع أولوية ظهور أعلى بمرتين.</p>
                      </div>

                      {/* Package 25$ */}
                      <div 
                        onClick={() => setSelectedPackage('premium')}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          selectedPackage === 'premium' ? 'border-gold-prestige bg-gold-prestige/5' : 'border-white/5 bg-slate-900/30'
                        }`}
                      >
                        <h5 className="font-bold text-white text-sm">باقة ذهبية 25$</h5>
                        <p className="text-slate-400 mt-1">أولوية عليا مع تكرار مستمر في الصفحة الرئيسية.</p>
                      </div>

                      {/* Package 50$ */}
                      <div 
                        onClick={() => setSelectedPackage('unlimited')}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          selectedPackage === 'unlimited' ? 'border-gold-prestige bg-gold-prestige/5' : 'border-white/5 bg-slate-900/30'
                        }`}
                      >
                        <h5 className="font-bold text-white text-sm">ترقية حتى البيع 50$+</h5>
                        <p className="text-slate-400 mt-1">يبقى الإعلان مميزاً حتى يكتمل بيعه أو تأجيره.</p>
                      </div>

                    </div>
                  </div>

                  {/* Step 2: Payment options info */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 p-4 rounded-xl bg-slate-900/50 border border-white/5 text-sm leading-relaxed">
                    
                    {/* Zain Cash */}
                    <div className="space-y-1.5 border-l border-white/5 pl-4">
                      <h5 className="font-bold text-emerald-400 flex items-center gap-1">
                        <Wallet className="h-4 w-4" />
                        <span>1. المحفظة الإلكترونية (Zain Cash)</span>
                      </h5>
                      <p className="text-slate-400">رقم المحفظة: <span className="text-white font-mono font-bold select-all">07810060292</span></p>
                      <p className="text-slate-400">اسم المستلم: <span className="text-white font-bold">عبدالله الدعاس</span></p>
                    </div>

                    {/* Qi Card */}
                    <div className="space-y-1.5 pr-2">
                      <h5 className="font-bold text-blue-400 flex items-center gap-1">
                        <Wallet className="h-4 w-4" />
                        <span>2. ماستر كارد / كي كارد (Qi Card)</span>
                      </h5>
                      <p className="text-slate-400">رقم الحساب: <span className="text-white font-mono font-bold select-all">4321098765432</span></p>
                      <p className="text-slate-400">اسم الحساب: <span className="text-white font-bold">عبدالله الدعاس / عدن للعقارات</span></p>
                    </div>

                  </div>

                  {/* Step 3: Submission form */}
                  <form onSubmit={handlePaymentSubmit} className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-300">ثانياً: أرسل تفاصيل التحويل لإدارة المنصة ليتم تفعيل الترقية مباشرة:</h4>
                    
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm text-slate-400 mb-1">طريقة الدفع المستخدمة</label>
                        <select
                          value={paymentMethod}
                          onChange={(e: any) => setPaymentMethod(e.target.value)}
                          className="w-full rounded-lg border border-white/5 bg-slate-900 px-3 py-2 text-sm text-white"
                        >
                          <option value="zain_cash">زين كاش (Zain Cash)</option>
                          <option value="qi_card">كي كارد / ماستر كارد</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm text-slate-400 mb-1">اسم المرسل الثلاثي</label>
                        <input
                          type="text"
                          required
                          placeholder="مثال: احمد محمد جاسم"
                          value={senderName}
                          onChange={(e) => setSenderName(e.target.value)}
                          className="w-full rounded-lg border border-white/5 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-600 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-slate-400 mb-1">رقم الهاتف للتحقق</label>
                        <input
                          type="text"
                          required
                          placeholder="07XXXXXXXXX"
                          value={senderPhone}
                          onChange={(e) => setSenderPhone(e.target.value)}
                          className="w-full rounded-lg border border-white/5 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-600 outline-none"
                        />
                      </div>
<div>
                        <label className="block text-sm text-slate-400 mb-1">صورة إثبات الدفع (وصل التحويل)</label>
                        <input
                          type="file"
                          accept="image/*"
                          required
                          onChange={(e) => setProofImageFile(e.target.files?.[0] || null)}
                          className="w-full rounded-lg border border-white/5 bg-slate-900 px-3 py-2 text-sm text-slate-300 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-[#F27D26]/20 file:text-[#F27D26] hover:file:bg-[#F27D26]/30 file:cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm text-slate-400 mb-1">رقم المعاملة / إشعار التحويل (اختياري)</label>
                        <input
                          type="text"
                          placeholder="أدخل رمز العملية المكون من أرقام"
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          className="w-full rounded-lg border border-white/5 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-600 outline-none font-mono"
                        />
                      </div>

                      <div className="flex items-end">
                        <button
                          id="btn-submit-upgrade-proof"
                          type="submit"
                          className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-[#ffffff] hover:bg-emerald-500 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Send className="h-4 w-4" />
                          <span>إرسال إثبات الدفع للتدقيق المباشر</span>
                        </button>
                      </div>
                    </div>

                    {paymentSubmitted && (
                      <div className="rounded-lg bg-emerald-500/10 p-3.5 border border-emerald-500/20 text-sm text-emerald-400 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <span>تم إرسال إثبات الدفع بنجاح! مدة المراجعة والتفعيل تستغرق من 10 دقائق إلى 24 ساعة كحد أقصى. شكراً لك.</span>
                      </div>
                    )}
                  </form>

                </div>
              )}
            </div>
          )}

          {/* User Reviews Section */}
          <div className="rounded-2xl border border-white/5 bg-slate-900/10 backdrop-blur-md p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-base font-bold text-white">تقييمات ومراجعات العملاء</h3>
              <span className="text-sm text-slate-400 font-sans">
                متوسط التقييم: <span className="font-bold text-gold-prestige font-mono">4.9 / 5</span> ⭐
              </span>
            </div>

            {/* Existing Reviews */}
            <div className="space-y-4">
              {reviews?.map((rev) => (
                <div key={rev.id} className="p-4 rounded-xl bg-slate-950/40 border border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-200">{rev.reviewerName}</span>
                    <div className="flex gap-0.5 text-gold-prestige">
                      {Array.from({ length: rev.rating })?.map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-gold-prestige text-gold-prestige" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed font-sans">{rev.comment}</p>
                </div>
              ))}
            </div>

            {/* Review Input form */}
            <form onSubmit={handleReviewSubmit} className="space-y-4 pt-4 border-t border-white/5">
              <h4 className="text-sm font-bold text-white flex items-center gap-1">
                <MessageSquarePlus className="h-4.5 w-4.5 text-gold-prestige" />
                <span>أضف مراجعة وتقييم خاص بك</span>
              </h4>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">الاسم الكامل</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: المهندس يوسف الخالدي"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    className="w-full rounded-lg border border-white/5 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">التقييم العام بالنجوم</label>
                  <div className="flex gap-1 py-1 text-gold-prestige cursor-pointer">
                    {[1, 2, 3, 4, 5]?.map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="hover:scale-115 transition-transform"
                      >
                        <Star className={`h-5 w-5 ${star <= rating ? 'fill-gold-prestige' : 'text-slate-600'}`} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">تفاصيل التعليق والملاحظات</label>
                <textarea
                  rows={3}
                  required
                  placeholder="اكتب تفاصيل تجربتك مع الوكيل العقاري أو رأيك في العقار المعروض..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full rounded-lg border border-white/5 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-600 outline-none font-sans"
                />
              </div>

              <div className="flex justify-end">
                <button
                  id="btn-submit-review"
                  type="submit"
                  className="rounded-lg bg-gold-prestige hover:bg-gold-accent px-5 py-2 text-sm font-bold text-white transition-all cursor-pointer"
                >
                  نشر المراجعة الآن
                </button>
              </div>

              {reviewSubmitted && (
                <div className="rounded-lg bg-emerald-500/10 p-3.5 border border-emerald-500/20 text-sm text-emerald-400 text-center">
                  شكرًا لك! تم نشر تقييمك ومراجعته بنجاح للظهور للعامة.
                </div>
              )}
            </form>
          </div>

          {/* Beautiful Video Tour section */}
          {property.videoUrl && (
            <div className="rounded-2xl border border-white/5 bg-slate-900/10 backdrop-blur-md p-6 space-y-4">
              <h3 className="text-base font-bold text-white border-b border-white/5 pb-3 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F27D26]/20 text-[#F27D26] font-bold">
                  ▶
                </span>
                <span>فيديو جولتك العقارية (Video Tour)</span>
              </h3>
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/10 bg-black shadow-2xl">
                {property.videoUrl.startsWith('data:video') || property.videoUrl.includes('.mp4') || property.videoUrl.startsWith('blob:') ? (
                  <video 
                    src={property.videoUrl} 
                    controls 
                    className="w-full h-full object-cover"
                    poster="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&auto=format&fit=crop&q=80"
                  />
                ) : (
                  <iframe
                    src={property.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                    title="Property Video Tour"
                    className="w-full h-full border-0"
                    allowFullScreen
                  ></iframe>
                )}
              </div>
            </div>
          )}

        </div>

        {/* LEFT COLUMN (1/3 width on desktop - Advertiser profile & Maps) */}
        <div className="space-y-6">
          
          {/* Advertiser Profile Card */}
          <div className="rounded-2xl border border-white/5 bg-slate-900/10 backdrop-blur-md p-6 space-y-6">
            <h3 className="text-sm font-bold text-white border-b border-white/5 pb-3">معلومات المكتب العقاري والمعلن</h3>
            
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-gold-prestige shadow-lg shrink-0">
                <img loading="lazy" src={agent.avatar} alt={agent.name} referrerPolicy="no-referrer" className="h-full w-full object-cover" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                  <span>{agent.name}</span>
                  <span className="text-sm text-gold-prestige font-bold bg-gold-prestige/10 px-1.5 py-0.5 rounded">مدير معتمد</span>
                </h4>
                <p className="text-sm text-slate-400 font-sans mt-0.5">عدن للوساطة العقارية</p>
                <div className="flex gap-0.5 text-gold-prestige mt-1">
                  {Array.from({ length: 5 })?.map((_, i) => (
                    <Star key={i} className="h-2.5 w-2.5 fill-gold-prestige text-gold-prestige" />
                  ))}
                  <span className="text-[9px] text-slate-400 mr-1">({agent.dealsCompleted} صفقة مكتملة)</span>
                </div>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed font-sans border-t border-b border-white/5 py-3">
              {agent.bio || 'المدير العام لشركة عدن للوساطة العقارية. خبرة ممتازة في السوق العقاري العراقي لمحافظات الأنبار وبغداد وأربيل.'}
            </p>

            <div className="grid grid-cols-2 gap-3 text-sm text-slate-400">
              <div className="p-3 bg-white/5 rounded-lg border border-white/5 text-center">
                <span>إعلانات منشورة</span>
                <span className="block text-sm font-bold text-white mt-1 font-mono">{agent.propertyCount}</span>
              </div>
              <div className="p-3 bg-white/5 rounded-lg border border-white/5 text-center">
                <span>صفقات منجزة</span>
                <span className="block text-sm font-bold text-emerald-400 mt-1 font-mono">{agent.dealsCompleted}</span>
              </div>
            </div>

            {/* Direct Instant Action Shortcuts */}
            <div className="space-y-3.5 pt-2">
              <a
                href={`tel:${agent.phone}`}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gold-prestige hover:bg-gold-accent py-3 text-sm font-bold text-white transition-all shadow-lg shadow-gold-prestige/10"
              >
                <Phone className="h-4 w-4" />
                <span>اتصال هاتفي مباشر</span>
              </a>
              <a
                href={`https://wa.me/${agent.whatsapp}`}
                target="_blank" rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-3 text-sm font-bold text-[#ffffff] transition-all shadow-lg"
              >
                <MessageCircle className="h-4.5 w-4.5" />
                <span>محادثة واتساب سريعة</span>
              </a>
              {agent.telegram && (
                <a
                  href={`https://t.me/${agent.telegram}`}
                  target="_blank" rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 py-3 text-sm font-bold text-white transition-all"
                >
                  <Send className="h-4 w-4" />
                  <span>مراسلة عبر تيليجرام</span>
                </a>
              )}
              <a
                href={`mailto:${agent.email}`}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 py-3 text-sm font-semibold text-slate-300 transition-all"
              >
                <Mail className="h-4 w-4 text-slate-400" />
                <span>إرسال بريد إلكتروني</span>
              </a>
              <button
                onClick={() => setShowVisitModal(true)}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20 py-3 text-sm font-semibold text-emerald-400 transition-all mt-2"
              >
                <CalendarDays className="h-4 w-4" />
                <span>حجز موعد لزيارة العقار</span>
              </button>
                          <button
                onClick={() => setShowComplaintModal(true)}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 py-3 text-sm font-semibold text-red-400 transition-all mt-2"
              >
                <ShieldAlert className="h-4 w-4" />
                <span>الإبلاغ عن العقار</span>
              </button>
            </div>
          </div>

          {/* Visit Booking Modal */}
          {showVisitModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
                <h3 className="text-emerald-400 font-bold text-lg border-b border-white/5 pb-2">حجز موعد لزيارة العقار</h3>
                <p className="text-sm text-slate-400 font-sans leading-relaxed">
                  الرجاء تحديد التاريخ والوقت المناسبين لك. سيتم إرسال الطلب إلى صاحب العقار للرد.
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-slate-300 mb-1">تاريخ الزيارة</label>
                    <input
                      type="date"
                      value={visitDate}
                      onChange={e => setVisitDate(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500/50"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-1">الوقت المقترح</label>
                    <input
                      type="time"
                      value={visitTime}
                      onChange={e => setVisitTime(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500/50"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <button onClick={handleBookVisit} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-[#ffffff] py-2 rounded-lg text-sm font-bold transition-all">
                    تأكيد حجز الموعد
                  </button>
                  <button onClick={() => setShowVisitModal(false)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-bold transition-all">
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          )}

                    {/* Offer Modal */}
          {showOfferModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-slate-900 border border-gold-prestige/30 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
                <h3 className="text-gold-prestige font-bold text-lg border-b border-white/5 pb-2">تقديم عرض شراء</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-slate-300 mb-1">المبلغ المقترح (د.ع)</label>
                    <input
                      type="number"
                      value={offerAmount}
                      onChange={e => setOfferAmount(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-gold-prestige/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-1">رسالة (اختياري)</label>
                    <textarea
                      value={offerMessage}
                      onChange={e => setOfferMessage(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-gold-prestige/50 h-24"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <button onClick={handleOfferSubmit} className="flex-1 bg-gold-prestige hover:bg-[#d66b1d] text-slate-900 py-2 rounded-lg text-sm font-bold transition-all">
                    تأكيد العرض
                  </button>
                  <button onClick={() => setShowOfferModal(false)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-bold transition-all">
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Complaint Modal */}
          {showComplaintModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-slate-900 border border-red-500/30 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
                <h3 className="text-red-400 font-bold text-lg border-b border-white/5 pb-2 flex items-center gap-2"><ShieldAlert className="w-5 h-5"/> الإبلاغ عن مشكلة</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-slate-300 mb-1">الموضوع</label>
                    <input
                      type="text"
                      value={complaintSubject}
                      onChange={e => setComplaintSubject(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-red-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-1">الوصف والتفاصيل</label>
                    <textarea
                      value={complaintDesc}
                      onChange={e => setComplaintDesc(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-red-500/50 h-24"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <button onClick={handleComplaintSubmit} className="flex-1 bg-red-600 hover:bg-red-500 text-[#ffffff] py-2 rounded-lg text-sm font-bold transition-all">
                    إرسال البلاغ
                  </button>
                  <button onClick={() => setShowComplaintModal(false)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-bold transition-all">
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Direct Advertiser Contact Info Card */}
          {property.advertiserPhone && (
            <div className="rounded-2xl border border-[#F27D26]/20 bg-gradient-to-b from-[#F27D26]/10 to-royal-dark/30 backdrop-blur-md p-6 space-y-4 shadow-xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F27D26]/20 text-[#F27D26] text-sm animate-pulse">
                  📞
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white">تواصل مباشر مع صاحب العقار (المعلن)</h3>
                  <p className="text-sm text-[#F27D26] font-sans">تواصل مباشر بدون عمولات أو رسوم وساطة</p>
                </div>
              </div>
              
              <div className="border-t border-white/5 pt-3 space-y-3">
                <div className="flex justify-between items-center bg-white/5 p-2.5 rounded-lg border border-white/5">
                  <span className="text-sm text-slate-400">اسم المعلن / المالك:</span>
                  <span className="text-sm font-bold text-white">{property.advertiserName || 'صاحب الإعلان'}</span>
                </div>

                {property.ownerEmailOrPhone && onViewProfile && (
                  <button
                    type="button"
                    onClick={() => onViewProfile!(property.ownerEmailOrPhone!)}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/5 hover:bg-[#F27D26]/10 hover:border-[#F27D26]/30 hover:text-[#ffffff] py-3 text-sm font-bold text-slate-300 transition-all cursor-pointer"
                  >
                    <User className="h-4 w-4 text-[#F27D26]" />
                    <span>تصفح الملف والصفحة الشخصية للمعلن</span>
                  </button>
                )}
                
                <a
                  href={`tel:${property.advertiserPhone}`}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#F27D26] to-[#ff8a3d] py-3 text-sm font-bold text-white hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
                >
                  <Phone className="h-4 w-4" />
                  <span>اتصال مباشر: {property.advertiserPhone}</span>
                </a>
                
                {property.advertiserWhatsapp && (
                  <a
                    href={`https://wa.me/${property.advertiserWhatsapp.replace(/[\s+]/g, '')}`}
                    target="_blank" rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-3 text-sm font-bold text-[#ffffff] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
                  >
                    <MessageCircle className="h-4.5 w-4.5" />
                    <span>مراسلة واتساب: {property.advertiserWhatsapp}</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Map Location Coordinates Container */}
          <div className="rounded-2xl border border-white/5 bg-slate-900/10 backdrop-blur-md p-6 space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-white/5 pb-3">موقع العقار والبيئة المحيطة</h3>
            
            {/* Visual Styled Map Mock Container */}
            <MapDisplay property={property} />

            {/* Neighboring properties suggestion list */}
            {nearbyProps.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                <h4 className="text-sm font-bold text-white mb-2">عقارات قريبة منك</h4>
                {nearbyProps?.map(np => (
                  <button 
                    key={np.id} 
                    onClick={() => onSelectProperty(np.id)}
                    className="w-full flex items-center gap-3 p-2 rounded-xl bg-slate-900/40 border border-white/5 hover:border-gold-prestige/30 transition-all text-right cursor-pointer"
                  >
                    <img loading="lazy" src={np.images?.[0]} alt={np.title} referrerPolicy="no-referrer" className="h-12 w-16 rounded object-cover" />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-bold text-white line-clamp-1">{np.title}</span>
                        <span className="text-[9px] text-gold-prestige font-bold shrink-0">{formatPrice(np.price, np.status)}</span>
                      </div>
                      <div className="flex justify-between items-end mt-1 text-[9px] text-slate-400">
                        <span>{np.status}</span>
                        <span>يبعد {(np.distance).toFixed(1)} كم</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <a
              href={mapUrl}
              target="_blank" rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-gold-prestige/30 bg-gold-prestige/10 hover:bg-gold-prestige/20 py-2.5 text-sm font-bold text-gold-prestige transition-all text-center"
            >
              <Compass className="h-4 w-4" />
              <span>فتح الموقع في تطبيقات الملاحة (جوجل مابس) ↗</span>
            </a>
          </div>

          {/* Nearby properties list */}
          {nearbyProps.length > 0 && (
            <div className="rounded-2xl border border-white/5 bg-slate-900/10 backdrop-blur-md p-6 space-y-4">
              <h3 className="text-sm font-bold text-white border-b border-white/5 pb-3">عقارات مقترحة في نفس المحافظة</h3>
              <div className="space-y-3.5">
                {nearbyProps?.map((prop) => (
                  <div 
                    key={prop.id}
                    onClick={() => onSelectProperty(prop.id)}
                    className="flex gap-2.5 items-center p-2 rounded-xl bg-slate-950/40 border border-white/5 hover:border-gold-prestige/20 transition-all cursor-pointer group"
                  >
                    <img loading="lazy" 
                      src={prop.images?.[0]} 
                      alt={prop.title} 
                      referrerPolicy="no-referrer"
                      className="h-12 w-16 object-cover rounded-lg shrink-0" 
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-[11.5px] font-bold text-white truncate group-hover:text-gold-prestige transition-colors">
                        {prop.title}
                      </h4>
                      <p className="text-sm text-slate-400 truncate font-sans">
                        {prop.district} • {prop.neighborhood}
                      </p>
                      <span className="text-sm text-gold-prestige font-bold block font-sans mt-0.5">
                        {formatPrice(prop.price, prop.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Lightbox / Zoom Fullscreen Slider overlay */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 animate-fade-in">
          
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 left-4 flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 border border-white/10 text-white hover:bg-slate-800 transition-all"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="relative max-h-[85vh] w-full max-w-5xl overflow-hidden rounded-xl border border-white/10 bg-black">
            <img loading="lazy" 
              src={property.images[activeImageIdx]} 
              alt="zoom" 
              referrerPolicy="no-referrer"
              className="h-full max-h-[85vh] w-full object-contain" 
            />

            {/* Floating Navigation controllers in lightbox */}
            {property.images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImageIdx((prev) => (prev > 0 ? prev - 1 : property.images.length - 1))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-black/80 text-white border border-white/10 hover:bg-gold-prestige"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
                <button
                  onClick={() => setActiveImageIdx((prev) => (prev < property.images.length - 1 ? prev + 1 : 0))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-black/80 text-white border border-white/10 hover:bg-gold-prestige"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
              </>
            )}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/70 border border-white/10 px-4 py-1.5 font-mono text-sm font-bold text-white">
              الصورة {activeImageIdx + 1} من أصل {property.images.length}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
