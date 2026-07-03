const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPortal.tsx', 'utf-8');

const sidebarMenuHTML = `
                <button
                  onClick={() => setAdminView('visits')}
                  className={\`w-full flex items-center justify-between rounded-lg px-4 py-3 font-semibold transition-all \${
                    adminView === 'visits' ? 'bg-white/5 text-gold-prestige' : 'text-slate-300 hover:bg-white/5'
                  }\`}
                >
                  <div className="flex items-center space-x-2.5 space-x-reverse">
                    <Calendar className="h-4 w-4 text-emerald-400" />
                    <span>إدارة طلبات زيارات العقارات</span>
                  </div>
                </button>

                <button
                  onClick={() => setAdminView('auctions')}
                  className={\`w-full flex items-center justify-between rounded-lg px-4 py-3 font-semibold transition-all \${
                    adminView === 'auctions' ? 'bg-white/5 text-gold-prestige' : 'text-slate-300 hover:bg-white/5'
                  }\`}
                >
                  <div className="flex items-center space-x-2.5 space-x-reverse">
                    <Gavel className="h-4 w-4 text-amber-500" />
                    <span>إدارة المزادات العقارية</span>
                  </div>
                </button>
`;

code = code.replace(
  '<div className="text-[10px] font-bold text-slate-500 px-4 mt-6 mb-2">إعدادات النظام والأمان</div>',
  sidebarMenuHTML + '\n\n<div className="text-[10px] font-bold text-slate-500 px-4 mt-6 mb-2">إعدادات النظام والأمان</div>'
);


const viewsHTML = `
        {/* NEW VISITS VIEW */}
        {adminView === 'visits' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-6">طلبات زيارة العقارات</h2>
            <div className="bg-slate-950/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-400">
                      <th className="py-3 px-4 font-normal">العقار</th>
                      <th className="py-3 px-4 font-normal">طالب الزيارة</th>
                      <th className="py-3 px-4 font-normal">الموعد</th>
                      <th className="py-3 px-4 font-normal">المالك</th>
                      <th className="py-3 px-4 font-normal">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {visits.map(v => (
                      <tr key={v.id} className="text-slate-300 hover:bg-white/[0.02]">
                        <td className="py-3 px-4">{v.propertyTitle}</td>
                        <td className="py-3 px-4 text-emerald-400">{v.requesterName} <br/><span className="text-[9px] text-slate-500">{v.requesterPhone}</span></td>
                        <td className="py-3 px-4 text-gold-prestige">{v.date} <br/> {v.time}</td>
                        <td className="py-3 px-4 font-mono">{v.ownerId}</td>
                        <td className="py-3 px-4">
                          <span className={\`px-2 py-1 rounded text-[10px] \${v.status === 'pending' ? 'bg-amber-500/20 text-amber-500' : v.status === 'accepted' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}\`}>
                            {v.status === 'pending' ? 'قيد الانتظار' : v.status === 'accepted' ? 'مقبول' : 'مرفوض'}
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

        {/* NEW AUCTIONS VIEW */}
        {adminView === 'auctions' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-6">المزادات العقارية</h2>
            <div className="bg-slate-950/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
              <p className="text-xs text-slate-400 mb-4">هذه اللوحة تعرض العقارات المعروضة في مزاد.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {properties.filter(p => p.isAuction).map(p => (
                  <div key={p.id} className="p-4 bg-slate-900 border border-amber-500/30 rounded-xl space-y-2">
                    <h3 className="text-white font-bold text-sm">{p.title}</h3>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-400">الحالة: {p.isAuctionActive ? <span className="text-emerald-400">نشط</span> : <span className="text-red-400">مغلق</span>}</span>
                      <span className="text-amber-500 font-bold">السعر الابتدائي: {p.startingPrice?.toLocaleString('ar-IQ')} د.ع</span>
                    </div>
                    <div className="flex justify-between text-[10px] bg-black/40 p-2 rounded">
                      <span className="text-slate-300">أعلى مزايدة: <span className="text-gold-prestige font-bold text-xs">{p.highestBid?.toLocaleString('ar-IQ') || 'لا يوجد'} د.ع</span></span>
                    </div>
                  </div>
                ))}
                {properties.filter(p => p.isAuction).length === 0 && (
                  <div className="col-span-full text-center text-slate-500 text-xs py-8">لا توجد مزادات عقارية حالياً.</div>
                )}
              </div>
            </div>
          </div>
        )}
`;

code = code.replace(
  '        {adminView === \'locations\' && (',
  viewsHTML + '\n\n        {adminView === \'locations\' && ('
);

fs.writeFileSync('src/components/AdminPortal.tsx', code);
console.log('Patched AdminPortal for visits and auctions');
