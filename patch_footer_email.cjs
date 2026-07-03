const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const footerSearch = `          <p className=\"font-sans\">
            &copy; 2026 {t.logoTitle}.{\" \"}
            {lang === \"ar\"
              ? \"جميع الحقوق محفوظة. إدارة وتوجيه المطور \"
              : lang === \"ku\"
                ? \"هەموو مافەکان پارێزراون. بەڕێوەبردن و ئاراستەکردنی گەشەپێدەر \"
                : \"All Rights Reserved. Supervised by\"}{\" \"}
            <span className=\"text-[#F27D26] font-bold\">عبدالله الدعاس</span>
          </p>`;

const footerReplace = `          <div className=\"flex flex-col sm:items-end gap-1\">
            <a href=\"mailto:adenofice@gmail.com\" className=\"text-[#F27D26] hover:text-[#d96a1a] transition-colors flex items-center justify-center sm:justify-end gap-2 mb-2\">
              <Mail className=\"h-4 w-4\" />
              <span className=\"font-sans font-medium\">adenofice@gmail.com</span>
            </a>
            <p className=\"font-sans\">
              &copy; 2026 {t.logoTitle}.{\" \"}
              {lang === \"ar\"
                ? \"جميع الحقوق محفوظة. إدارة وتوجيه المطور \"
                : lang === \"ku\"
                  ? \"هەموو مافەکان پارێزراون. بەڕێوەبردن و ئاراستەکردنی گەشەپێدەر \"
                  : \"All Rights Reserved. Supervised by\"}{\" \"}
              <span className=\"text-[#F27D26] font-bold\">عبدالله الدعاس</span>
            </p>
          </div>`;

if(code.includes(footerSearch)) {
    code = code.replace(footerSearch, footerReplace);
}

// Make sure Mail icon is imported
if(!code.includes('import { Mail')) {
    code = code.replace('import {', 'import { Mail,');
}

fs.writeFileSync('src/App.tsx', code);
