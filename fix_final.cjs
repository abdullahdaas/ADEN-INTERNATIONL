const fs = require('fs');

// App.tsx
let app = fs.readFileSync('src/App.tsx', 'utf-8');
app = app.replace('        documents: newDocuments,\n        documents: newDocuments,\n        coordinates: newCoordinates', '        documents: newDocuments,\n        coordinates: newCoordinates');
fs.writeFileSync('src/App.tsx', app);

// AdminPortal.tsx
let admin = fs.readFileSync('src/components/AdminPortal.tsx', 'utf-8');
admin = admin.replace('import {\n  BarChart,\n  Users,\n  ShieldAlert,\n  Building,\n  CheckCircle,\n  XCircle,\n  Search,\n  LogOut,\n  MapPin,\n  Star,\n  Clock,\n  Eye,\n  ShieldAlert,\n  AlertTriangle,\n  MessageSquare,\n  Banknote, BadgeCheck\n} from \'lucide-react\';', 'import {\n  BarChart,\n  Users,\n  Building,\n  CheckCircle,\n  XCircle,\n  Search,\n  LogOut,\n  MapPin,\n  Star,\n  Clock,\n  Eye,\n  ShieldAlert,\n  AlertTriangle,\n  MessageSquare,\n  Banknote, BadgeCheck\n} from \'lucide-react\';');
admin = admin.replace('                                  loadData();', '                                  loadAdminData();');
fs.writeFileSync('src/components/AdminPortal.tsx', admin);

// PropertyDetails.tsx
let propDet = fs.readFileSync('src/components/PropertyDetails.tsx', 'utf-8');
if (!propDet.includes('Banknote')) {
  propDet = propDet.replace("import { MapPin, Phone", "import { MapPin, Banknote, Phone");
}
fs.writeFileSync('src/components/PropertyDetails.tsx', propDet);

console.log('Fixed final');
