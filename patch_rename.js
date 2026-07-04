const fs = require('fs');

// 1. Header.tsx
let header = fs.readFileSync('src/components/Header.tsx', 'utf8');
header = header.replace(
  "label: lang === 'ar' ? 'الخدمات العقارية' : lang === 'en' ? 'Services' : 'خزمەتگوزارییەکان', icon: Briefcase",
  "label: lang === 'ar' ? 'مزودي الخدمات' : lang === 'en' ? 'Service Providers' : 'پێشکەشکارانی خزمەتگوزاری', icon: Briefcase"
);
fs.writeFileSync('src/components/Header.tsx', header);

// 2. ServiceProvidersList.tsx
let spList = fs.readFileSync('src/components/ServiceProvidersList.tsx', 'utf8');
spList = spList.replace(
  "الخدمات العقارية",
  "مزودي الخدمات"
);
spList = spList.replace(
  "دليل شامل لجميع الخدمات العقارية في العراق. ابحث عن مقاولين،",
  "دليل شامل لجميع مزودي الخدمات في العراق. ابحث عن مقاولين،"
);
fs.writeFileSync('src/components/ServiceProvidersList.tsx', spList);

// 3. AdminPortal.tsx
let admin = fs.readFileSync('src/components/AdminPortal.tsx', 'utf8');
admin = admin.replace(
  /<span>الخدمات العقارية<\/span>/g,
  "<span>مزودي الخدمات</span>"
);
admin = admin.replace(
  /إدارة الخدمات العقارية/g,
  "إدارة مزودي الخدمات"
);
fs.writeFileSync('src/components/AdminPortal.tsx', admin);

console.log("Renamed Real Estate Services to Service Providers");
