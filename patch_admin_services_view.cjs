const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPortal.tsx', 'utf8');

// We need state for service providers and applications
code = code.replace(
  "const [agreementRequests, setAgreementRequests] = useState<any[]>([]);",
  `const [agreementRequests, setAgreementRequests] = useState<any[]>([]);
  const [serviceProviders, setServiceProviders] = useState<any[]>([]);
  const [providerApplications, setProviderApplications] = useState<any[]>([]);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState<any>(null);
  const [editingProvider, setEditingProvider] = useState<any>(null);
  const [providerForm, setProviderForm] = useState({ name: '', category: '', governorate: '', city: '', address: '', description: '', logo: '', coverImage: '', yearsOfExperience: 0, status: 'معتمد' });`
);

// We need to fetch them inside loadAdminData
code = code.replace(
  /const allAgreements = await fetchAgreements\(\);\n\s*setAgreementRequests\(allAgreements\);/,
  `const allAgreements = await fetchAgreements();
      setAgreementRequests(allAgreements);
      
      const [provs, apps] = await Promise.all([
        fetchServiceProviders(),
        fetchProviderApplications()
      ]);
      setServiceProviders(provs);
      setProviderApplications(apps);`
);

// Add API imports
code = code.replace(
  "fetchAgreements,\n  updateAgreementStatus,",
  "fetchAgreements,\n  updateAgreementStatus,\n  fetchServiceProviders, addServiceProvider, updateServiceProvider, deleteServiceProvider, fetchProviderApplications, updateProviderApplication,"
);

fs.writeFileSync('src/components/AdminPortal.tsx', code);
console.log("Patched admin services state");
