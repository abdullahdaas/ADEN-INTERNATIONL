const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const replacement = `
// GET all properties
app.get('/api/properties', (req, res) => {
  let list = [...db.properties];
  
  const userId = req.headers['x-user-id'];
  const isAdmin = req.headers['x-admin'] === 'true';

  // Filtering logic
  const { 
    governorate, district, subDistrict, neighborhood, 
    minPrice, maxPrice, minSpace, maxSpace, 
    status, bedrooms, bathrooms, buildingType, 
    isFurnished, hasGarage, hasGarden, hasElevator, 
    hasGenerator, hasSolarPower, hasPool, isApproved,
    searchQuery
  } = req.query;

  if (isAdmin) {
    if (isApproved !== undefined && isApproved !== 'all') {
      const approvedVal = isApproved === 'true';
      list = list.filter(p => p.isApproved === approvedVal);
    }
  } else {
    // Non-admin can only see approved properties, EXCEPT their own
    list = list.filter(p => {
      const isOwner = userId && p.ownerEmailOrPhone && p.ownerEmailOrPhone.toLowerCase() === userId.toLowerCase();
      return (p.isApproved && !p.pendingDeletion) || isOwner;
    });
    
    // If they explicitly requested 'all' (e.g. from their dashboard), they still only see their own unapproved ones (via the above filter).
    // If they explicitly requested true/false:
    if (isApproved !== undefined && isApproved !== 'all') {
      const approvedVal = isApproved === 'true';
      list = list.filter(p => p.isApproved === approvedVal);
    }
  }
`;

code = code.replace(/\/\/ GET all properties\napp\.get\('\/api\/properties', \(req, res\) => \{\n  let list = \[\.\.\.db\.properties\];\n  \n  \/\/ Filtering logic\n  const \{ \n    governorate, district, subDistrict, neighborhood, \n    minPrice, maxPrice, minSpace, maxSpace, \n    status, bedrooms, bathrooms, buildingType, \n    isFurnished, hasGarage, hasGarden, hasElevator, \n    hasGenerator, hasSolarPower, hasPool, isApproved,\n    searchQuery\n  \} = req\.query;\n\n  if \(isApproved !== undefined\) \{\n    if \(isApproved !== 'all'\) \{\n      const approvedVal = isApproved === 'true';\n      list = list\.filter\(p => p\.isApproved === approvedVal\);\n    \}\n    \/\/ If 'all', do not filter by isApproved\n  \} else \{\n    \/\/ Regular users see approved listings only unless they are looking at specific properties\n    list = list\.filter\(p => p\.isApproved && !p\.pendingDeletion\);\n  \}/g, replacement.trim());

fs.writeFileSync('server.ts', code);
