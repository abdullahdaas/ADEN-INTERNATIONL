const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const oldPaymentLogic = `    if (status === 'approved') {
      const prop = await db.properties.getById(propertyId);
      if (prop) {
        await db.properties.update(prop.id!, {
          isFeatured: true,
          status: 'مميز',
          featuredPackage: packageName,
          isApproved: true
        });
      }
    }`;

const newPaymentLogic = `    if (status === 'approved') {
      if (packageName === 'auction_entry') {
        const participant = {
          id: 'part-' + Date.now(),
          propertyId: propertyId,
          userId: payment.senderPhone, // or some identifier from payment
          paidAmount: payment.amount,
          paymentMethod: payment.paymentMethod,
          status: 'approved',
          createdAt: new Date().toISOString()
        };
        await db.auctionParticipants.add(participant);
      } else {
        const prop = await db.properties.getById(propertyId);
        if (prop) {
          await db.properties.update(prop.id!, {
            isFeatured: true,
            status: 'مميز',
            featuredPackage: packageName,
            isApproved: true
          });
        }
      }
    }`;

code = code.replace(oldPaymentLogic, newPaymentLogic);
fs.writeFileSync('server.ts', code);
console.log('Patched payments in server.ts');
