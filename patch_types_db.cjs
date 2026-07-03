const fs = require('fs');
let typesCode = fs.readFileSync('src/types.ts', 'utf-8');

// Add to Property
typesCode = typesCode.replace(
  'isApproved: boolean;',
  'isApproved: boolean;\n  isVerified?: boolean;\n  phoneViews?: number;'
);

// Add to User
typesCode = typesCode.replace(
  "role: 'admin' | 'citizen';",
  "role: 'admin' | 'citizen' | 'agency';\n  agencyInfo?: {\n    logo?: string;\n    description?: string;\n    yearsOfExperience?: number;\n    tier?: 'free' | 'pro' | 'premium';\n  };"
);

// Add PurchaseOffer and Complaint types
typesCode += `

export interface PurchaseOffer {
  id: string;
  propertyId: string;
  propertyTitle: string;
  buyerId: string;
  buyerName: string;
  ownerId: string;
  amount: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'counter';
  counterAmount?: number;
  createdAt: string;
}

export interface Complaint {
  id: string;
  reporterId: string;
  reporterName: string;
  targetId?: string; // Property ID or User ID
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'closed';
  resolution?: string;
  createdAt: string;
}
`;

fs.writeFileSync('src/types.ts', typesCode);

let dbCode = fs.readFileSync('src/data/db.ts', 'utf-8');
dbCode = dbCode.replace(
  'bids: new FirestoreCollection<any>(\'bids\'),',
  'bids: new FirestoreCollection<any>(\'bids\'),\n  offers: new FirestoreCollection<any>(\'offers\'),\n  complaints: new FirestoreCollection<any>(\'complaints\'),'
);
fs.writeFileSync('src/data/db.ts', dbCode);
console.log('Patched types and db');
