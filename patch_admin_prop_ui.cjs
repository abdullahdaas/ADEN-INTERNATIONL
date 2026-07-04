const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPortal.tsx', 'utf8');

const actionsUI = `              {/* Approve & Delete inside details */}
              <div className="border-t border-white/5 pt-5 flex flex-wrap justify-end gap-3">
                <button
                  onClick={() => {
                    if (isEditingProperty) {
                      handleSaveEditProperty();
                    } else {
                      setEditPropForm(selectedInspectProperty);
                      setIsEditingProperty(true);
                    }
                  }}
                  className="rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white px-5 py-3 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{isEditingProperty ? 'حفظ التعديلات' : 'تعديل التفاصيل'}</span>
                </button>
                <button
                  onClick={() => handleToggleFeatured(selectedInspectProperty)}
                  className={\`rounded-xl px-5 py-3 text-xs font-bold flex items-center gap-1.5 cursor-pointer \${selectedInspectProperty.isFeatured ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-300'}\`}
                >
                  <Star className="h-4 w-4" />
                  <span>{selectedInspectProperty.isFeatured ? 'إلغاء التمييز' : 'تمييز العقار'}</span>
                </button>
                <button
                  onClick={() => handleToggleSuspend(selectedInspectProperty)}
                  className={\`rounded-xl px-5 py-3 text-xs font-bold flex items-center gap-1.5 cursor-pointer \${selectedInspectProperty.isSuspended ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'bg-orange-500/20 text-orange-400'}\`}
                >
                  <Ban className="h-4 w-4" />
                  <span>{selectedInspectProperty.isSuspended ? 'إعادة التفعيل' : 'تعليق / إخفاء'}</span>
                </button>
                {!selectedInspectProperty.isApproved && !selectedInspectProperty.isSuspended && (
                  <button
                    onClick={() => {
                      handleApproveProperty(selectedInspectProperty.id);
                      setSelectedInspectProperty({ ...selectedInspectProperty, isApproved: true });
                    }}
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-3 text-xs font-bold text-[#ffffff] flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="h-4 w-4" />
                    <span>موافقة ونشر</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    handleDeleteProperty(selectedInspectProperty.id);
                    setSelectedInspectProperty(null);
                  }}
                  className="rounded-xl bg-rose-600/10 border border-rose-500/20 hover:bg-rose-600 text-rose-400 hover:text-white px-5 py-3 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>حذف نهائي</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedInspectProperty(null); setIsEditingProperty(false); }}
                  className="rounded-xl border border-white/5 bg-white/5 px-5 py-3 text-xs font-bold text-slate-300 hover:bg-white/10 transition-all"
                >
                  إغلاق
                </button>
              </div>`;

code = code.replace(
  /\{\/\* Approve & Delete inside details \*\/\}[\s\S]*?إغلاق نافذة المعاينة\n\s*<\/button>\n\s*<\/div>/m,
  actionsUI
);

fs.writeFileSync('src/components/AdminPortal.tsx', code);
console.log("Patched prop actions UI");
