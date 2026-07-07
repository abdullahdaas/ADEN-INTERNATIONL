import { initializeApp } from 'firebase/app';

import { getFirestore, collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { Property, Agent, CompletedDeal, ContactMessage, PaymentProof, Supervisor, CitizenProfile, ActivityLog, UserNotification, PlatformSettings, OTPLog, ElectronicAgreement } from '../types';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);



export class FirestoreCollection<T extends { id?: string }> {
  constructor(public name: string) {}

  
  async getByField(field: string, value: any): Promise<T[]> {
    const q = query(collection(firestore, this.name), where(field, "==", value));
    const snap = await getDocs(q);
    return snap.docs?.map(d => ({ id: d.id, ...d.data() } as T));
  }

  async getAll(): Promise<T[]> {
    const snap = await getDocs(collection(firestore, this.name));
    return snap.docs?.map(d => ({ id: d.id, ...d.data() } as T));
  }

  async getById(id: string): Promise<T | null> {
    const snap = await getDoc(doc(firestore, this.name, id));
    return snap.exists() ? { id: snap.id, ...snap.data() } as T : null;
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
  reviews: new FirestoreCollection<any>('reviews'),
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
  serviceProviders: new FirestoreCollection<any>('serviceProviders'),
  providerApplications: new FirestoreCollection<any>('providerApplications'),
  // GIS Collections
  gisGovernorates: new FirestoreCollection<any>('gis_governorates'),
  gisDistricts: new FirestoreCollection<any>('gis_districts'),
  gisSubDistricts: new FirestoreCollection<any>('gis_subdistricts'),
  gisCities: new FirestoreCollection<any>('gis_cities'),
  gisNeighborhoods: new FirestoreCollection<any>('gis_neighborhoods'),
  gisVillages: new FirestoreCollection<any>('gis_villages'),
  gisStreets: new FirestoreCollection<any>('gis_streets'),
  gisLandmarks: new FirestoreCollection<any>('gis_landmarks'),
  settings: new SettingsManager()
};
