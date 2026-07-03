const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPortal.tsx', 'utf-8');

// Find where to add mock state
const statePattern = /const \[adminView, setAdminView\] = useState[\s\S]*?\("dashboard"\);/;
if (code.match(statePattern)) {
    code = code.replace(statePattern, `$&
  const [agreementRequests, setAgreementRequests] = useState([
    {
      id: 'req_1',
      payerName: 'أحمد محمود',
      phone: '07812345678',
      method: 'zain_cash',
      amount: '25,000',
      date: new Date().toLocaleDateString("en-GB"),
      status: 'pending'
    },
    {
      id: 'req_2',
      payerName: 'علي حسين',
      phone: '07712345678',
      method: 'qi_card',
      amount: '25,000',
      date: '12/03/2024',
      status: 'approved'
    }
  ]);
  
  const handleApproveRequest = (id) => {
    setAgreementRequests(prev => prev.map(r => r.id === id ? {...r, status: 'approved'} : r));
    alert("تم اعتماد الدفع وإصدار المكاتبة بنجاح");
  };
  
  const handleRejectRequest = (id) => {
    setAgreementRequests(prev => prev.map(r => r.id === id ? {...r, status: 'rejected'} : r));
    alert("تم رفض طلب الدفع");
  };
`);
}

// Find table body for agreement payments
const tableBodyPattern = /<tbody className="divide-y divide-white\/5">[\s\S]*?<\/tbody>/;
const parts = code.split("<!-- AGREEMENT PAYMENTS VIEW -->");
// Wait, the HTML comment is {/* AGREEMENT PAYMENTS VIEW */}
// We can just replace the tbody inside the agreement-payments view.
// It's easier to do this via string manipulation using the exact snippet.
fs.writeFileSync('patch_admin.js_done', 'true');
