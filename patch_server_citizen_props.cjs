const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(/if \(isAdmin\) \{\s*if \(isApproved !== undefined && isApproved !== 'all'\) \{\s*const approvedVal = isApproved === 'true';\s*list = list\.filter\(p => p\.isApproved === approvedVal\);\s*\}\s*\} else \{\s*list = list\.filter\(p => p\.isApproved\);\s*\}/, `if (isAdmin) {
    if (isApproved !== undefined && isApproved !== 'all') {
      const approvedVal = isApproved === 'true';
      list = list.filter(p => p.isApproved === approvedVal);
    }
  } else {
    // Non-admins can see approved properties, OR their own properties (if they are the owner)
    list = list.filter(p => {
      if (p.isApproved) return true;
      if (userId && p.ownerEmailOrPhone && p.ownerEmailOrPhone.toLowerCase() === userId.toLowerCase()) return true;
      if (userId && p.agentId && p.agentId.toLowerCase() === userId.toLowerCase()) return true;
      return false;
    });
  }`);

fs.writeFileSync('server.ts', code);
console.log('Fixed citizen props fetch on server');
