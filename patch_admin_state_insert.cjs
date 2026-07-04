const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPortal.tsx', 'utf8');

const insertStates = `  const [serviceProviders, setServiceProviders] = useState<any[]>([]);
  const [providerApplications, setProviderApplications] = useState<any[]>([]);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState<any>(null);
  const [editingProvider, setEditingProvider] = useState<any>(null);
  const [providerForm, setProviderForm] = useState({ name: '', category: '', governorate: '', city: '', address: '', description: '', logo: '', coverImage: '', yearsOfExperience: 0, status: 'معتمد' });
  const [isEditingProperty, setIsEditingProperty] = useState(false);
  const [editPropForm, setEditPropForm] = useState<any>(null);`;

code = code.replace(
  "const [selectedAgreementRequest, setSelectedAgreementRequest] = useState<any>(null);",
  "const [selectedAgreementRequest, setSelectedAgreementRequest] = useState<any>(null);\n" + insertStates
);

fs.writeFileSync('src/components/AdminPortal.tsx', code);
console.log("Patched states forcefully");
