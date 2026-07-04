const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPortal.tsx', 'utf8');

// We need an Edit state
code = code.replace(
  "const [selectedInspectProperty, setSelectedInspectProperty] = useState<Property | null>(null);",
  "const [selectedInspectProperty, setSelectedInspectProperty] = useState<Property | null>(null);\n  const [isEditingProperty, setIsEditingProperty] = useState(false);\n  const [editPropForm, setEditPropForm] = useState<any>(null);"
);

// We need a handleUpdateProperty helper
code = code.replace(
  /const handleDeleteProperty = async \(id: string\) => \{/g,
  `const handleToggleFeatured = async (p: Property) => {
    try {
      await updateProperty(p.id, { isFeatured: !p.isFeatured });
      loadAdminData();
      onRefreshProperties();
      if (selectedInspectProperty?.id === p.id) {
        setSelectedInspectProperty({ ...p, isFeatured: !p.isFeatured });
      }
    } catch (e) { console.error(e); }
  };
  
  const handleToggleSuspend = async (p: Property) => {
    try {
      const newStatus = p.isSuspended ? false : true;
      await updateProperty(p.id, { isSuspended: newStatus, isApproved: !newStatus });
      loadAdminData();
      onRefreshProperties();
      if (selectedInspectProperty?.id === p.id) {
        setSelectedInspectProperty({ ...p, isSuspended: newStatus, isApproved: !newStatus });
      }
    } catch (e) { console.error(e); }
  };

  const handleSaveEditProperty = async () => {
    try {
      await updateProperty(editPropForm.id, editPropForm);
      loadAdminData();
      onRefreshProperties();
      setSelectedInspectProperty(editPropForm);
      setIsEditingProperty(false);
    } catch (e) { console.error(e); }
  };

  const handleDeleteProperty = async (id: string) => {`
);

fs.writeFileSync('src/components/AdminPortal.tsx', code);
console.log("Patched prop actions");
