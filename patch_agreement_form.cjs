const fs = require('fs');
let code = fs.readFileSync('src/components/ElectronicAgreementForm.tsx', 'utf8');

code = code.replace(
  "initiatorId: user?.id || 'anonymous',",
  `initiatorId: user?.id || 'anonymous',
        paymentMethod: paymentMethod,
        payerName: paymentData.payerName,
        payerPhone: paymentData.payerPhone,
        paymentAmount: paymentData.amount,
        paymentProofUrl: paymentData.proofFile ? URL.createObjectURL(paymentData.proofFile) : '', // mockup url
        referenceNumber: 'REF-' + Math.floor(100000 + Math.random() * 900000),`
);

fs.writeFileSync('src/components/ElectronicAgreementForm.tsx', code);
console.log("Patched ElectronicAgreementForm");
