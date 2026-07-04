const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPortal.tsx', 'utf8');

const editForm = `
              {isEditingProperty ? (
                <div className="space-y-4 text-right" dir="rtl">
                  <div>
                    <label className="text-xs text-slate-400">عنوان العقار</label>
                    <input type="text" value={editPropForm.title} onChange={e => setEditPropForm({...editPropForm, title: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded p-2 text-white" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">الوصف</label>
                    <textarea value={editPropForm.description} onChange={e => setEditPropForm({...editPropForm, description: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded p-2 text-white" rows={3} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-400">السعر</label>
                      <input type="number" value={editPropForm.price} onChange={e => setEditPropForm({...editPropForm, price: parseFloat(e.target.value)})} className="w-full bg-slate-900 border border-white/10 rounded p-2 text-white" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400">المساحة</label>
                      <input type="number" value={editPropForm.space} onChange={e => setEditPropForm({...editPropForm, space: parseFloat(e.target.value)})} className="w-full bg-slate-900 border border-white/10 rounded p-2 text-white" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-right" dir="rtl">
                  <h3 className="text-xl font-bold text-white mb-2">{selectedInspectProperty.title}</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">{selectedInspectProperty.description}</p>
                </div>
              )}
`;

code = code.replace(
  /<div className="text-right" dir="rtl">\s*<h3 className="text-xl font-bold text-white mb-2">\{selectedInspectProperty\.title\}<\/h3>\s*<p className="text-sm text-slate-300 leading-relaxed">\{selectedInspectProperty\.description\}<\/p>\s*<\/div>/m,
  editForm
);

fs.writeFileSync('src/components/AdminPortal.tsx', code);
console.log("Patched prop edit mode");
