const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPortal.tsx', 'utf8');

// Add selectedAgreementRequest state
code = code.replace(
  "const [selectedPaymentProof, setSelectedPaymentProof] = useState<any>(null);",
  "const [selectedPaymentProof, setSelectedPaymentProof] = useState<any>(null);\n  const [selectedAgreementRequest, setSelectedAgreementRequest] = useState<any>(null);"
);

// We need to fetch agreements when the component mounts
code = code.replace(
  /const allPays = await fetchPayments\(\);/g,
  `const allPays = await fetchPayments();
      const allAgreements = await fetchAgreements();
      setAgreementRequests(allAgreements);`
);

// We need to update the table rendering for agreementRequests
// They have payerName, payerPhone, paymentMethod, paymentAmount, createdAt (for date), status
code = code.replace(
  /\{req\.payerName\}/g,
  "{req.payerName || req.buyerName || 'غير متوفر'}"
);
code = code.replace(
  /\{req\.phone\}/g,
  "{req.payerPhone || req.buyerPhone || 'غير متوفر'}"
);
code = code.replace(
  /\{req\.method === "zain_cash"/g,
  "{req.paymentMethod === 'zain_cash'"
);
code = code.replace(
  /\{req\.amount\}/g,
  "{req.paymentAmount || '25000'}"
);
code = code.replace(
  /\{req\.date\}/g,
  "{req.createdAt ? new Date(req.createdAt).toLocaleDateString('en-GB') : 'غير متوفر'}"
);
code = code.replace(
  /onClick=\{\(\) => setSelectedPaymentProof\(req\)\}/g,
  "onClick={() => setSelectedAgreementRequest(req)}"
);

// Now append the modal to the end of the file
const modalHtml = `
      {/* Agreement Request Details Modal */}
      {selectedAgreementRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-slate-950">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <FileSignature className="h-5 w-5 text-[#F27D26]" />
                تفاصيل طلب المخاطبة (المكاتبة)
              </h3>
              <button onClick={() => setSelectedAgreementRequest(null)} className="p-1 hover:bg-white/10 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6 text-right" dir="rtl">
              {/* Reference and Serial */}
              <div className="flex justify-between items-start bg-slate-950 p-4 rounded-xl border border-white/5">
                <div className="space-y-2">
                  <div className="text-sm"><span className="text-slate-400">الرقم التسلسلي (Serial):</span> <span className="font-mono text-white bg-white/5 px-2 py-1 rounded">{selectedAgreementRequest.serialNumber}</span></div>
                  <div className="text-sm"><span className="text-slate-400">الرقم المرجعي (Reference):</span> <span className="font-mono text-white bg-white/5 px-2 py-1 rounded">{selectedAgreementRequest.referenceNumber || 'لا يوجد'}</span></div>
                  <div className="text-sm"><span className="text-slate-400">تاريخ الطلب:</span> <span className="text-white">{selectedAgreementRequest.createdAt ? new Date(selectedAgreementRequest.createdAt).toLocaleString('en-GB') : 'غير متوفر'}</span></div>
                </div>
                <div className="bg-white p-2 rounded-lg">
                  <img src={\`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=\${selectedAgreementRequest.serialNumber}\`} alt="QR Code" className="w-20 h-20" />
                </div>
              </div>

              {/* Parties */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                  <h4 className="font-bold text-[#F27D26] mb-3 border-b border-white/10 pb-2">معلومات المشتري (مقدم الطلب)</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-slate-400">الاسم:</span> <span className="text-white">{selectedAgreementRequest.buyerName}</span></div>
                    <div><span className="text-slate-400">الهاتف:</span> <span className="text-white font-mono">{selectedAgreementRequest.buyerPhone}</span></div>
                  </div>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                  <h4 className="font-bold text-[#F27D26] mb-3 border-b border-white/10 pb-2">معلومات البائع</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-slate-400">الاسم:</span> <span className="text-white">{selectedAgreementRequest.sellerName}</span></div>
                    <div><span className="text-slate-400">الهاتف:</span> <span className="text-white font-mono">{selectedAgreementRequest.sellerPhone}</span></div>
                  </div>
                </div>
              </div>

              {/* Property Details */}
              <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 space-y-2 text-sm">
                <h4 className="font-bold text-[#F27D26] mb-3 border-b border-white/10 pb-2">تفاصيل العقار والاتفاق</h4>
                <div><span className="text-slate-400">تفاصيل العقار:</span> <span className="text-white">{selectedAgreementRequest.propertyDetails}</span></div>
                <div><span className="text-slate-400">عنوان العقار:</span> <span className="text-white">{selectedAgreementRequest.propertyAddress}</span></div>
                <div><span className="text-slate-400">السعر المتفق عليه:</span> <span className="text-emerald-400 font-bold">{selectedAgreementRequest.agreedPrice} د.ع</span></div>
                <div><span className="text-slate-400">مبلغ العربون:</span> <span className="text-emerald-400 font-bold">{selectedAgreementRequest.depositAmount} د.ع</span></div>
                <div><span className="text-slate-400">الشروط الإضافية:</span> <span className="text-white">{selectedAgreementRequest.conditions || 'لا توجد'}</span></div>
                <div><span className="text-slate-400">مدة الصلاحية:</span> <span className="text-white">{selectedAgreementRequest.validityDays} أيام</span></div>
              </div>

              {/* Payment Details */}
              <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 space-y-2 text-sm">
                <h4 className="font-bold text-[#F27D26] mb-3 border-b border-white/10 pb-2 flex items-center gap-2"><CreditCard className="w-4 h-4" /> معلومات الدفع</h4>
                <div><span className="text-slate-400">طريقة الدفع:</span> <span className="text-white">{selectedAgreementRequest.paymentMethod === 'zain_cash' ? 'زين كاش' : (selectedAgreementRequest.paymentMethod === 'qi_card' ? 'ماستر كارد' : selectedAgreementRequest.paymentMethod)}</span></div>
                <div><span className="text-slate-400">اسم الدافع:</span> <span className="text-white">{selectedAgreementRequest.payerName || selectedAgreementRequest.buyerName}</span></div>
                <div><span className="text-slate-400">هاتف الدافع:</span> <span className="text-white font-mono">{selectedAgreementRequest.payerPhone || selectedAgreementRequest.buyerPhone}</span></div>
                <div><span className="text-slate-400">المبلغ المدفوع:</span> <span className="text-emerald-400 font-bold">{selectedAgreementRequest.paymentAmount || '25000'} د.ع</span></div>
                {selectedAgreementRequest.paymentProofUrl && (
                  <div className="mt-4">
                    <span className="text-slate-400 block mb-2">المرفقات (إثبات الدفع):</span>
                    <a href={selectedAgreementRequest.paymentProofUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">عرض المرفق</a>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-white/10 bg-slate-950 flex gap-3">
              <button 
                onClick={async () => {
                  await updateAgreementStatus(selectedAgreementRequest.id, 'active');
                  setSelectedAgreementRequest(null);
                  const allAgreements = await fetchAgreements();
                  setAgreementRequests(allAgreements);
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-xl font-bold flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" /> اعتماد المكاتبة
              </button>
              <button 
                onClick={async () => {
                  await updateAgreementStatus(selectedAgreementRequest.id, 'rejected');
                  setSelectedAgreementRequest(null);
                  const allAgreements = await fetchAgreements();
                  setAgreementRequests(allAgreements);
                }}
                className="flex-1 bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white border border-rose-500/20 py-2 rounded-xl font-bold flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" /> رفض الطلب
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`;

code = code.replace(/    <\/div>\n  \);\n\}\n?$/, modalHtml);

fs.writeFileSync('src/components/AdminPortal.tsx', code);
console.log("Patched AdminPortal agreements");
