const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPortal.tsx', 'utf-8');

// Find where to add mock state
const statePattern = /const \[adminView, setAdminView\] = useState[\s\S]*?\("dashboard"\);/;
if (code.match(statePattern)) {
    code = code.replace(statePattern, `$&
  const [agreementRequests, setAgreementRequests] = useState([
    {
      id: 'req_1',
      payerName: 'أحمد محمود',
      phone: '07812345678',
      method: 'zain_cash',
      amount: '25,000',
      date: new Date().toLocaleDateString("en-GB"),
      status: 'pending'
    },
    {
      id: 'req_2',
      payerName: 'علي حسين',
      phone: '07712345678',
      method: 'qi_card',
      amount: '25,000',
      date: '12/03/2024',
      status: 'approved'
    }
  ]);
  
  const handleApproveRequest = (id: string) => {
    setAgreementRequests(prev => prev.map(r => r.id === id ? {...r, status: 'approved'} : r));
    alert("تم اعتماد الدفع وإصدار المكاتبة بنجاح");
  };
  
  const handleRejectRequest = (id: string) => {
    setAgreementRequests(prev => prev.map(r => r.id === id ? {...r, status: 'rejected'} : r));
    alert("تم رفض طلب الدفع");
  };
`);
}

let viewIndex = code.indexOf('{adminView === "agreement-payments"');
if (viewIndex !== -1) {
    let tbodyIndex = code.indexOf('<tbody className="divide-y divide-white/5">', viewIndex);
    if (tbodyIndex !== -1) {
        let tbodyEndIndex = code.indexOf('</tbody>', tbodyIndex);
        if (tbodyEndIndex !== -1) {
            let replacementTbody = `<tbody className="divide-y divide-white/5">
                  {agreementRequests.map(req => (
                  <tr key={req.id} className="text-slate-300 hover:bg-white/[0.02]">
                    <td className="py-3 px-4 font-bold text-white">
                      {req.payerName}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">{req.phone}</td>
                    <td className="py-3 px-4">
                      {req.method === 'zain_cash' ? (
                      <span className="flex items-center gap-1.5">
                        <span className="w-5 h-5 bg-red-500/20 text-red-400 rounded flex items-center justify-center font-bold text-[10px]">Z</span>
                        زين كاش
                      </span>
                      ) : (
                      <span className="flex items-center gap-1.5">
                        <span className="w-5 h-5 bg-blue-500/20 text-blue-400 rounded flex items-center justify-center font-bold text-[10px]">M</span>
                        ماستر كارد
                      </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-sans text-white">
                      {req.amount}
                    </td>
                    <td className="py-3 px-4 font-sans">
                      {req.date}
                    </td>
                    <td className="py-3 px-4">
                      {req.status === 'pending' && <span className="text-amber-400 bg-amber-500/10 px-2 py-1 rounded">بانتظار المراجعة</span>}
                      {req.status === 'approved' && <span className="text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">معتمدة</span>}
                      {req.status === 'rejected' && <span className="text-red-400 bg-red-500/10 px-2 py-1 rounded">مرفوضة</span>}
                    </td>
                    <td className="py-3 px-4 flex gap-2">
                      <button className="text-blue-400 hover:text-blue-300">
                        عرض الإثبات
                      </button>
                      {req.status === 'pending' && (
                        <>
                          <button onClick={() => handleApproveRequest(req.id)} className="text-emerald-400 hover:text-emerald-300">
                            اعتماد
                          </button>
                          <button onClick={() => handleRejectRequest(req.id)} className="text-red-400 hover:text-red-300">
                            رفض
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                  ))}
                </tbody>`;
            code = code.substring(0, tbodyIndex) + replacementTbody + code.substring(tbodyEndIndex + 8);
        }
    }
}

fs.writeFileSync('src/components/AdminPortal.tsx', code);
