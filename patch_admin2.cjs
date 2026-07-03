const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPortal.tsx', 'utf-8');

// Find where to add mock state
const statePattern = /const \[agreementRequests, setAgreementRequests\] = useState\(\[/;
if (code.match(statePattern)) {
    code = code.replace(statePattern, `const [selectedPaymentProof, setSelectedPaymentProof] = useState<any>(null);\n  $&`);
}

// Find button
const buttonPattern = /<button className="text-blue-400 hover:text-blue-300">\s*عرض الإثبات\s*<\/button>/g;
code = code.replace(buttonPattern, `<button onClick={() => setSelectedPaymentProof(req)} className="text-blue-400 hover:text-blue-300">عرض الإثبات</button>`);

// Add modal
const modalHTML = `
      {/* PAYMENT PROOF MODAL */}
      {selectedPaymentProof && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-[#050505]/90 backdrop-blur-sm"
            onClick={() => setSelectedPaymentProof(null)}
          ></div>
          <div className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-full">
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-slate-900/50 sticky top-0 z-10">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Banknote className="h-5 w-5 text-[#F27D26]" /> إثبات الدفع
              </h2>
              <button
                onClick={() => setSelectedPaymentProof(null)}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="bg-slate-950 p-4 rounded-xl border border-white/5 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="block text-slate-500 mb-1">اسم الدافع</span>
                  <span className="font-bold text-white">{selectedPaymentProof.payerName}</span>
                </div>
                <div>
                  <span className="block text-slate-500 mb-1">رقم الهاتف</span>
                  <span className="font-bold text-white font-mono">{selectedPaymentProof.phone}</span>
                </div>
                <div>
                  <span className="block text-slate-500 mb-1">المبلغ</span>
                  <span className="font-bold text-white font-sans">{selectedPaymentProof.amount} د.ع</span>
                </div>
                <div>
                  <span className="block text-slate-500 mb-1">التاريخ</span>
                  <span className="font-bold text-white font-sans">{selectedPaymentProof.date}</span>
                </div>
                <div className="col-span-2">
                  <span className="block text-slate-500 mb-1">وسيلة الدفع</span>
                  <span className="font-bold text-white">
                    {selectedPaymentProof.method === 'zain_cash' ? 'زين كاش' : 'ماستر كارد'}
                  </span>
                </div>
              </div>
              
              <div>
                <span className="block text-slate-500 mb-3 text-sm">صورة الإثبات (مرفق)</span>
                <div className="w-full aspect-[3/4] bg-slate-950 rounded-xl border border-white/5 flex items-center justify-center flex-col gap-3">
                    <FileSignature className="h-12 w-12 text-slate-600" />
                    <span className="text-slate-400 text-sm">صورة الإثبات المرفقة تظهر هنا</span>
                    <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm mt-2 transition-colors flex items-center gap-2">
                       <Download className="h-4 w-4" /> تحميل المرفق
                    </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
`;

const endOfFilePattern = /<\/div>\s*<\/div>\s*\);\s*}\s*$/;
code = code.replace(endOfFilePattern, modalHTML + '$&');

fs.writeFileSync('src/components/AdminPortal.tsx', code);
