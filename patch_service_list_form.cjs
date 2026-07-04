const fs = require('fs');
let code = fs.readFileSync('src/components/ServiceProvidersList.tsx', 'utf8');

// We need an add application state
code = code.replace(
  "const [searchTerm, setSearchTerm] = useState('');",
  `const [searchTerm, setSearchTerm] = useState('');
  const [showAppModal, setShowAppModal] = useState(false);
  const [appForm, setAppForm] = useState({ name: '', phone: '', category: '', governorate: '', details: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);`
);

// We need to import X
if (!code.includes('X,')) {
  code = code.replace("Search, Filter, MapPin, Star, ShieldCheck, ArrowRight", "Search, Filter, MapPin, Star, ShieldCheck, ArrowRight, X, Plus");
}

// Add the button
code = code.replace(
  /<div className="max-w-7xl mx-auto">\n\s*<div className="mb-8">\n\s*<h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">/m,
  `<div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">`
);

code = code.replace(
  /مهندسين، محامين، وشركات الصيانة الموثوقة والمعتمدة\.\n\s*<\/p>/m,
  `مهندسين، محامين، وشركات الصيانة الموثوقة والمعتمدة.
            </p>
          </div>
          <button onClick={() => setShowAppModal(true)} className="bg-[#F27D26] hover:bg-[#d96a1a] text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#F27D26]/20 shrink-0">
            <Plus className="w-5 h-5" /> انضم كمزود خدمة
          </button>
        </div>
        <div className="mb-8">`
);

// We need the API to submit
if (!code.includes('submitProviderApplication')) {
  code = code.replace("import { ServiceProvider } from '../types';", "import { ServiceProvider } from '../types';\nimport { submitProviderApplication } from '../utils/api';\nimport { IRAQ_LOCATIONS } from '../data/iraqLocations';");
}

// Add the Modal HTML before the final closing div
const modalHtml = `
      {showAppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-slate-950">
              <h3 className="font-bold text-lg text-white">انضم كمزود خدمة معتمد</h3>
              <button onClick={() => setShowAppModal(false)} className="p-1 hover:bg-white/10 rounded-lg text-slate-400">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">الاسم الكامل / اسم الشركة</label>
                <input type="text" value={appForm.name} onChange={e => setAppForm({...appForm, name: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#F27D26] outline-none" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">رقم الهاتف</label>
                <input type="text" value={appForm.phone} onChange={e => setAppForm({...appForm, phone: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#F27D26] outline-none font-mono" dir="ltr" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">الفئة</label>
                <select value={appForm.category} onChange={e => setAppForm({...appForm, category: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#F27D26] outline-none">
                  <option value="">اختر الفئة</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">المحافظة</label>
                <select value={appForm.governorate} onChange={e => setAppForm({...appForm, governorate: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#F27D26] outline-none">
                  <option value="">اختر المحافظة</option>
                  {IRAQ_LOCATIONS.map(g => <option key={g.governorate} value={g.governorate}>{g.governorate}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">تفاصيل إضافية (الخبرة، الأعمال السابقة)</label>
                <textarea rows={3} value={appForm.details} onChange={e => setAppForm({...appForm, details: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#F27D26] outline-none" />
              </div>
            </div>
            <div className="p-4 border-t border-white/10 bg-slate-950 flex gap-3">
              <button 
                disabled={isSubmitting || !appForm.name || !appForm.phone || !appForm.category || !appForm.governorate}
                onClick={async () => {
                  setIsSubmitting(true);
                  try {
                    await submitProviderApplication({ ...appForm, status: 'pending', createdAt: new Date().toISOString() });
                    alert('تم تقديم طلبك بنجاح. سيتم التواصل معك قريباً.');
                    setShowAppModal(false);
                    setAppForm({ name: '', phone: '', category: '', governorate: '', details: '' });
                  } catch(e) { alert('خطأ في إرسال الطلب'); }
                  setIsSubmitting(false);
                }}
                className="flex-1 bg-[#F27D26] hover:bg-[#d96a1a] text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'جاري الإرسال...' : 'إرسال الطلب'}
              </button>
            </div>
          </div>
        </div>
      )}`;

code = code.replace(/    <\/div>\n  \);\n\}\n?$/, modalHtml + "\n    </div>\n  );\n}");

fs.writeFileSync('src/components/ServiceProvidersList.tsx', code);
console.log("Patched ServiceProvidersList UI");
