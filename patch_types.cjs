const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

code = code.replace(
  "cancellationReason?: string;",
  "cancellationReason?: string;\n  paymentMethod?: string;\n  payerName?: string;\n  payerPhone?: string;\n  paymentAmount?: string;\n  paymentProofUrl?: string;\n  qrCodeUrl?: string;\n  referenceNumber?: string;"
);

fs.writeFileSync('src/types.ts', code);
console.log("Patched types.ts");
