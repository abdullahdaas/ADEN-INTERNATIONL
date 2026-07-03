const fs = require('fs');
let code = fs.readFileSync('src/data/db.ts', 'utf8');

if (!code.includes('query, where')) {
    code = code.replace("collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc", "collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, query, where");
}

const getByFieldMethod = `
  async getByField(field: string, value: any): Promise<T[]> {
    const q = query(collection(firestore, this.name), where(field, "==", value));
    const snap = await getDocs(q);
    return snap.docs?.map(d => ({ id: d.id, ...d.data() } as T));
  }
`;

if (!code.includes('getByField(')) {
    code = code.replace("async getAll(): Promise<T[]> {", getByFieldMethod + "\n  async getAll(): Promise<T[]> {");
}

fs.writeFileSync('src/data/db.ts', code);
console.log("Updated db.ts");
