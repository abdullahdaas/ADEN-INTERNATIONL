import React from 'react';
import { Bed, Bath, Move, Eye, Heart, BadgeCheck, MessageCircle, Phone, GitCompare } from 'lucide-react';
import { Property } from '../types';

interface PropertyCardProps {
  key?: string | number;
  property: Property;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent) => void;
  onSelect: () => void | Promise<void>;
  isComparing: boolean;
  onToggleCompare: (e: React.MouseEvent) => void;
}

export function formatPrice(price: number, status: string): string {
  if (price === null || price === undefined || isNaN(price)) {
    return 'غير محدد';
  }
  if (price >= 1000000000) {
    const billions = price / 1000000000;
    return `${billions.toFixed(1).replace('.0', '')} مليار د.ع`;
  }
  if (price >= 1000000) {
    const millions = price / 1000000;
    return `${millions.toFixed(1).replace('.0', '')} مليون د.ع${status === 'للإيجار' ? ' / شهرياً' : ''}`;
  }
  return `${price.toLocaleString('ar-IQ')} د.ع${status === 'للإيجار' ? ' / شهرياً' : ''}`;
}

export default function PropertyCard({
  property,
  isFavorite,
  onToggleFavorite,
  onSelect,
  isComparing,
  onToggleCompare
}: PropertyCardProps) {
  
  // Status Styling Map
  const statusColors: Record<string, { bg: string, text: string }> = {
    'للبيع': { bg: 'bg-emerald-500/15', text: 'text-emerald-400 border border-emerald-500/30' },
    'للإيجار': { bg: 'bg-blue-500/15', text: 'text-blue-400 border border-blue-500/30' },
    'محجوز': { bg: 'bg-amber-500/15', text: 'text-amber-400 border border-amber-500/30' },
    'تم البيع': { bg: 'bg-rose-500/20', text: 'text-rose-400 border border-rose-500/30 line-through' },
    'تم التأجير': { bg: 'bg-indigo-500/20', text: 'text-indigo-400 border border-indigo-500/30 line-through' },
    'مميز': { bg: 'bg-gold-prestige/20', text: 'text-gold-prestige border border-gold-prestige/30' }
  };

  const statusStyle = statusColors[property.status] || { bg: 'bg-slate-500/10', text: 'text-slate-400' };

  const handleWhatsapp = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Use proper phone based on agent (default to abdullah's phone)
    const phone = property.agentId === 'ali_jassim' ? '9647701234567' : 
                  property.agentId === 'zahra_salah' ? '9647809876543' : '9647810060292';
    const msg = `السلام عليكم، أنا مهتم بعقاركم المعروض: "${property.title}" في ${property.governorate} - ${property.district} برمز: ${property.id}. يرجى تزويدي بمزيد من التفاصيل.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    const phone = property.agentId === 'ali_jassim' ? '07701234567' : 
                  property.agentId === 'zahra_salah' ? '07809876543' : '07810060292';
    window.open(`tel:${phone}`, '_self');
  };

  return (
    <div 
      id={`property-card-${property.id}`}
      onClick={onSelect}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-slate-900/20 backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:border-gold-prestige/30 hover:shadow-xl hover:shadow-black/40 cursor-pointer"
    >
      
      {/* Featured Accent Border */}
      {property.isFeatured && (
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-gold-prestige via-gold-accent to-yellow-500 z-10"></div>
      )}

      {/* Image Container */}
      <div className="relative h-64 w-full overflow-hidden bg-slate-950">
        <img
          src={property.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&auto=format&fit=crop&q=80'}
          alt={property.title}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent"></div>

        {/* Badges Column */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <span className={`rounded-lg px-2.5 py-1 text-sm font-bold ${statusStyle.bg} ${statusStyle.text} backdrop-blur-md`}>
            {property.status}
          </span>
          {property.isFeatured && (
            <span className="rounded-lg bg-gold-prestige/95 px-2.5 py-1 text-sm font-black text-white shadow-md animate-pulse">
              إعلان مميز ⭐
            </span>
          )}
        </div>

        {/* Favorite & Compare Overlay Actions */}
        <div className="absolute top-4 left-4 flex gap-2">
          {/* Compare Button */}
          <button
            id={`btn-compare-${property.id}`}
            onClick={onToggleCompare}
            className={`flex h-9 w-9 items-center justify-center rounded-lg border backdrop-blur-md transition-all ${
              isComparing 
                ? 'bg-gold-prestige border-gold-prestige text-white' 
                : 'bg-black/40 border-white/10 text-white hover:bg-gold-prestige/20 hover:border-gold-prestige/40'
            }`}
            title="إضافة للمقارنة"
          >
            <GitCompare className="h-4.5 w-4.5" />
          </button>

          {/* Favorite Button */}
          <button
            id={`btn-favorite-prop-${property.id}`}
            onClick={onToggleFavorite}
            className={`flex h-9 w-9 items-center justify-center rounded-lg border backdrop-blur-md transition-all ${
              isFavorite 
                ? 'bg-gold-accent/90 border-gold-accent text-white' 
                : 'bg-black/40 border-white/10 text-white hover:bg-gold-accent/20 hover:border-gold-accent/40'
            }`}
            title="حفظ في المفضلة"
          >
            <Heart className={`h-4.5 w-4.5 ${isFavorite ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Property Type Badge */}
        <div className="absolute bottom-3 right-4 rounded bg-black/60 px-2 py-0.5 text-sm font-medium text-slate-300 backdrop-blur-xs">
          {property.buildingType}
        </div>

        {/* Date / Day badge */}
        <div className="absolute bottom-3 left-4 flex items-center gap-2 rounded bg-black/60 px-2 py-0.5 text-sm font-mono text-slate-300 backdrop-blur-xs">
          <Eye className="h-3 w-3 text-gold-prestige" />
          <span>{property.views} مشاهدة</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-4">
        
        {/* Price & Area */}
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-xl font-extrabold text-gold-prestige font-sans">
            {formatPrice(property.price, property.status)}
          </span>
          <span className="text-sm font-medium text-slate-400">
            {property.space} م²
          </span>
        </div>

        {/* Title */}
        <h3 className="line-clamp-1 text-base font-bold text-white group-hover:text-gold-prestige transition-colors mb-1.5" title={property.title}>
          {property.title}
        </h3>

        {/* Location Info */}
        <p className="line-clamp-1 text-sm text-slate-400 mb-4 flex items-center gap-1">
          <span className="text-gold-prestige font-black">📍</span>
          <span>{property.governorate} • {property.district} • {property.neighborhood}</span>
        </p>

        {/* Specifications Icons */}
        <div className="mt-auto grid grid-cols-3 gap-2 border-t border-white/5 pt-3.5 mb-4 text-sm text-slate-300 font-medium">
          <div className="flex items-center justify-center gap-2 rounded-lg bg-white/5 py-1.5" title="غرف النوم">
            <Bed className="h-3.5 w-3.5 text-gold-prestige" />
            <span>{property.bedrooms || '—'} غرف</span>
          </div>
          <div className="flex items-center justify-center gap-2 rounded-lg bg-white/5 py-1.5" title="الحمامات">
            <Bath className="h-3.5 w-3.5 text-gold-prestige" />
            <span>{property.bathrooms || '—'} حمام</span>
          </div>
          <div className="flex items-center justify-center gap-2 rounded-lg bg-white/5 py-1.5" title="المساحة">
            <Move className="h-3.5 w-3.5 text-gold-prestige" />
            <span>{property.space} م²</span>
          </div>
        </div>

        {/* Contact/Call buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5">
          <button
            id={`btn-call-agent-${property.id}`}
            onClick={handleCall}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-bold text-slate-300 transition-all hover:bg-white/10 hover:text-white"
          >
            <Phone className="h-3.5 w-3.5" />
            <span>اتصال</span>
          </button>
          <button
            id={`btn-whatsapp-agent-${property.id}`}
            onClick={handleWhatsapp}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600/90 py-2.5 text-sm font-bold text-white transition-all hover:bg-emerald-600 hover:shadow-md hover:shadow-emerald-600/15"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            <span>واتساب</span>
          </button>
        </div>

      </div>

    </div>
  );
}
