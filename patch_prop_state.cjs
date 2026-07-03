const fs = require('fs');
let code = fs.readFileSync('src/components/PropertyDetails.tsx', 'utf-8');

const stateBlock = `
  // Visit Request State
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('');

  // Offer State
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerMessage, setOfferMessage] = useState('');

  // Complaint State
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [complaintSubject, setComplaintSubject] = useState('');
  const [complaintDesc, setComplaintDesc] = useState('');

  const [showPhone, setShowPhone] = useState(false);

  const handleBookVisit = async () => {`;
  
code = code.replace(/const \[showVisitModal, setShowVisitModal\] = useState\(false\);[\s\S]*?const handleBookVisit = async \(\) => \{/, stateBlock);

const modalsBlock = `          {/* Offer Modal */}
          {showOfferModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-slate-900 border border-gold-prestige/30 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
                <h3 className="text-gold-prestige font-bold text-lg border-b border-white/5 pb-2">تقديم عرض شراء</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">المبلغ المقترح (د.ع)</label>
                    <input
                      type="number"
                      value={offerAmount}
                      onChange={e => setOfferAmount(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-gold-prestige/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">رسالة (اختياري)</label>
                    <textarea
                      value={offerMessage}
                      onChange={e => setOfferMessage(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-gold-prestige/50 h-24"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <button onClick={async () => {
                    if (!offerAmount) return;
                    try {
                      await fetch('/api/offers', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'x-user-id': user.emailOrPhone },
                        body: JSON.stringify({
                          propertyId: property.id,
                          propertyTitle: property.title,
                          buyerId: user.emailOrPhone,
                          buyerName: user.name,
                          ownerId: property.ownerEmailOrPhone || property.agentId,
                          amount: Number(offerAmount),
                          message: offerMessage
                        })
                      });
                      window.alert('تم إرسال العرض بنجاح!');
                      setShowOfferModal(false);
                    } catch(e) {}
                  }} className="flex-1 bg-gold-prestige hover:bg-[#d66b1d] text-slate-900 py-2 rounded-lg text-xs font-bold transition-all">
                    تأكيد العرض
                  </button>
                  <button onClick={() => setShowOfferModal(false)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-all">
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Complaint Modal */}
          {showComplaintModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-slate-900 border border-red-500/30 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
                <h3 className="text-red-400 font-bold text-lg border-b border-white/5 pb-2 flex items-center gap-2"><ShieldAlert className="w-5 h-5"/> الإبلاغ عن مشكلة</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">الموضوع</label>
                    <input
                      type="text"
                      value={complaintSubject}
                      onChange={e => setComplaintSubject(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-red-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">الوصف والتفاصيل</label>
                    <textarea
                      value={complaintDesc}
                      onChange={e => setComplaintDesc(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-red-500/50 h-24"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <button onClick={async () => {
                    if (!complaintSubject || !complaintDesc) return;
                    try {
                      await fetch('/api/complaints', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'x-user-id': user?.emailOrPhone || 'guest' },
                        body: JSON.stringify({
                          reporterId: user?.emailOrPhone || 'guest',
                          reporterName: user?.name || 'Guest',
                          targetId: property.id,
                          subject: complaintSubject,
                          description: complaintDesc
                        })
                      });
                      window.alert('تم إرسال البلاغ إلى الإدارة.');
                      setShowComplaintModal(false);
                    } catch(e) {}
                  }} className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 rounded-lg text-xs font-bold transition-all">
                    إرسال البلاغ
                  </button>
                  <button onClick={() => setShowComplaintModal(false)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-all">
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Direct Advertiser Contact Info Card */}`;

code = code.replace('{/* Direct Advertiser Contact Info Card */}', modalsBlock);

const complaintButtonBlock = `              <button
                onClick={() => setShowComplaintModal(true)}
                className="w-full flex items-center justify-center space-x-2 space-x-reverse rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 py-3 text-xs font-semibold text-red-400 transition-all mt-2"
              >
                <ShieldAlert className="h-4 w-4" />
                <span>الإبلاغ عن العقار</span>
              </button>
            </div>
          </div>

          {/* Visit Booking Modal */}`;
          
code = code.replace(/<\/div>\s*<\/div>\s*\{\/\* Visit Booking Modal \*\/\}/, complaintButtonBlock);

fs.writeFileSync('src/components/PropertyDetails.tsx', code);
console.log('Patched Modals and state in PropertyDetails');
