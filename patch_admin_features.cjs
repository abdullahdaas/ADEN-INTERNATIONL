const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPortal.tsx', 'utf-8');

// Imports
if (!code.includes('fetchOffers')) {
  code = code.replace("fetchOtpLogs, fetchVisits, fetchLogs", "fetchOtpLogs, fetchVisits, fetchLogs, fetchOffers, fetchComplaints, updateOffer, updateComplaint");
}

if (!code.includes('Banknote,')) {
  code = code.replace("Calendar", "Calendar, Banknote, ShieldAlert");
}

// State
if (!code.includes('const [offers, setOffers]')) {
  code = code.replace("const [visits, setVisits] = useState<any[]>([]);", "const [visits, setVisits] = useState<any[]>([]);\n  const [offers, setOffers] = useState<any[]>([]);\n  const [complaints, setComplaints] = useState<any[]>([]);");
}

// Sidebar types
code = code.replace(/auctions' \| 'visits'>\('dashboard'\);/, "auctions' | 'visits' | 'offers' | 'complaints'>('dashboard');");

// Fetch
const fetchBlock = `      try {
        const o = await fetchOffers();
        setOffers(o);
      } catch(e) {}

      try {
        const c = await fetchComplaints();
        setComplaints(c);
      } catch(e) {}`;

code = code.replace("setVisits(v);\n      } catch(e) {}", "setVisits(v);\n      } catch(e) {}\n\n" + fetchBlock);

// Sidebar menu
const sidebarHtml = `
                <button
                  onClick={() => setAdminView('offers')}
                  className={\`w-full flex items-center justify-between rounded-lg px-4 py-3 font-semibold transition-all \${
                    adminView === 'offers' ? 'bg-white/5 text-gold-prestige' : 'text-slate-300 hover:bg-white/5'
                  }\`}
                >
                  <div className="flex items-center space-x-2.5 space-x-reverse">
                    <Banknote className="h-4 w-4 text-blue-400" />
                    <span>إدارة عروض الشراء</span>
                  </div>
                </button>

                <button
                  onClick={() => setAdminView('complaints')}
                  className={\`w-full flex items-center justify-between rounded-lg px-4 py-3 font-semibold transition-all \${
                    adminView === 'complaints' ? 'bg-white/5 text-gold-prestige' : 'text-slate-300 hover:bg-white/5'
                  }\`}
                >
                  <div className="flex items-center space-x-2.5 space-x-reverse">
                    <ShieldAlert className="h-4 w-4 text-red-400" />
                    <span>الشكاوى والنزاعات</span>
                  </div>
                </button>
`;
code = code.replace(/<div className="text-\[10px\] font-bold text-slate-500 px-4 mt-6 mb-2">إعدادات النظام والأمان<\/div>/, sidebarHtml + '\n<div className="text-[10px] font-bold text-slate-500 px-4 mt-6 mb-2">إعدادات النظام والأمان</div>');

// Views
const viewsHtml = `
        {/* OFFERS VIEW */}
        {adminView === 'offers' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-6">عروض الشراء</h2>
            <div className="bg-slate-950/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-400">
                      <th className="py-3 px-4 font-normal">العقار</th>
                      <th className="py-3 px-4 font-normal">المشتري</th>
                      <th className="py-3 px-4 font-normal">المبلغ المقترح</th>
                      <th className="py-3 px-4 font-normal">الرسالة</th>
                      <th className="py-3 px-4 font-normal">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {offers.map(o => (
                      <tr key={o.id} className="text-slate-300 hover:bg-white/[0.02]">
                        <td className="py-3 px-4">{o.propertyTitle}</td>
                        <td className="py-3 px-4">{o.buyerName}</td>
                        <td className="py-3 px-4 font-bold text-gold-prestige">{o.amount.toLocaleString('ar-IQ')} د.ع</td>
                        <td className="py-3 px-4 text-[10px]">{o.message || '-'}</td>
                        <td className="py-3 px-4">
                          <span className={\`px-2 py-1 rounded text-[10px] \${o.status === 'pending' ? 'bg-amber-500/20 text-amber-500' : o.status === 'accepted' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}\`}>
                            {o.status === 'pending' ? 'قيد الانتظار' : o.status === 'accepted' ? 'مقبول' : 'مرفوض'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* COMPLAINTS VIEW */}
        {adminView === 'complaints' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-6">مركز الشكاوى والنزاعات</h2>
            <div className="bg-slate-950/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
              <div className="space-y-4">
                {complaints.map(c => (
                  <div key={c.id} className="p-4 bg-slate-900 border border-white/10 rounded-xl space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="text-white font-bold text-sm text-red-400">{c.subject}</h3>
                      <span className={\`px-2 py-1 rounded text-[10px] \${c.status === 'open' ? 'bg-amber-500/20 text-amber-500' : c.status === 'closed' ? 'bg-slate-500/20 text-slate-400' : 'bg-blue-500/20 text-blue-400'}\`}>
                        {c.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">{c.description}</p>
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>المرسل: {c.reporterName} ({c.reporterId})</span>
                      <span>{new Date(c.createdAt).toLocaleDateString('ar-IQ')}</span>
                    </div>
                    {c.status !== 'closed' && (
                      <button 
                        onClick={async () => {
                          try {
                            await updateComplaint(c.id, { status: 'closed', resolution: 'تم الإغلاق من قبل الإدارة' });
                            loadData();
                          } catch(e) {}
                        }}
                        className="mt-2 px-3 py-1 bg-slate-800 text-white rounded text-[10px] hover:bg-slate-700"
                      >
                        إغلاق الشكوى
                      </button>
                    )}
                  </div>
                ))}
                {complaints.length === 0 && <div className="text-center text-slate-500 text-xs py-8">لا توجد شكاوى حالياً.</div>}
              </div>
            </div>
          </div>
        )}
`;

code = code.replace(
  '{/* VIEW 3: INBOX MESSAGES */}',
  viewsHtml + '\n\n        {/* VIEW 3: INBOX MESSAGES */}'
);

fs.writeFileSync('src/components/AdminPortal.tsx', code);
console.log('Patched AdminPortal for Offers and Complaints');
