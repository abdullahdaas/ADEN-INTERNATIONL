const fs = require('fs');
let code = fs.readFileSync('src/components/HeroSearch.tsx', 'utf-8');

// Stop "For Sale" tab from submitting automatically
code = code.replace(
  "onClick={() => { setStatus('للبيع'); onSearch({ ...initialFilters, status: 'للبيع' }); }}",
  "onClick={() => setStatus('للبيع')}"
);

// Stop "For Rent" tab from submitting automatically
code = code.replace(
  "onClick={() => { setStatus('للإيجار'); onSearch({ ...initialFilters, status: 'للإيجار' }); }}",
  "onClick={() => setStatus('للإيجار')}"
);

fs.writeFileSync('src/components/HeroSearch.tsx', code);
console.log("Patched HeroSearch.tsx");
