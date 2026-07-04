const fs = require('fs');
let code = fs.readFileSync('src/components/ServiceProvidersList.tsx', 'utf8');

// Imports
code = code.replace(
  "import { ServiceProvider } from \"../types\";",
  "import { ServiceProvider } from \"../types\";\nimport { submitProviderApplication } from \"../utils/api\";"
);
code = code.replace(
  "  ShieldCheck,\n} from \"lucide-react\";",
  "  ShieldCheck,\n  Plus,\n  X,\n} from \"lucide-react\";"
);

// States
code = code.replace(
  "const [searchTerm, setSearchTerm] = useState(\"\");",
  `const [searchTerm, setSearchTerm] = useState("");
  const [showAppModal, setShowAppModal] = useState(false);
  const [appForm, setAppForm] = useState({ name: '', phone: '', category: '', governorate: '', details: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);`
);

fs.writeFileSync('src/components/ServiceProvidersList.tsx', code);
console.log("Patched states");
