import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { IRAQ_LOCATIONS } from '../data/iraqLocations';
import { CONSTRUCTION_MATERIALS } from '../data/constructionMaterials';
import { submitProviderApplication } from '../utils/api';

export function MaterialsProviderForm({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    ownerName: '',
    phone: '',
    whatsapp: '',
    email: '',
    governorate: '',
    district: '',
    neighborhood: '',
    address: '',
    mapLink: '',
    description: '',
    workingHours: '',
    hasDelivery: false,
    facebook: '',
    instagram: '',
    telegram: '',
    website: '',
    materialsOffered: [] as string[]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMaterialToggle = (mat: string) => {
    setFormData(prev => {
      const exists = prev.materialsOffered.includes(mat);
      if (exists) {
        return { ...prev, materialsOffered: prev.materialsOffered.filter(m => m !== mat) };
      }
      return { ...prev, materialsOffered: [...prev.materialsOffered, mat] };
    });
  };

  const selectedGov = IRAQ_LOCATIONS.find(g => g.governorate === formData.governorate);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        category: 'المواد الإنشائية',
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      const response = await submitProviderApplication(payload);
      if (!response?.success) {
        throw new Error(response?.message || 'فشل إرسال طلب التسجيل');
      }

      alert('تم تقديم طلبك بنجاح كمزود مواد إنشائية. سيتم مراجعة حسابك وتفعيله قريباً.');
      onClose();
    } catch (error) {
      console.error('[MaterialsProviderForm] submitProviderApplication failed', error);
      alert('تعذر إرسال الطلب حالياً. يرجى التحقق من بياناتك ثم المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col my-auto max-h-[90vh]">
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-slate-950 sticky top-0 z-10">
          <h3 className="font-bold text-lg text-white">تسجيل حساب - مواد إنشائية</h3>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg text-slate-400 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
              <h4 className="text-[#F27D26] font-bold border-b border-white/5 pb-2">المعلومات الأساسية</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">اسم الشركة / المحل *</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#F27D26] outline-none" placeholder="مثال: شركة النور للمواد الإنشائية" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">اسم المالك *</label>
                  <input type="text" value={formData.ownerName} onChange={e => setFormData({...formData, ownerName: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#F27D26] outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">رقم الهاتف *</label>
                  <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#F27D26] outline-none font-mono" dir="ltr" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">واتساب *</label>
                  <input type="text" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#F27D26] outline-none font-mono" dir="ltr" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs text-slate-400 mb-1">البريد الإلكتروني (اختياري)</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#F27D26] outline-none" dir="ltr" />
                </div>
              </div>
              
              <h4 className="text-[#F27D26] font-bold border-b border-white/5 pb-2 pt-4">العنوان والموقع</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">المحافظة *</label>
                  <select value={formData.governorate} onChange={e => setFormData({...formData, governorate: e.target.value, district: '', neighborhood: ''})} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#F27D26] outline-none">
                    <option value="">اختر المحافظة</option>
                    {IRAQ_LOCATIONS.map(g => <option key={g.governorate} value={g.governorate}>{g.governorate}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">القضاء *</label>
                  <select value={formData.district} onChange={e => setFormData({...formData, district: e.target.value, neighborhood: ''})} disabled={!selectedGov} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#F27D26] outline-none disabled:opacity-50">
                    <option value="">اختر القضاء</option>
                    {selectedGov?.districts.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">المنطقة *</label>
                  <input type="text" value={formData.neighborhood} onChange={e => setFormData({...formData, neighborhood: e.target.value})} disabled={!formData.district} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#F27D26] outline-none disabled:opacity-50" placeholder="اسم المنطقة أو الحي" />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-xs text-slate-400 mb-1">رابط الموقع على الخريطة (Google Maps) *</label>
                  <input type="text" value={formData.mapLink} onChange={e => setFormData({...formData, mapLink: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#F27D26] outline-none" dir="ltr" placeholder="https://maps.google.com/..." />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
              <h4 className="text-[#F27D26] font-bold border-b border-white/5 pb-2">تفاصيل النشاط التجاري</h4>
              <div>
                <label className="block text-xs text-slate-400 mb-1">وصف النشاط *</label>
                <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#F27D26] outline-none" placeholder="نبذة عن الشركة، سنوات الخبرة، المميزات..." />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">أوقات الدوام *</label>
                  <input type="text" value={formData.workingHours} onChange={e => setFormData({...formData, workingHours: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#F27D26] outline-none" placeholder="مثال: 8 صباحاً - 5 مساءً" />
                </div>
                <div className="flex items-center mt-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${formData.hasDelivery ? 'bg-[#F27D26] border-[#F27D26]' : 'border-white/20 bg-slate-900'}`}>
                      {formData.hasDelivery && <Check className="w-4 h-4 text-white" />}
                    </div>
                    <input type="checkbox" className="hidden" checked={formData.hasDelivery} onChange={e => setFormData({...formData, hasDelivery: e.target.checked})} />
                    <span className="text-sm text-white font-medium">تتوفر خدمة توصيل للمواد</span>
                  </label>
                </div>
              </div>

              <h4 className="text-[#F27D26] font-bold border-b border-white/5 pb-2 pt-4">روابط التواصل الاجتماعي (اختياري)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">فيسبوك</label>
                  <input type="text" value={formData.facebook} onChange={e => setFormData({...formData, facebook: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#F27D26] outline-none" dir="ltr" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">إنستغرام</label>
                  <input type="text" value={formData.instagram} onChange={e => setFormData({...formData, instagram: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#F27D26] outline-none" dir="ltr" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">تلغرام</label>
                  <input type="text" value={formData.telegram} onChange={e => setFormData({...formData, telegram: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#F27D26] outline-none" dir="ltr" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">الموقع الإلكتروني</label>
                  <input type="text" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#F27D26] outline-none" dir="ltr" />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
              <h4 className="text-[#F27D26] font-bold border-b border-white/5 pb-2">المواد الإنشائية المتوفرة</h4>
              <p className="text-xs text-slate-400">حدد جميع المواد التي يتوفر بيعها في شركتك/محلك:</p>
              
              <div className="flex flex-wrap gap-2">
                {CONSTRUCTION_MATERIALS.map(mat => (
                  <button
                    key={mat}
                    onClick={() => handleMaterialToggle(mat)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                      formData.materialsOffered.includes(mat) 
                        ? 'bg-[#F27D26] text-white border-[#F27D26]' 
                        : 'bg-slate-900 text-slate-300 border-white/10 hover:border-white/30'
                    }`}
                  >
                    {mat}
                  </button>
                ))}
              </div>

              <div className="mt-6 p-4 bg-slate-800/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 leading-relaxed mb-2">
                  ملاحظة: بعد إرسال الطلب والموافقة عليه، ستتمكن من تسجيل الدخول إلى لوحة التحكم الخاصة بك لرفع الشعار، صورة الغلاف، ومعرض صور المنتجات الخاصة بك بحرية.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/10 bg-slate-950 flex justify-between gap-3">
          {step > 1 ? (
            <button 
              onClick={() => setStep(step - 1)}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all"
            >
              رجوع
            </button>
          ) : <div></div>}

          {step < 3 ? (
            <button 
              disabled={step === 1 && (!formData.name || !formData.ownerName || !formData.phone || !formData.whatsapp || !formData.governorate || !formData.district || !formData.neighborhood || !formData.mapLink)}
              onClick={() => setStep(step + 1)}
              className="px-8 py-3 bg-[#F27D26] hover:bg-[#d96a1a] text-white rounded-xl font-bold transition-all disabled:opacity-50"
            >
              التالي
            </button>
          ) : (
            <button 
              disabled={isSubmitting || formData.materialsOffered.length === 0}
              onClick={handleSubmit}
              className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? 'جاري الإرسال...' : 'إرسال طلب التسجيل'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
