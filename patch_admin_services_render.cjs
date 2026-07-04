const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPortal.tsx', 'utf8');

const servicesViewHtml = `
        {/* SERVICES VIEW */}
        {adminView === "services" && (
          <div className="space-y-6 animate-fade-in">
            {/* Providers Management */}
            <div className="rounded-2xl border border-white/5 bg-slate-900/10 backdrop-blur-md p-6 flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold text-white mb-1">
                  إدارة مزودي الخدمات
                </h2>
                <p className="text-xs text-slate-400 font-sans">
                  إدارة المزودين المعتمدين وإضافة مزودين جدد
                </p>
              </div>
              <button onClick={() => { setEditingProvider(null); setProviderForm({ name: '', category: '', governorate: '', city: '', address: '', description: '', logo: '', coverImage: '', yearsOfExperience: 0, status: 'معتمد' }); setShowProviderModal(true); }} className="flex items-center gap-2 bg-[#F27D26] text-[#ffffff] px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#d96a1a]">
                <Plus className="h-4 w-4" /> إضافة مزود
              </button>
            </div>
            
            <div className="overflow-x-auto bg-slate-900/50 rounded-2xl border border-white/5 mb-8">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-950/80">
                  <tr className="border-b border-white/5 text-slate-400">
                    <th className="py-3 px-4 font-normal">اسم مقدم الخدمة</th>
                    <th className="py-3 px-4 font-normal">الفئة</th>
                    <th className="py-3 px-4 font-normal">المحافظة</th>
                    <th className="py-3 px-4 font-normal">سنوات الخبرة</th>
                    <th className="py-3 px-4 font-normal">الحالة</th>
                    <th className="py-3 px-4 font-normal">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {serviceProviders.map(prov => (
                    <tr key={prov.id} className="text-slate-300 hover:bg-white/[0.02]">
                      <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                        {prov.logo && <img src={prov.logo} className="w-6 h-6 rounded-full" alt="logo" />}
                        {prov.name}
                      </td>
                      <td className="py-3 px-4">{prov.category}</td>
                      <td className="py-3 px-4">{prov.governorate}</td>
                      <td className="py-3 px-4 font-mono">{prov.yearsOfExperience}</td>
                      <td className="py-3 px-4">
                        <span className={\`\${prov.status === 'معتمد' || prov.status === 'نشط' ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'} px-2 py-1 rounded\`}>
                          {prov.status || 'معتمد'}
                        </span>
                      </td>
                      <td className="py-3 px-4 flex gap-2">
                        <button onClick={() => { setEditingProvider(prov); setProviderForm(prov); setShowProviderModal(true); }} className="text-blue-400 hover:text-blue-300 flex items-center gap-1">
                          تعديل
                        </button>
                        <button onClick={async () => {
                          const newStatus = (prov.status === 'موقوف' || prov.status === 'suspended') ? 'نشط' : 'موقوف';
                          await updateServiceProvider(prov.id, { status: newStatus });
                          loadAdminData();
                        }} className="text-amber-400 hover:text-amber-300 flex items-center gap-1">
                          {(prov.status === 'موقوف' || prov.status === 'suspended') ? 'تفعيل' : 'إيقاف'}
                        </button>
                        <button onClick={async () => {
                          if (window.confirm('حذف المزود نهائياً؟')) {
                            await deleteServiceProvider(prov.id);
                            loadAdminData();
                          }
                        }} className="text-rose-400 hover:text-rose-300 flex items-center gap-1">
                          حذف
                        </button>
                      </td>
                    </tr>
                  ))}
                  {serviceProviders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-6 text-slate-500">لا يوجد مزودي خدمات</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Provider Applications */}
            <div className="rounded-2xl border border-white/5 bg-slate-900/10 backdrop-blur-md p-6 flex justify-between items-center mt-8">
              <div>
                <h2 className="text-base font-bold text-white mb-1">
                  طلبات الانضمام الجديدة
                </h2>
                <p className="text-xs text-slate-400 font-sans">
                  مراجعة واعتماد طلبات الانضمام كمزود خدمة
                </p>
              </div>
            </div>
            
            <div className="overflow-x-auto bg-slate-900/50 rounded-2xl border border-white/5">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-950/80">
                  <tr className="border-b border-white/5 text-slate-400">
                    <th className="py-3 px-4 font-normal">اسم مقدم الطلب</th>
                    <th className="py-3 px-4 font-normal">رقم الهاتف</th>
                    <th className="py-3 px-4 font-normal">فئة الخدمة</th>
                    <th className="py-3 px-4 font-normal">الحالة</th>
                    <th className="py-3 px-4 font-normal">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {providerApplications.map(app => (
                    <tr key={app.id} className="text-slate-300 hover:bg-white/[0.02]">
                      <td className="py-3 px-4 font-bold text-white">{app.name}</td>
                      <td className="py-3 px-4 font-mono">{app.phone}</td>
                      <td className="py-3 px-4">{app.category}</td>
                      <td className="py-3 px-4">
                        <span className={\`\${app.status === 'pending' ? 'text-amber-400 bg-amber-500/10' : app.status === 'approved' ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'} px-2 py-1 rounded\`}>
                          {app.status === 'pending' ? 'معلق' : app.status === 'approved' ? 'مقبول' : 'مرفوض'}
                        </span>
                      </td>
                      <td className="py-3 px-4 flex gap-2">
                        <button onClick={() => setShowApplicationModal(app)} className="text-blue-400 hover:text-blue-300">
                          معاينة
                        </button>
                      </td>
                    </tr>
                  ))}
                  {providerApplications.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-slate-500">لا توجد طلبات انضمام</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Add / Edit Provider Modal */}
            {showProviderModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                  <div className="p-4 border-b border-white/10 flex justify-between items-center bg-slate-950">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-[#F27D26]" />
                      {editingProvider ? 'تعديل مزود خدمة' : 'إضافة مزود خدمة جديد'}
                    </h3>
                    <button onClick={() => setShowProviderModal(false)} className="p-1 hover:bg-white/10 rounded-lg">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="p-6 overflow-y-auto space-y-4 text-right" dir="rtl">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">اسم المزود / الشركة</label>
                        <input type="text" value={providerForm.name} onChange={e => setProviderForm({...providerForm, name: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-[#F27D26] outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">الفئة</label>
                        <input type="text" value={providerForm.category} onChange={e => setProviderForm({...providerForm, category: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-[#F27D26] outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">المحافظة</label>
                        <input type="text" value={providerForm.governorate} onChange={e => setProviderForm({...providerForm, governorate: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-[#F27D26] outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">سنوات الخبرة</label>
                        <input type="number" value={providerForm.yearsOfExperience} onChange={e => setProviderForm({...providerForm, yearsOfExperience: parseInt(e.target.value) || 0})} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-[#F27D26] outline-none font-mono" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs text-slate-400 mb-1">الوصف</label>
                        <textarea rows={3} value={providerForm.description} onChange={e => setProviderForm({...providerForm, description: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-[#F27D26] outline-none" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs text-slate-400 mb-1">رابط الشعار (Logo URL)</label>
                        <input type="url" value={providerForm.logo} onChange={e => setProviderForm({...providerForm, logo: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-sm text-white font-mono focus:border-[#F27D26] outline-none" dir="ltr" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border-t border-white/10 bg-slate-950 flex gap-3">
                    <button 
                      onClick={async () => {
                        if (editingProvider) {
                          await updateServiceProvider(editingProvider.id, providerForm);
                        } else {
                          await addServiceProvider(providerForm);
                        }
                        setShowProviderModal(false);
                        loadAdminData();
                      }}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-xl font-bold flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" /> حفظ المزود
                    </button>
                    <button 
                      onClick={() => setShowProviderModal(false)}
                      className="flex-1 bg-slate-800 text-slate-300 hover:bg-slate-700 py-2 rounded-xl font-bold flex items-center justify-center gap-2"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Application Details Modal */}
            {showApplicationModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                  <div className="p-4 border-b border-white/10 flex justify-between items-center bg-slate-950">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <FileSignature className="h-5 w-5 text-[#F27D26]" />
                      مراجعة طلب الانضمام
                    </h3>
                    <button onClick={() => setShowApplicationModal(null)} className="p-1 hover:bg-white/10 rounded-lg">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="p-6 overflow-y-auto space-y-4 text-right" dir="rtl">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-950 p-3 rounded-lg border border-white/5">
                        <div className="text-xs text-slate-400">اسم مقدم الطلب</div>
                        <div className="font-bold text-white mt-1">{showApplicationModal.name}</div>
                      </div>
                      <div className="bg-slate-950 p-3 rounded-lg border border-white/5">
                        <div className="text-xs text-slate-400">رقم الهاتف</div>
                        <div className="font-bold font-mono text-white mt-1">{showApplicationModal.phone}</div>
                      </div>
                      <div className="bg-slate-950 p-3 rounded-lg border border-white/5">
                        <div className="text-xs text-slate-400">الفئة المطلوبة</div>
                        <div className="text-white mt-1">{showApplicationModal.category}</div>
                      </div>
                      <div className="bg-slate-950 p-3 rounded-lg border border-white/5">
                        <div className="text-xs text-slate-400">المحافظة</div>
                        <div className="text-white mt-1">{showApplicationModal.governorate}</div>
                      </div>
                      <div className="col-span-2 bg-slate-950 p-3 rounded-lg border border-white/5">
                        <div className="text-xs text-slate-400">تفاصيل إضافية</div>
                        <div className="text-white mt-1">{showApplicationModal.details || 'لا توجد'}</div>
                      </div>
                      {showApplicationModal.documentUrl && (
                        <div className="col-span-2">
                          <a href={showApplicationModal.documentUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline flex items-center gap-2">
                            <Download className="w-4 h-4" /> عرض المستندات المرفقة
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {showApplicationModal.status === 'pending' && (
                    <div className="p-4 border-t border-white/10 bg-slate-950 flex gap-3">
                      <button 
                        onClick={async () => {
                          // Approve: Update app status, create provider
                          await updateProviderApplication(showApplicationModal.id, { status: 'approved' });
                          await addServiceProvider({
                            name: showApplicationModal.name,
                            category: showApplicationModal.category,
                            governorate: showApplicationModal.governorate,
                            city: '',
                            address: '',
                            description: showApplicationModal.details || '',
                            logo: '',
                            coverImage: '',
                            yearsOfExperience: 0,
                            status: 'نشط'
                          });
                          setShowApplicationModal(null);
                          loadAdminData();
                        }}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-xl font-bold flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4" /> قبول وإنشاء حساب
                      </button>
                      <button 
                        onClick={async () => {
                          const reason = window.prompt('سبب الرفض:');
                          if (reason !== null) {
                            await updateProviderApplication(showApplicationModal.id, { status: 'rejected', rejectionReason: reason });
                            setShowApplicationModal(null);
                            loadAdminData();
                          }
                        }}
                        className="flex-1 bg-rose-600/20 text-rose-400 border border-rose-500/20 hover:bg-rose-600 hover:text-white py-2 rounded-xl font-bold flex items-center justify-center gap-2"
                      >
                        <Ban className="w-4 h-4" /> رفض
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
`;

code = code.replace(
  /\{\/\* SERVICES VIEW \*\/\}[\s\S]*?(?=\{\/\* AGREEMENT PAYMENTS VIEW \*\/\}|\{\/\* VIEW 4: PROMOTIONS & PAYMENT RECEIPTS \*\/\}|{adminView === "agreement-payments" && \()/m,
  servicesViewHtml
);

fs.writeFileSync('src/components/AdminPortal.tsx', code);
console.log("Patched services render");
