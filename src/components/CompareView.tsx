import React from 'react';
import { GitCompare, X, Phone, MessageCircle, Check, AlertCircle } from 'lucide-react';
import { Property } from '../types';
import { formatPrice } from './PropertyCard';

interface CompareViewProps {
  properties: Property[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onSelectProperty: (id: string) => void;
}

export default function CompareView({
  properties,
  onRemove,
  onClear,
  onSelectProperty
}: CompareViewProps) {
  
  if (properties.length === 0) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-white/5 bg-slate-900/10 backdrop-blur-md p-10 text-center">
        <GitCompare className="mx-auto h-12 w-12 text-slate-500 mb-4 animate-pulse" />
        <h3 className="text-lg font-bold text-white mb-2">جدول المقارنة العقارية فارغ</h3>
        <p className="text-sm text-slate-400 font-sans mb-6">
          يمكنك إضافة ما يصل إلى 3 عقارات لمقارنتها جنباً إلى جنب في جدول واحد لمساعدتك في اتخاذ القرار الأمثل.
        </p>
        <button
          onClick={() => {
            const el = document.getElementById('nav-listings');
            if (el) el.click();
          }}
          className="rounded-xl bg-gold-prestige px-6 py-2.5 text-sm font-bold text-white hover:bg-gold-accent transition-all cursor-pointer"
        >
          استعرض العقارات وأضف للمقارنة
        </button>
      </div>
    );
  }

  const renderAmenity = (val: boolean) => {
    return val ? (
      <span className="flex items-center justify-center text-emerald-400 font-bold bg-emerald-500/10 h-6 w-6 rounded-full mx-auto">
        <Check className="h-4 w-4" />
      </span>
    ) : (
      <span className="text-slate-600 font-bold">—</span>
    );
  };

  const handleWhatsapp = (property: Property) => {
    const phone = property.agentId === 'ali_jassim' ? '9647701234567' : 
                  property.agentId === 'zahra_salah' ? '9647809876543' : '9647810060292';
    const msg = `السلام عليكم، أود الاستفسار عن العقار المقارن: "${property.title}" برمز: ${property.id}.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleCall = (property: Property) => {
    const phone = property.agentId === 'ali_jassim' ? '07701234567' : 
                  property.agentId === 'zahra_salah' ? '07809876543' : '07810060292';
    window.open(`tel:${phone}`, '_self');
  };

  return (
    <div id="compare-section" className="rounded-2xl border border-white/5 bg-slate-900/10 backdrop-blur-md p-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <GitCompare className="h-5.5 w-5.5 text-gold-prestige" />
            <span>المقارنة العقارية الثنائية والمتعددة</span>
          </h2>
          <p className="text-xs text-slate-400 font-sans mt-1">
            قارن بين أسعار، مساحات، ومواصفات العقارات المختارة للمفاضلة بينها واختيار الأنسب لك
          </p>
        </div>
        
        {properties.length > 0 && (
          <button
            onClick={onClear}
            className="text-xs font-semibold text-rose-400 hover:text-rose-300 transition-all cursor-pointer"
          >
            مسح قائمة المقارنة ({properties.length})
          </button>
        )}
      </div>

      {properties.length > 3 && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-amber-500/10 p-3 border border-amber-500/20 text-xs text-amber-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>الحد الأقصى للمقارنة الفعالة هو 3 عقارات. يرجى إزالة بعضها لتنظيم الجدول.</span>
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-950/40">
        <table className="w-full text-center text-sm border-collapse ">
          <thead>
            <tr className="border-b border-white/10 bg-slate-950 text-slate-300">
              <th className="py-4 px-4 font-bold text-right w-44">المواصفة / العقار</th>
              {properties?.map((p) => (
                <th key={p.id} className="py-4 px-4 font-bold relative ">
                  {/* Remove Button */}
                  <button
                    onClick={() => onRemove(p.id)}
                    className="absolute top-2 left-2 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-slate-400 hover:text-white border border-white/5"
                    title="إزالة من المقارنة"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  <div className="pt-2 px-2 text-right">
                    <span className="text-[10px] text-gold-prestige font-bold bg-gold-prestige/15 px-2 py-0.5 rounded">
                      {p.buildingType}
                    </span>
                    <h3 
                      onClick={() => onSelectProperty(p.id)}
                      className="text-xs font-bold text-white line-clamp-2 mt-2 hover:text-gold-prestige hover:underline cursor-pointer"
                    >
                      {p.title}
                    </h3>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-300">
            
            {/* Price */}
            <tr className="hover:bg-white/5">
              <td className="py-3 px-4 font-bold text-slate-400 text-right">السعر المعروض</td>
              {properties?.map((p) => (
                <td key={p.id} className="py-3 px-4 font-black text-gold-prestige font-sans">
                  {formatPrice(p.price, p.status)}
                </td>
              ))}
            </tr>

            {/* Space */}
            <tr className="hover:bg-white/5">
              <td className="py-3 px-4 font-bold text-slate-400 text-right">المساحة الإجمالية</td>
              {properties?.map((p) => (
                <td key={p.id} className="py-3 px-4 font-bold font-sans">
                  {p.space} م²
                </td>
              ))}
            </tr>

            {/* Price per sqm */}
            <tr className="hover:bg-white/5">
              <td className="py-3 px-4 font-bold text-slate-400 text-right">سعر المتر التقريبي</td>
              {properties?.map((p) => {
                const price = p.price || 0;
                const space = p.space || 1;
                const perMeter = Math.round(price / space);
                return (
                  <td key={p.id} className="py-3 px-4 font-medium text-slate-400 font-sans">
                    {p.status === 'للإيجار' ? '—' : `${(perMeter || 0).toLocaleString('ar-IQ')} د.ع / م²`}
                  </td>
                );
              })}
            </tr>

            {/* Location */}
            <tr className="hover:bg-white/5">
              <td className="py-3 px-4 font-bold text-slate-400 text-right">الموقع الجغرافي</td>
              {properties?.map((p) => (
                <td key={p.id} className="py-3 px-4 text-xs font-semibold">
                  {p.governorate} • {p.district} <br />
                  <span className="text-slate-400 font-normal">{p.neighborhood}</span>
                </td>
              ))}
            </tr>

            {/* Bedrooms */}
            <tr className="hover:bg-white/5">
              <td className="py-3 px-4 font-bold text-slate-400 text-right">عدد غرف النوم</td>
              {properties?.map((p) => (
                <td key={p.id} className="py-3 px-4 font-bold font-sans">
                  {p.bedrooms || '—'} غرف
                </td>
              ))}
            </tr>

            {/* Bathrooms */}
            <tr className="hover:bg-white/5">
              <td className="py-3 px-4 font-bold text-slate-400 text-right">عدد الحمامات</td>
              {properties?.map((p) => (
                <td key={p.id} className="py-3 px-4 font-bold font-sans">
                  {p.bathrooms || '—'}
                </td>
              ))}
            </tr>

            {/* Floors */}
            <tr className="hover:bg-white/5">
              <td className="py-3 px-4 font-bold text-slate-400 text-right">عدد الطوابق</td>
              {properties?.map((p) => (
                <td key={p.id} className="py-3 px-4 font-sans">
                  {p.floors || '—'} طوابق
                </td>
              ))}
            </tr>

            {/* Furnished */}
            <tr className="hover:bg-white/5">
              <td className="py-3 px-4 font-bold text-slate-400 text-right">مفروش / غير مفروش</td>
              {properties?.map((p) => (
                <td key={p.id} className="py-3 px-4 text-xs">
                  {p.isFurnished ? (
                    <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">مفروش بالكامل</span>
                  ) : 'غير مفروش'}
                </td>
              ))}
            </tr>

            {/* Generator */}
            <tr className="hover:bg-white/5">
              <td className="py-3 px-4 font-bold text-slate-400 text-right">مولدة كهرباء ذهبية</td>
              {properties?.map((p) => (
                <td key={p.id} className="py-3 px-4">
                  {renderAmenity(p.hasGenerator)}
                </td>
              ))}
            </tr>

            {/* Solar Power */}
            <tr className="hover:bg-white/5">
              <td className="py-3 px-4 font-bold text-slate-400 text-right">منظومة طاقة شمسية</td>
              {properties?.map((p) => (
                <td key={p.id} className="py-3 px-4">
                  {renderAmenity(p.hasSolarPower)}
                </td>
              ))}
            </tr>

            {/* Pool */}
            <tr className="hover:bg-white/5">
              <td className="py-3 px-4 font-bold text-slate-400 text-right">مسبح خاص</td>
              {properties?.map((p) => (
                <td key={p.id} className="py-3 px-4">
                  {renderAmenity(p.hasPool)}
                </td>
              ))}
            </tr>

            {/* Garage */}
            <tr className="hover:bg-white/5">
              <td className="py-3 px-4 font-bold text-slate-400 text-right">كراج سيارات مخصص</td>
              {properties?.map((p) => (
                <td key={p.id} className="py-3 px-4">
                  {renderAmenity(p.hasGarage)}
                </td>
              ))}
            </tr>

            {/* Garden */}
            <tr className="hover:bg-white/5">
              <td className="py-3 px-4 font-bold text-slate-400 text-right">حديقة خارجية</td>
              {properties?.map((p) => (
                <td key={p.id} className="py-3 px-4">
                  {renderAmenity(p.hasGarden)}
                </td>
              ))}
            </tr>

            {/* Elevator */}
            <tr className="hover:bg-white/5">
              <td className="py-3 px-4 font-bold text-slate-400 text-right">مصعد كهربائي</td>
              {properties?.map((p) => (
                <td key={p.id} className="py-3 px-4">
                  {renderAmenity(p.hasElevator)}
                </td>
              ))}
            </tr>

            {/* Status */}
            <tr className="hover:bg-white/5">
              <td className="py-3 px-4 font-bold text-slate-400 text-right">حالة الإعلان الحالي</td>
              {properties?.map((p) => (
                <td key={p.id} className="py-3 px-4 font-bold text-xs text-gold-prestige">
                  {p.status}
                </td>
              ))}
            </tr>

            {/* Direct Contact Row */}
            <tr className="bg-slate-900/35">
              <td className="py-4 px-4 font-bold text-slate-400 text-right">تواصل مباشر</td>
              {properties?.map((p) => (
                <td key={p.id} className="py-4 px-4">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => handleCall(p)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-white transition-all"
                      title="اتصل"
                    >
                      <Phone className="h-4 w-4 text-gold-prestige" />
                    </button>
                    <button
                      onClick={() => handleWhatsapp(p)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/20 text-white transition-all"
                      title="واتساب"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              ))}
            </tr>

          </tbody>
        </table>
      </div>

    </div>
  );
}
