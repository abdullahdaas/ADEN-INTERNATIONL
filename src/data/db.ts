import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';
import { Property, Agent, CompletedDeal, ContactMessage, PaymentProof, Supervisor, CitizenProfile, ActivityLog, UserNotification, PlatformSettings, OTPLog, ElectronicAgreement } from '../types';

const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
let firebaseConfig: any = {};
try {
  firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
} catch (e) {
  console.error("Could not load firebase-applet-config.json");
}

const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export class FirestoreCollection<T extends { id?: string }> {
  constructor(public name: string) {}

  async getAll(): Promise<T[]> {
    const snap = await getDocs(collection(firestore, this.name));
    return snap.docs?.map(d => d.data() as T);
  }

  async getById(id: string): Promise<T | null> {
    const snap = await getDoc(doc(firestore, this.name, id));
    return snap.exists() ? snap.data() as T : null;
  }

  async add(item: T): Promise<void> {
    const id = item.id || Date.now().toString();
    await setDoc(doc(firestore, this.name, id), item);
  }

  async update(id: string, updates: Partial<T>): Promise<void> {
    await updateDoc(doc(firestore, this.name, id), updates as any);
  }

  async remove(id: string): Promise<void> {
    await deleteDoc(doc(firestore, this.name, id));
  }
}

class SettingsManager {
  async get(): Promise<PlatformSettings> {
    const snap = await getDoc(doc(firestore, 'system', 'settings'));
    if (snap.exists()) {
      return snap.data() as PlatformSettings;
    }
    const defaultSettings: PlatformSettings = {
      mastercard: '910190714683',
      zainCash: '07810060292',
      isOtpEnabled: true,
      smsProvider: 'mock'
    };
    await setDoc(doc(firestore, 'system', 'settings'), defaultSettings);
    return defaultSettings;
  }

  async update(updates: Partial<PlatformSettings>): Promise<void> {
    const current = await this.get();
    await setDoc(doc(firestore, 'system', 'settings'), { ...current, ...updates });
  }
}

export const db = {
  properties: new FirestoreCollection<Property>('properties'),
  agents: new FirestoreCollection<Agent>('agents'),
  deals: new FirestoreCollection<CompletedDeal>('deals'),
  messages: new FirestoreCollection<ContactMessage>('messages'),
  payments: new FirestoreCollection<PaymentProof>('payments'),
  supervisors: new FirestoreCollection<Supervisor>('supervisors'),
  profiles: new FirestoreCollection<CitizenProfile>('profiles'),
  activityLogs: new FirestoreCollection<ActivityLog>('activityLogs'),
  notifications: new FirestoreCollection<UserNotification>('notifications'),
  otpLogs: new FirestoreCollection<OTPLog>('otpLogs'),
  visits: new FirestoreCollection<any>('visits'),
  auctionParticipants: new FirestoreCollection<any>('auctionParticipants'),
  bids: new FirestoreCollection<any>('bids'),
  offers: new FirestoreCollection<any>('offers'),
  complaints: new FirestoreCollection<any>('complaints'),
  agreements: new FirestoreCollection<ElectronicAgreement>('agreements'),
  settings: new SettingsManager()
};
