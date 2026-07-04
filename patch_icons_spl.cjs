const fs = require('fs');
let code = fs.readFileSync('src/components/ServiceProvidersList.tsx', 'utf8');

code = code.replace(
  "import { Search, Filter, MapPin, Star, ShieldCheck, ArrowRight } from 'lucide-react';",
  "import { Search, Filter, MapPin, Star, ShieldCheck, ArrowRight, X, Plus } from 'lucide-react';"
);

fs.writeFileSync('src/components/ServiceProvidersList.tsx', code);
