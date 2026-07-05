import { doc, runTransaction } from 'firebase/firestore';
import { firestore } from '../data/db';

export async function getNextCorrespondenceNumber(): Promise<string> {
  const counterRef = doc(firestore, 'counters', 'correspondence');
  const year = new Date().getFullYear();
  
  return await runTransaction(firestore, async (transaction) => {
    const counterDoc = await transaction.get(counterRef);
    let newSequence = 1;
    let currentYear = year;
    
    if (counterDoc.exists()) {
      const data = counterDoc.data();
      if (data.year === year) {
        newSequence = (data.sequence || 0) + 1;
      } else {
        newSequence = 1; // reset for new year
      }
    }
    
    transaction.set(counterRef, {
      year: year,
      sequence: newSequence
    });
    
    // Format: ADN-2026-000001
    const paddedSequence = newSequence.toString().padStart(6, '0');
    return `ADN-${year}-${paddedSequence}`;
  });
}
