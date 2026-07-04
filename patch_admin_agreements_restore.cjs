const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPortal.tsx', 'utf8');

const agreementsHtml = `        {/* AGREEMENTS VIEW */}
        {adminView === "agreements" && (
          <div className="space-y-6 animate-fade-in">
            <div className="rounded-2xl border border-white/5 bg-slate-900/10 backdrop-blur-md p-6 flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold text-white mb-1">
                  طلبات المخاطبات (المكاتبات)
                </h2>
                <p className="text-xs text-slate-400 font-sans">
                  مراجعة واعتماد طلبات المكاتبات الإلكترونية
                </p>
              </div>
            </div>
            <div className="overflow-x-auto bg-slate-900/50 rounded-2xl border border-white/5">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-950/80">
                  <tr className="border-b border-white/5 text-slate-400">
                    <th className="py-3 px-4 font-normal">الرقم التسلسلي</th>
                    <th className="py-3 px-4 font-normal">اسم المشتري</th>
                    <th className="py-3 px-4 font-normal">اسم البائع</th>
                    <th className="py-3 px-4 font-normal">السعر المتفق عليه</th>
                    <th className="py-3 px-4 font-normal">تاريخ الإرسال</th>
                    <th className="py-3 px-4 font-normal">الحالة</th>
                    <th className="py-3 px-4 font-normal">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {agreementRequests.map((agr) => (
                    <tr key={agr.id} className="text-slate-300 hover:bg-white/[0.02]">
                      <td className="py-3 px-4 font-bold text-white font-mono">{agr.serialNumber}</td>
                      <td className="py-3 px-4">{agr.buyerName}</td>
                      <td className="py-3 px-4">{agr.sellerName}</td>
                      <td className="py-3 px-4 font-mono text-emerald-400">{agr.agreedPrice} د.ع</td>
                      <td className="py-3 px-4">{agr.createdAt ? new Date(agr.createdAt).toLocaleDateString('en-GB') : 'غير متوفر'}</td>
                      <td className="py-3 px-4">
                        <span className={\`\${agr.status === 'active' ? 'text-emerald-400 bg-emerald-500/10' : (agr.status === 'pending_approval' ? 'text-amber-400 bg-amber-500/10' : 'text-slate-400 bg-slate-800')} px-2 py-1 rounded\`}>
                          {agr.status === 'active' ? 'سارية' : (agr.status === 'pending_approval' ? 'معلقة' : agr.status)}
                        </span>
                      </td>
                      <td className="py-3 px-4 flex gap-2">
                        <button 
                          onClick={() => setSelectedAgreementRequest(agr)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          عرض التفاصيل
                        </button>
                      </td>
                    </tr>
                  ))}
                  {agreementRequests.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-slate-500">لا توجد مكاتبات</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* AGREEMENT PAYMENTS VIEW */}`;

code = code.replace(
  "{/* AGREEMENT PAYMENTS VIEW */}",
  agreementsHtml
);

fs.writeFileSync('src/components/AdminPortal.tsx', code);
console.log("Patched agreements view restore");
