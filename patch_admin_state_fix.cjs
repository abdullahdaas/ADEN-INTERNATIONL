const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPortal.tsx', 'utf8');

const oldState = `const [agreementRequests, setAgreementRequests] = useState([
    {
      id: "req_1",
      payerName: "أحمد محمود",
      phone: "07812345678",
      method: "zain_cash",
      amount: "25,000",
      date: "2024-03-21",
      status: "pending",
    },
    {
      id: "req_2",
      payerName: "سعد عبد الرضا",
      phone: "07709876543",
      method: "qi_card",
      amount: "25,000",
      date: "2024-03-20",
      status: "approved",
    },
  ]);`;

const newState = `const [agreementRequests, setAgreementRequests] = useState<any[]>([]);
  const [serviceProviders, setServiceProviders] = useState<any[]>([]);
  const [providerApplications, setProviderApplications] = useState<any[]>([]);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState<any>(null);
  const [editingProvider, setEditingProvider] = useState<any>(null);
  const [providerForm, setProviderForm] = useState({ name: '', category: '', governorate: '', city: '', address: '', description: '', logo: '', coverImage: '', yearsOfExperience: 0, status: 'معتمد' });`;

code = code.replace(oldState, newState);
fs.writeFileSync('src/components/AdminPortal.tsx', code);
console.log("Patched admin states");
