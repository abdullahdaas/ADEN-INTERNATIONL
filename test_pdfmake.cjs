const fs = require('fs');
let code = `
import pdfMake from "pdfmake/build/pdfmake.js";
import pdfFonts from "pdfmake/build/vfs_fonts.js";
pdfMake.vfs = pdfFonts.pdfMake.vfs;
console.log(pdfMake);
`;
fs.writeFileSync('test_pdfmake.js', code);
