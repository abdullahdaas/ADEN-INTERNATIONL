const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPortal.tsx', 'utf8');

// Filter properties
code = code.replace(
  /properties\s*\n\s*\.filter\(\(p\)/g,
  "properties.filter(p => !adminSearchQuery || (p.title?.toLowerCase().includes(adminSearchQuery.toLowerCase()) || p.ownerEmailOrPhone?.toLowerCase().includes(adminSearchQuery.toLowerCase()) || p.id?.toLowerCase().includes(adminSearchQuery.toLowerCase()))).filter((p)"
);

// Filter profiles
code = code.replace(
  /profiles\.map\(\(user\)/g,
  "profiles.filter(user => !adminSearchQuery || (user.name?.toLowerCase().includes(adminSearchQuery.toLowerCase()) || user.email?.toLowerCase().includes(adminSearchQuery.toLowerCase()))).map((user)"
);

// Filter serviceProviders
code = code.replace(
  /serviceProviders\.map\(\(prov\)/g,
  "serviceProviders.filter(prov => !adminSearchQuery || (prov.name?.toLowerCase().includes(adminSearchQuery.toLowerCase()) || prov.category?.toLowerCase().includes(adminSearchQuery.toLowerCase()))).map((prov)"
);

// Filter providerApplications
code = code.replace(
  /providerApplications\.map\(\(app\)/g,
  "providerApplications.filter(app => !adminSearchQuery || (app.name?.toLowerCase().includes(adminSearchQuery.toLowerCase()) || app.category?.toLowerCase().includes(adminSearchQuery.toLowerCase()))).map((app)"
);

// Filter agreements (first map for agreements view)
code = code.replace(
  /agreementRequests\.map\(\(agr\)/g,
  "agreementRequests.filter(agr => !adminSearchQuery || (agr.buyerName?.toLowerCase().includes(adminSearchQuery.toLowerCase()) || agr.sellerName?.toLowerCase().includes(adminSearchQuery.toLowerCase()) || agr.serialNumber?.toLowerCase().includes(adminSearchQuery.toLowerCase()))).map((agr)"
);

// Filter payments (payments view)
code = code.replace(
  /payments\.map\(\(pay\)/g,
  "payments.filter(pay => !adminSearchQuery || (pay.senderPhone?.toLowerCase().includes(adminSearchQuery.toLowerCase()) || pay.packageName?.toLowerCase().includes(adminSearchQuery.toLowerCase()))).map((pay)"
);

// Filter agreements (payments view - already replaced above, wait, agreementRequests maps twice?)
// The second one was req, so we need to filter that too.
code = code.replace(
  /agreementRequests\.map\(\(req\)/g,
  "agreementRequests.filter(req => !adminSearchQuery || (req.buyerName?.toLowerCase().includes(adminSearchQuery.toLowerCase()) || req.sellerName?.toLowerCase().includes(adminSearchQuery.toLowerCase()) || req.serialNumber?.toLowerCase().includes(adminSearchQuery.toLowerCase()))).map((req)"
);

fs.writeFileSync('src/components/AdminPortal.tsx', code);
