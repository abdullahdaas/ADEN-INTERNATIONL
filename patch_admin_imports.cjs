const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPortal.tsx', 'utf8');

code = code.replace(
  "fetchPayments,\n  updatePaymentStatus,",
  "fetchPayments,\n  updatePaymentStatus,\n  fetchAgreements,\n  updateAgreementStatus,"
);

fs.writeFileSync('src/components/AdminPortal.tsx', code);
console.log("Patched imports");
