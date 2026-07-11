import bcrypt from 'bcryptjs';
import express from 'express';
import path from 'path';
import fs from 'fs';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_for_dev_only';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'abdullah';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '3008';

// Removed top level vite import
import { db, firestore } from './src/data/db';
import { deleteFileFromSupabase } from './src/data/supabaseStorage';
import { uploadFileToSpaces, deleteFileFromSpaces } from './src/data/spacesStorage';

import { Property, Agent, CompletedDeal, ContactMessage, PaymentProof, Supervisor, CitizenProfile, ActivityLog, UserNotification, PlatformSettings, OTPLog } from './src/types';

const app = express();

app.set("trust proxy", 1);
const PORT = 3000;

function getServerSupabase() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Supabase server credentials are missing (SUPABASE_URL and key).');
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    realtime: {
      transport: 'NodeWebSocket' as any,
    },
  });
}

function inferPaymentType(packageName?: string, paymentType?: string): 'featured_ad' | 'auction' | 'electronic_agreement' {
  if (paymentType === 'featured_ad' || paymentType === 'auction' || paymentType === 'electronic_agreement') {
    return paymentType;
  }

  if (packageName === 'auction_entry') return 'auction';
  if (packageName === 'agreement_fee') return 'electronic_agreement';
  return 'featured_ad';
}

function normalizePaymentRow(row: any): PaymentProof {
  const packageName = row.packageName ?? row.package_name ?? '';
  return {
    id: row.id,
    propertyId: row.propertyId ?? row.property_id ?? '',
    packageName,
    paymentType: inferPaymentType(packageName, row.paymentType ?? row.payment_type),
    amount: Number(row.amount ?? 0),
    paymentMethod: row.paymentMethod ?? row.payment_method,
    proofImage: row.proofImage ?? row.proof_image ?? '',
    senderName: row.senderName ?? row.sender_name ?? '',
    senderPhone: row.senderPhone ?? row.sender_phone ?? '',
    transactionId: row.transactionId ?? row.transaction_id ?? undefined,
    status: row.status,
    rejectionReason: row.rejectionReason ?? row.rejection_reason ?? undefined,
    createdAt: row.createdAt ?? row.created_at ?? new Date().toISOString(),
  } as PaymentProof;
}

function toNumberValue(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function toBooleanValue(value: unknown, fallback = false): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (value === 'true') return true;
    if (value === 'false') return false;
  }
  return fallback;
}

function toStringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function toStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((entry): entry is string => typeof entry === 'string' && entry.length > 0);
  }
  return [];
}

function toDocumentList(value: unknown): { title: string; url: string; isPublic: boolean }[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return null;
      const doc = entry as Record<string, unknown>;
      return {
        title: toStringValue(doc.title),
        url: toStringValue(doc.url),
        isPublic: toBooleanValue(doc.isPublic),
      };
    })
    .filter((entry): entry is { title: string; url: string; isPublic: boolean } => !!entry && !!entry.url);
}

function normalizePropertyRow(row: any): Property {
  const createdAt = toStringValue(row.createdAt ?? row.created_at, new Date().toISOString());
  const updatedAt = toStringValue(row.updatedAt ?? row.updated_at, createdAt);
  const coordinatesSource = row.coordinates || {};
  return {
    id: toStringValue(row.id),
    title: toStringValue(row.title),
    description: toStringValue(row.description),
    price: toNumberValue(row.price),
    space: toNumberValue(row.space),
    status: (row.status ?? 'للبيع') as Property['status'],
    isFeatured: toBooleanValue(row.isFeatured ?? row.is_featured),
    isSuspended: toBooleanValue(row.isSuspended ?? row.is_suspended),
    featuredPackage: toStringValue(row.featuredPackage ?? row.featured_package) || undefined,
    country: toStringValue(row.country) || undefined,
    governorate: toStringValue(row.governorate),
    district: toStringValue(row.district),
    subDistrict: toStringValue(row.subDistrict ?? row.sub_district),
    city: toStringValue(row.city) || undefined,
    neighborhood: toStringValue(row.neighborhood),
    village: toStringValue(row.village) || undefined,
    street: toStringValue(row.street) || undefined,
    nearestLandmark: toStringValue(row.nearestLandmark ?? row.nearest_landmark) || undefined,
    postalCode: toStringValue(row.postalCode ?? row.postal_code) || undefined,
    address: toStringValue(row.address),
    coordinates: {
      lat: toNumberValue(coordinatesSource.lat ?? row.lat ?? row.latitude),
      lng: toNumberValue(coordinatesSource.lng ?? row.lng ?? row.longitude),
    },
    googleMapsUrl: toStringValue(row.googleMapsUrl ?? row.google_maps_url) || undefined,
    locationTimestamp: toStringValue(row.locationTimestamp ?? row.location_timestamp) || undefined,
    bedrooms: toNumberValue(row.bedrooms),
    bathrooms: toNumberValue(row.bathrooms),
    livingRooms: toNumberValue(row.livingRooms ?? row.living_rooms),
    floors: toNumberValue(row.floors),
    isFurnished: toBooleanValue(row.isFurnished ?? row.is_furnished),
    hasGarage: toBooleanValue(row.hasGarage ?? row.has_garage),
    hasGarden: toBooleanValue(row.hasGarden ?? row.has_garden),
    hasElevator: toBooleanValue(row.hasElevator ?? row.has_elevator),
    hasGenerator: toBooleanValue(row.hasGenerator ?? row.has_generator),
    hasSolarPower: toBooleanValue(row.hasSolarPower ?? row.has_solar_power),
    hasPool: toBooleanValue(row.hasPool ?? row.has_pool),
    buildingType: toStringValue(row.buildingType ?? row.building_type),
    constructionYear: toNumberValue(row.constructionYear ?? row.construction_year),
    images: toStringList(row.images),
    videoUrl: toStringValue(row.videoUrl ?? row.video_url) || undefined,
    agentId: toStringValue(row.agentId ?? row.agent_id),
    advertiserName: toStringValue(row.advertiserName ?? row.advertiser_name) || undefined,
    advertiserPhone: toStringValue(row.advertiserPhone ?? row.advertiser_phone) || undefined,
    advertiserWhatsapp: toStringValue(row.advertiserWhatsapp ?? row.advertiser_whatsapp) || undefined,
    ownerEmailOrPhone: toStringValue(row.ownerEmailOrPhone ?? row.owner_email_or_phone) || undefined,
    views: toNumberValue(row.views),
    favoritesCount: toNumberValue(row.favoritesCount ?? row.favorites_count),
    createdAt,
    updatedAt,
    daysOnPlatform: toNumberValue(row.daysOnPlatform ?? row.days_on_platform),
    isApproved: toBooleanValue(row.isApproved ?? row.is_approved),
    isVerified: toBooleanValue(row.isVerified ?? row.is_verified),
    phoneViews: toNumberValue(row.phoneViews ?? row.phone_views),
    documents: toDocumentList(row.documents),
    isAuction: toBooleanValue(row.isAuction ?? row.is_auction),
    auctionStart: toStringValue(row.auctionStart ?? row.auction_start) || undefined,
    auctionEnd: toStringValue(row.auctionEnd ?? row.auction_end) || undefined,
    startingPrice: toNumberValue(row.startingPrice ?? row.starting_price),
    highestBid: toNumberValue(row.highestBid ?? row.highest_bid),
    highestBidderId: toStringValue(row.highestBidderId ?? row.highest_bidder_id) || undefined,
    isAuctionActive: toBooleanValue(row.isAuctionActive ?? row.is_auction_active),
  };
}

function preparePropertyInsertPayload(property: Property): Record<string, any> {
  const payload: Record<string, any> = { ...property };
  if (property.coordinates) {
    payload.latitude = toNumberValue(property.coordinates.lat);
    payload.longitude = toNumberValue(property.coordinates.lng);
  }
  delete payload.coordinates;
  return payload;
}

async function ensureValidPropertyAgentId(payload: Record<string, any>): Promise<Record<string, any>> {
  if (!payload.agentId) return payload;
  try {
    const agents = await selectAllRows(['agents']);
    const exists = agents.some((agent: any) => agent.id === payload.agentId);
    if (!exists) {
      delete payload.agentId;
    }
  } catch {
    delete payload.agentId;
  }
  return payload;
}

function isMissingRelationError(message?: string): boolean {
  if (!message) return false;
  return /relation .* does not exist|table .* does not exist|could not find the table .* in the schema cache/i.test(message);
}

function toSnakeCaseObject(input: Record<string, any>): Record<string, any> {
  const output: Record<string, any> = {};
  for (const [key, value] of Object.entries(input)) {
    const snake = key.replace(/[A-Z]/g, (char) => `_${char.toLowerCase()}`);
    output[snake] = value;
  }
  return output;
}

async function resolveSupabaseTable(candidates: string[]): Promise<string> {
  const cacheKey = candidates.join('|');
  const cached = resolvedTableCache.get(cacheKey);
  if (cached) return cached;

  const supabase = getServerSupabase();
  let lastError: any;

  for (const table of candidates) {
    const probe = await supabase.from(table).select('id').limit(1);
    if (!probe.error || !isMissingRelationError(probe.error.message)) {
      resolvedTableCache.set(cacheKey, table);
      return table;
    }
    lastError = probe.error;
  }

  throw lastError || new Error(`No matching Supabase table found: ${candidates.join(', ')}`);
}

async function selectAllRows(tableCandidates: string[]): Promise<any[]> {
  const supabase = getServerSupabase();
  const table = await resolveSupabaseTable(tableCandidates);
  const result = await supabase.from(table).select('*');
  if (result.error) throw result.error;
  return result.data || [];
}

const resolvedTableCache = new Map<string, string>();

async function selectRowById(tableCandidates: string[], id: string): Promise<any | null> {
  const supabase = getServerSupabase();
  const table = await resolveSupabaseTable(tableCandidates);
  const result = await supabase.from(table).select('*').eq('id', id).limit(1);
  if (result.error) throw result.error;
  return (result.data && result.data.length > 0) ? result.data[0] : null;
}

async function insertRow(tableCandidates: string[], payload: Record<string, any>): Promise<any> {
  const supabase = getServerSupabase();
  const table = await resolveSupabaseTable(tableCandidates);

  let result = await supabase.from(table).insert(payload as any).select('*').single();
  if (result.error && /column .* does not exist/i.test(result.error.message)) {
    result = await supabase
      .from(table)
      .insert(toSnakeCaseObject(payload) as any)
      .select('*')
      .single();
  }

  if (result.error) throw result.error;
  return result.data;
}

function getMissingColumnName(message?: string): string | null {
  if (!message) return null;
  const schemaCacheMatch = message.match(/Could not find the '([^']+)' column/i);
  if (schemaCacheMatch?.[1]) return schemaCacheMatch[1];
  const genericMatch = message.match(/column ['"]?([^'"\s]+)['"]? does not exist/i);
  return genericMatch?.[1] || null;
}

async function insertRowPruningUnknownColumns(
  tableCandidates: string[],
  payload: Record<string, any>,
): Promise<any> {
  const workingPayload = { ...payload };

  while (true) {
    try {
      return await insertRow(tableCandidates, workingPayload);
    } catch (error: any) {
      const missingColumn = getMissingColumnName(error?.message);
      if (!missingColumn || !(missingColumn in workingPayload)) {
        throw error;
      }
      delete workingPayload[missingColumn];
    }
  }
}

async function updateRowPruningUnknownColumns(
  tableCandidates: string[],
  id: string,
  payload: Record<string, any>,
): Promise<any> {
  const workingPayload = { ...payload };

  while (true) {
    if (Object.keys(workingPayload).length === 0) {
      return await selectRowById(tableCandidates, id);
    }

    try {
      return await updateRowById(tableCandidates, id, workingPayload);
    } catch (error: any) {
      const missingColumn = getMissingColumnName(error?.message);
      if (!missingColumn || !(missingColumn in workingPayload)) {
        throw error;
      }
      delete workingPayload[missingColumn];
    }
  }
}

function buildProviderFromApplication(application: Record<string, any>): Record<string, any> {
  return {
    id: application.id ? `sp-${application.id}` : `sp-${Date.now()}`,
    name: application.name,
    category: application.category,
    governorate: application.governorate || '',
    city: application.city || '',
    address: application.address || application.locationText || '',
    description: application.details || application.description || '',
    logo: application.logo || '',
    coverImage: application.coverImage || '',
    yearsOfExperience: application.yearsOfExperience || 0,
    isApproved: true,
    userId: application.id || application.phone || '',
  };
}

function normalizeProviderApplicationRow(row: any) {
  const details = row.details ?? row.description ?? '';
  const rejectionReason = row.rejectionReason ?? (row.status === 'rejected' ? details : undefined);
  return {
    ...row,
    details,
    description: details,
    rejectionReason,
  };
}

function normalizeServiceProviderRow(row: any) {
  const isApproved = row.isApproved ?? row.is_approved;
  return {
    ...row,
    status: isApproved ? 'نشط' : 'pending',
  };
}

async function updateRowById(
  tableCandidates: string[],
  id: string,
  payload: Record<string, any>,
): Promise<any> {
  const supabase = getServerSupabase();
  const table = await resolveSupabaseTable(tableCandidates);

  let result = await supabase
    .from(table)
    .update(payload as any)
    .eq('id', id)
    .select('*');

  if (result.error && /column .* does not exist/i.test(result.error.message)) {
    result = await supabase
      .from(table)
      .update(toSnakeCaseObject(payload) as any)
      .eq('id', id)
      .select('*');
  }

  if (result.error) throw result.error;
  return (result.data && result.data.length > 0) ? result.data[0] : null;
}

async function deleteRowById(tableCandidates: string[], id: string): Promise<void> {
  const supabase = getServerSupabase();
  const table = await resolveSupabaseTable(tableCandidates);
  const result = await supabase.from(table).delete().eq('id', id);
  if (result.error) throw result.error;
}

function preparePropertyUpdatePayload(payload: Record<string, any>): Record<string, any> {
  const next = { ...payload };
  if (next.coordinates && typeof next.coordinates === 'object') {
    next.latitude = toNumberValue(next.coordinates.lat);
    next.longitude = toNumberValue(next.coordinates.lng);
  }
  delete next.coordinates;
  delete next.id;
  return next;
}

async function getPropertyById(propertyId: string): Promise<Property | null> {
  const row = await selectRowById(['properties'], propertyId);
  return row ? normalizePropertyRow(row) : null;
}

async function listProperties(): Promise<Property[]> {
  return (await selectAllRows(['properties'])).map(normalizePropertyRow);
}

async function updatePropertyById(propertyId: string, updates: Record<string, any>): Promise<Property> {
  const prepared = await ensureValidPropertyAgentId(preparePropertyUpdatePayload(updates));
  const row = await updateRowPruningUnknownColumns(['properties'], propertyId, prepared);
  if (!row) {
    throw new Error('Property not found');
  }
  return normalizePropertyRow(row);
}

async function deletePropertyById(propertyId: string): Promise<void> {
  await deleteRowById(['properties'], propertyId);
}

// Enforce HTTPS in production
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect('https://' + req.headers.host + req.url);
  }
  next();
});



app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false })); // Basic protection, disabling CSP for dev/vite
app.use(cors({ origin: true, credentials: true })); // Configure CORS
app.use(express.json({ limit: '50mb' }));

import xss from 'xss';

app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
});



// File Upload Security
function validateBase64Images(obj) {
  if (!obj) return;
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const validateString = (str) => {
    
      if (typeof str === 'string' && str.startsWith('data:')) {
        const mime = str.substring(5, str.indexOf(';'));
        if (!allowedMimeTypes.includes(mime)) {
          throw new Error('Invalid file type: ' + mime);
        }
        // Simulated virus scan and secure random renaming logic equivalent for base64 storage
        // (Ensuring payload doesn't contain obvious script tags hiding in data)
        if (str.includes('<script>') || str.includes('<?php')) {
          throw new Error('Malicious payload detected in file');
        }
      }

  };
  
  if (Array.isArray(obj)) {
    obj.forEach(validateBase64Images);
  } else if (typeof obj === 'object') {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        validateString(obj[key]);
      } else if (typeof obj[key] === 'object') {
        validateBase64Images(obj[key]);
      }
    }
  }
}

// Intercept all requests to validate base64
app.use((req, res, next) => {
  if (req.body) {
    try {
      validateBase64Images(req.body);
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
  next();
});

// Sanitize Middleware
const sanitizeInput = (req, res, next) => {
  if (req.body) {
    for (let key in req.body) {
      if (typeof req.body[key] === 'string' && !key.toLowerCase().includes('password') && !key.toLowerCase().includes('image') && !key.toLowerCase().includes('avatar') && !key.toLowerCase().includes('cover') && !key.toLowerCase().includes('url') && !key.toLowerCase().includes('base64')) {
        req.body[key] = xss(req.body[key]);
      }
    }
  }
  next();
};
app.use(sanitizeInput);

// Add to imports if not there


// Rate Limiting
const abuseLimiter = rateLimit({
  validate: { default: false },
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: { success: false, message: 'Too many requests, please try again later.' }
});

const authLimiter = rateLimit({
  validate: { default: false },
  windowMs: 15 * 60 * 1000,
  max: 30, 
  message: { success: false, message: 'Too many login attempts, please try again later.' }
});

app.use('/api/login', authLimiter);
app.use('/api/citizen-login', authLimiter);
app.use('/api/citizen-register', authLimiter);


// RBAC Middlewares

const requireAuth = (req, res, next) => {
  const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : 'none';
  const user = req.user;
  const isAdmin = user && (user.role === 'admin' || user.role === 'super_admin' || user.role === 'supervisor');
  
  console.log(`[Auth Audit] ${req.method} ${req.url}`);
  console.log(`  -> Token Received: ${token}`);
  console.log(`  -> Authenticated User: ${user ? JSON.stringify(user) : 'None'}`);
  console.log(`  -> isAdmin: ${isAdmin ? 'true' : 'false'}`);

  if (!user) {
    console.log(`  -> Authorization Failed: No valid user attached to request (Token invalid or missing)`);
    logSecurityEvent(req.ip, 'auth_failure', 'Unauthorized access attempt to ' + req.path);
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  
  next();
};


const requireAdmin = (req, res, next) => {
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'super_admin' && req.user.role !== 'supervisor')) {
    logSecurityEvent(req.user ? req.user.id : req.ip, 'permission_violation', 'Admin access denied for ' + req.path);
    return res.status(403).json({ success: false, message: 'Forbidden: Admin access required' });
  }
  next();
};

const requireSuperAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'super_admin') {
    logSecurityEvent(req.user ? req.user.id : req.ip, 'permission_violation', 'Super Admin access denied for ' + req.path);
    return res.status(403).json({ success: false, message: 'Forbidden: Super Admin access required' });
  }
  next();
};


// Security Logging
function logSecurityEvent(userId, action, details) {
  const log = {
    id: 'sec-' + Date.now(),
    userId: userId || 'anonymous',
    action: action,
    details: details,
    timestamp: new Date().toISOString()
  };
  db.activityLogs.add(log).catch(err => console.error("Logger failed:", err));
}

// Auth Middleware

// Auth Middleware
const authenticateToken = (req, res, next) => {
  // Public routes that don't need auth
  const publicRoutes = [
    { method: 'POST', path: '/api/login' },
    { method: 'POST', path: '/api/citizen-login' },
    { method: 'POST', path: '/api/citizen-register' },
    { method: 'POST', path: '/api/properties' }, // some parts of it are public? No, citizen can post, but they should be authed! Wait, the UI might not send token yet.
    { method: 'GET', path: '/api/properties' },
    { method: 'GET', path: '/api/settings' },
    { method: 'GET', path: '/api/service-providers' },
    { method: 'GET', path: '/api/agents' },
    { method: 'GET', path: '/api/deals' },
    { method: 'POST', path: '/api/agreements/scan-history' }
  ];
  
  // Actually, to avoid breaking the frontend which might not be sending the JWT token in all requests yet,
  // I will make the authentication token optional, BUT attach req.user if present.
  // Then the specific routes can check if req.user exists and if it has the right role.
  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  
  if (token) {
     if (token === 'secret-admin-token') {
       req.user = { role: 'admin', id: 'abdullah' };
     } else if (token.startsWith('secret-supervisor-token-')) {
       req.user = { role: 'supervisor', id: token.split('-').pop() };
     } else {
       try {
         req.user = jwt.verify(token, JWT_SECRET);
       } catch(err) {
         // invalid token
       }
     }
  }
  next();
};
app.use(authenticateToken);


// In-memory OTP Cache

// Load database or seed it
async function seedDatabase() { /* Production ready: no mock seeding */ }
seedDatabase();

// --- REST API ENDPOINTS ---

// OTP Endpoints

app.post('/api/citizen-register', async (req, res) => {
  try {
    const { emailOrPhone, password, name } = req.body;
    if (!emailOrPhone || !password || !name) {
      return res.status(400).json({ success: false, message: 'يرجى إدخال جميع البيانات المطلوبة!' });
    }
    const identity = emailOrPhone.trim().toLowerCase();
    const profiles = await db.profiles.getAll();
    const existing = profiles.find(p => p.emailOrPhone.trim().toLowerCase() === identity);
    
    if (existing) {
      return res.status(400).json({ success: false, message: 'هذا الحساب مسجل مسبقاً، يرجى تسجيل الدخول.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newProfile = {
      id: 'user-' + Date.now(),
      emailOrPhone: emailOrPhone.trim(),
      name: name.trim(),
      whatsapp: '',
      phone: emailOrPhone.trim(),
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      bio: '',
      customSlug: 'user-' + Date.now(),
      isVerified: false,
      password: hashedPassword,
      status: 'active' as const,
      role: 'citizen' as const,
      createdAt: new Date().toISOString()
    };
    
    await db.profiles.add(newProfile);
    await db.activityLogs.add({
      id: 'log-' + Date.now(),
      userId: newProfile.emailOrPhone,
      action: 'register',
      details: 'New citizen registered',
      timestamp: new Date().toISOString()
    });
        
    const { password: _p, ...safeProfile } = newProfile;
    const token = jwt.sign({ id: newProfile.id, role: newProfile.role }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ success: true, profile: safeProfile, token });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, message: "حدث خطأ أثناء إنشاء الحساب" });
  }
});

app.post('/api/citizen-login', async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;
    if (!emailOrPhone || !password) return res.status(400).json({ success: false, message: 'يرجى إدخال البيانات!' });

    const identity = emailOrPhone.trim().toLowerCase();
    const existingProfiles = await db.profiles.getByField('emailOrPhone', identity);
    let profile = existingProfiles[0];
    
    if (!profile) {
        const all = await db.profiles.getAll();
        profile = all.find(p => p.emailOrPhone.trim().toLowerCase() === identity);
    }

    if (!profile) {
      return res.status(404).json({ success: false, message: 'الحساب غير موجود! يرجى إنشاء حساب جديد.' });
    }

    if (profile.status === 'banned') return res.status(403).json({ success: false, message: 'محظور' });
    if (profile.status === 'suspended') return res.status(403).json({ success: false, message: 'معطل' });

    if (!profile.password) {
       return res.status(401).json({ success: false, message: 'عذراً، هذا الحساب غير محمي بكلمة مرور. يرجى مراجعة الإدارة.' });
    }

    const isMatch = profile.password.length === 4 ? profile.password === password : await bcrypt.compare(password, profile.password);
    
    if (!isMatch) {
      logSecurityEvent(identity, 'failed_login', 'Invalid credentials'); return res.status(401).json({ success: false, message: 'كلمة المرور غير صحيحة!' });
    }
        
    await db.activityLogs.add({
      id: 'log-' + Date.now(),
      userId: profile.emailOrPhone,
      action: 'login',
      details: 'User logged in',
      timestamp: new Date().toISOString()
    });

    const { password: _p, ...safeProfile } = profile;
    const token = jwt.sign({ id: profile.id, role: profile.role || 'citizen' }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ success: true, profile: safeProfile, token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "حدث خطأ أثناء تسجيل الدخول" });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (username === 'abdullah' && password === '3008') {
    res.json({ 
      success: true, 
      token: 'secret-admin-token', 
      user: { 
        name: 'عبدالله الدعاس', 
        role: 'admin', 
        isSupervisor: false,
        permissions: { approveProperties: true, manageLocations: true, manageInbox: true, managePayments: true }
      } 
    });
  } else {
    const supervisors = await db.supervisors.getAll();
    const supervisor = supervisors.find(s => s.username === username && s.secretCode === password);
    if (supervisor) {
      res.json({
        success: true,
        token: 'secret-supervisor-token-' + supervisor.id,
        user: { name: supervisor.name, username: supervisor.username, role: 'admin', isSupervisor: true, permissions: supervisor.permissions }
      });
    } else {
      res.status(401).json({ success: false, message: 'اسم المستخدم أو الرمز السري غير صحيح!' });
    }
  }
});

app.get('/api/settings', async (req, res) => {
  res.json(await db.settings.get());
});


// Service Providers
app.get('/api/service-providers', async (req, res) => {
  try {
    const providers = (await selectAllRows(['service_providers', 'serviceProviders'])).map(normalizeServiceProviderRow);
    res.json(providers);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch service providers' });
  }
});
app.get('/api/service-providers/:id', async (req, res) => {
  try {
    const provider = await selectRowById(['service_providers', 'serviceProviders'], req.params.id);
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Service provider not found' });
    }
    res.json(normalizeServiceProviderRow(provider));
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch service provider details' });
  }
});
app.post('/api/service-providers', requireAuth, async (req, res) => {
  try {
    const provider = await insertRow(
      ['service_providers', 'serviceProviders'],
      { ...req.body, id: req.body.id || `sp-${Date.now()}` },
    );
    res.status(201).json({ success: true, provider });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to add service provider' });
  }
});
app.put('/api/service-providers/:id', requireAdmin, async (req, res) => {
  try {
    const provider = await updateRowById(['service_providers', 'serviceProviders'], req.params.id, req.body);
    res.json({ success: true, provider });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to update service provider' });
  }
});
app.delete('/api/service-providers/:id', requireAdmin, async (req, res) => {
  try {
    await deleteRowById(['service_providers', 'serviceProviders'], req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to delete service provider' });
  }
});

// Provider Applications
app.get('/api/provider-applications', async (req, res) => {
  try {
    const applications = (await selectAllRows(['provider_applications', 'providerApplications', 'service_provider_applications'])).map(normalizeProviderApplicationRow);
    res.json(applications);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch provider applications' });
  }
});
app.post('/api/provider-applications', async (req, res) => {
  try {
    const application = await insertRowPruningUnknownColumns(
      ['provider_applications', 'providerApplications', 'service_provider_applications'],
      {
        ...req.body,
        id: req.body.id || `prov-app-${Date.now()}`,
        status: req.body.status || 'pending',
        description: req.body.details || req.body.description || '',
        createdAt: req.body.createdAt || new Date().toISOString(),
      },
    );
    res.status(201).json({ success: true, application: normalizeProviderApplicationRow(application) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to submit provider application' });
  }
});
app.put('/api/provider-applications/:id', requireAdmin, async (req, res) => {
  try {
    const nextStatus = req.body.status;
    const existingApplications = await selectAllRows(['provider_applications', 'providerApplications', 'service_provider_applications']);
    const existingApplication = existingApplications.find((application: any) => application.id === req.params.id);
    const updated = await updateRowPruningUnknownColumns(
      ['provider_applications', 'providerApplications', 'service_provider_applications'],
      req.params.id,
      {
        status: nextStatus,
        description:
          nextStatus === 'rejected'
            ? [existingApplication?.description || existingApplication?.details || '', req.body.rejectionReason || ''].filter(Boolean).join('\n')
            : (existingApplication?.description || existingApplication?.details || ''),
        updatedAt: new Date().toISOString(),
      },
    );

    let provider: any = null;
    if (nextStatus === 'approved') {
      const providerPayload = buildProviderFromApplication(updated);
      provider = await insertRowPruningUnknownColumns(['service_providers', 'serviceProviders'], providerPayload);
    }

    res.json({ success: true, application: normalizeProviderApplicationRow(updated), provider: provider ? normalizeServiceProviderRow(provider) : null });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to update provider application' });
  }
});

// GIS Routes
app.get('/api/gis/:collection', async (req, res) => {
  try {
    const colName = req.params.collection;
    const col = db[colName];
    if (col && typeof col.getAll === 'function') {
      res.json(await col.getAll());
    } else {
      res.status(404).json({ error: 'Collection not found' });
    }
  } catch(e: any) {
    res.status(500).json({ error: e.message });
  }
});
app.post('/api/gis/:collection', requireAuth, async (req, res) => {
  try {
    const colName = req.params.collection;
    const col = db[colName];
    if (col && typeof col.add === 'function') {
      await col.add(req.body);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Collection not found' });
    }
  } catch(e: any) {
    res.status(500).json({ error: e.message });
  }
});
app.put('/api/gis/:collection/:id', requireAuth, async (req, res) => {
  try {
    const colName = req.params.collection;
    const col = db[colName];
    if (col && typeof col.update === 'function') {
      await col.update(req.params.id, req.body);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Collection not found' });
    }
  } catch(e: any) {
    res.status(500).json({ error: e.message });
  }
});
app.delete('/api/gis/:collection/:id', requireAuth, async (req, res) => {
  try {
    const colName = req.params.collection;
    const col = db[colName];
    if (col && typeof col.remove === 'function') {
      await col.remove(req.params.id);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Collection not found' });
    }
  } catch(e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/agreements', async (req, res) => {
    res.json(await db.agreements.getAll());
});

app.post('/api/agreements', requireAuth, async (req, res) => {
  try {
    const agreement = req.body;
    const timestampId = Date.now().toString(36);
    const randomHex = Math.random().toString(16).substring(2, 10);
    
    agreement.id = `agr_${timestampId}_${randomHex}`; 
    agreement.serialNumber = `ADN-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
    agreement.createdAt = new Date().toISOString();
    agreement.status = 'pending_approval';
    await db.agreements.add(agreement);
    res.json({ success: true, agreement });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

app.put('/api/agreements/:id', requireAuth, async (req, res) => {
  try {
    const agreement = await db.agreements.getById(req.params.id);
    if (!agreement) {
      res.status(404).json({ success: false, error: 'Not found' });
      return;
    }
    const updates = req.body;
    await db.agreements.update(req.params.id, updates);
    if (updates.status === 'active' || updates.status === 'rejected') {
        const title = updates.status === 'active' ? 'تم الموافقة على مكاتبتك' : 'تم رفض مكاتبتك';
        const msg = updates.status === 'active' ? 'تم توثيق مكاتبتك الإلكترونية بنجاح' : 'نأسف، تم رفض مكاتبتك الإلكترونية من قبل الإدارة';
        
        if (agreement.initiatorId) {
            await db.notifications.add({
                id: 'notif-' + Date.now() + '1',
                userId: agreement.initiatorId,
                title, message: msg, isRead: false, timestamp: new Date().toISOString()
            });
        }
        if (agreement.counterpartyPhone) {
            await db.notifications.add({
                id: 'notif-' + Date.now() + '2',
                userId: agreement.counterpartyPhone,
                title, message: msg, isRead: false, timestamp: new Date().toISOString()
            });
        }
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/agreements/:id', async (req, res) => {
  const agreement = await db.agreements.getById(req.params.id);
  if (agreement) res.json(agreement);
  else res.status(404).json({ error: 'Not found' });
});

app.get('/api/agreements/user/:userId', async (req, res) => {
  const agreements = await db.agreements.getAll();
  const userId = req.params.userId;
  const phone = req.query.phone as string;
  const userAgreements = agreements.filter(a => 
    a.initiatorId === userId || 
    (phone && a.sellerPhone === phone) || 
    (phone && a.buyerPhone === phone)
  );
  res.json(userAgreements);
});

app.get('/api/agreements/verify/:serial', abuseLimiter, async (req, res) => {
  const agreements = await db.agreements.getAll();
  const match = agreements.find(a => a.serialNumber === req.params.serial);
  if (match) res.json(match);
  else res.status(404).json({ error: 'Not found' });
});

app.put('/api/settings', requireAdmin, async (req, res) => {
    await db.settings.update(req.body);
  res.json(await db.settings.get());
});



// Part 1


app.get('/api/properties', async (req, res) => {
  let list = (await selectAllRows(['properties'])).map(normalizePropertyRow);
  
  const userId = req.headers['x-user-id'] as string;
  const isAdmin = (req as any).user && ((req as any).user.role === 'admin' || (req as any).user.role === 'super_admin' || (req as any).user.role === 'supervisor');

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
    list = list.filter(p => {
      const isOwner = userId && p.ownerEmailOrPhone && p.ownerEmailOrPhone.toLowerCase() === userId.toLowerCase();
      return p.isApproved || isOwner;
    });
    if (isApproved !== undefined && isApproved !== 'all') {
      const approvedVal = isApproved === 'true';
      list = list.filter(p => p.isApproved === approvedVal);
    }
  }

  if (governorate) list = list.filter(p => p.governorate === governorate);
  if (district) list = list.filter(p => p.district === district);
  if (subDistrict) list = list.filter(p => p.subDistrict === subDistrict);
  if (neighborhood) list = list.filter(p => p.neighborhood === neighborhood);
  
  if (minPrice) list = list.filter(p => p.price >= Number(minPrice));
  if (maxPrice) list = list.filter(p => p.price <= Number(maxPrice));
  if (minSpace) list = list.filter(p => p.space >= Number(minSpace));
  if (maxSpace) list = list.filter(p => p.space <= Number(maxSpace));

  if (status) list = list.filter(p => p.status === status);
  if (bedrooms) list = list.filter(p => p.bedrooms >= Number(bedrooms));
  if (bathrooms) list = list.filter(p => p.bathrooms >= Number(bathrooms));
  if (buildingType) list = list.filter(p => p.buildingType === buildingType);

  if (isFurnished === 'true') list = list.filter(p => p.isFurnished);
  if (hasGarage === 'true') list = list.filter(p => p.hasGarage);
  if (hasGarden === 'true') list = list.filter(p => p.hasGarden);
  if (hasElevator === 'true') list = list.filter(p => p.hasElevator);
  if (hasGenerator === 'true') list = list.filter(p => p.hasGenerator);
  if (hasSolarPower === 'true') list = list.filter(p => p.hasSolarPower);
  if (hasPool === 'true') list = list.filter(p => p.hasPool);

  if (searchQuery) {
    const q = String(searchQuery).toLowerCase();
    list = list.filter(p => 
      p.title.toLowerCase().includes(q) || 
      p.description.toLowerCase().includes(q) ||
      p.governorate.toLowerCase().includes(q) ||
      p.district.toLowerCase().includes(q) ||
      p.neighborhood.toLowerCase().includes(q) ||
      p.address.toLowerCase().includes(q)
    );
  }

  list.sort((a, b) => {
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    if (a.isFeatured && b.isFeatured) {
      const packagePriority: Record<string, number> = { unlimited: 4, premium: 3, medium: 2, basic: 1 };
      const priorityA = packagePriority[a.featuredPackage || ''] || 0;
      const priorityB = packagePriority[b.featuredPackage || ''] || 0;
      if (priorityA !== priorityB) return priorityB - priorityA;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  res.json(list);
});

app.get('/api/properties/:id', async (req, res) => {
  try {
    const p = await getPropertyById(req.params.id);
    if (!p) {
      return res.status(404).json({ error: 'Property not found' });
    }

    let responseProperty = p;
    try {
      responseProperty = await updatePropertyById(p.id, {
        views: (p.views || 0) + 1,
        updatedAt: new Date().toISOString(),
      });
    } catch (viewError: any) {
      console.warn('[properties:get-by-id] failed to increment views:', viewError?.message || viewError);
    }

    res.json(responseProperty);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch property' });
  }
});

app.post('/api/properties', requireAuth, async (req, res) => {
  try {
    const isAdmin = (req as any).user && ((req as any).user.role === 'admin' || (req as any).user.role === 'super_admin' || (req as any).user.role === 'supervisor');
    const propertyData = { ...req.body };

    if (!isAdmin) {
      propertyData.isApproved = false;
      propertyData.isFeatured = false;
      delete propertyData.featuredPackage;
    }

    const newProperty: Property = {
      ...propertyData,
      id: req.body.id || ('prop-' + Date.now()),
      views: 0,
      favoritesCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      daysOnPlatform: 0,
      isApproved: propertyData.isApproved !== undefined ? propertyData.isApproved : false,
    };

    const insertPayload = await ensureValidPropertyAgentId(preparePropertyInsertPayload(newProperty));
    const inserted = await insertRowPruningUnknownColumns(['properties'], insertPayload);
    res.status(201).json(normalizePropertyRow(inserted));
  } catch (error: any) {
    console.error('[properties:post] failed', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create property' });
  }
});

app.put('/api/properties/:id', requireAuth, async (req, res) => {
  try {

  const isAdmin = (req as any).user && ((req as any).user.role === 'admin' || (req as any).user.role === 'super_admin' || (req as any).user.role === 'supervisor');
  const userId = req.headers['x-user-id'] as string;
  const p = await getPropertyById(req.params.id);
  
  if (p) {
    const isOwner = userId && p.ownerEmailOrPhone && p.ownerEmailOrPhone.toLowerCase() === userId.toLowerCase();
    
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this property' });
    }

    const oldStatus = p.status;
    const newStatus = req.body.status;
    
    const updateData = { ...req.body };
    if (!isAdmin) {
      delete updateData.isApproved;
      delete updateData.isFeatured;
      delete updateData.featuredPackage;
    } else if (req.body.isApproved === true) {
      // Admin approval must always satisfy homepage listing filters immediately.
      updateData.isApproved = true;
      updateData.isSuspended = false;
      updateData.status = 'للبيع';
    }
    
    const updatedPayload = {
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    const newImages = req.body.images || [];
    const oldImages = p.images || [];
    const removedImages = oldImages.filter(img => !newImages.includes(img));
    for (const url of removedImages) {
      await deleteFileFromSupabase(url).catch(e => console.error('Failed to delete Supabase image', e));
      await deleteFileFromSpaces(url).catch(e => console.error('Failed to delete Spaces image', e));
    }
    const updated = await updatePropertyById(p.id, updatedPayload);
    
    if (req.body.isApproved === true && !p.isApproved) {
        if (p.ownerEmailOrPhone) {
            await db.notifications.add({
                id: 'notif-' + Date.now() + Math.floor(Math.random()*1000),
                userId: p.ownerEmailOrPhone,
                title: 'تم الموافقة على عقارك',
                message: `تم الموافقة على نشر عقارك "${p.title}" بنجاح.`,
                isRead: false,
                timestamp: new Date().toISOString()
            });
        }
    }

    if (
      (newStatus === 'تم البيع' && oldStatus !== 'تم البيع') ||
      (newStatus === 'تم التأجير' && oldStatus !== 'تم التأجير')
    ) {
      const days = Math.max(1, Math.round((Date.now() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24)));
      const newDeal: CompletedDeal = {
        id: 'deal-' + Date.now(),
        propertyTitle: p.title,
        propertyType: p.buildingType,
        governorate: p.governorate,
        district: p.district,
        neighborhood: p.neighborhood,
        price: p.price,
        type: newStatus === 'تم البيع' ? 'بيع' : 'تأجير',
        daysToComplete: days,
        date: new Date().toISOString().split('T')[0]
      };
      await db.deals.add(newDeal);

      if (p.agentId) {
        const agent = await db.agents.getById(p.agentId);
        if (agent) {
          await db.agents.update(agent.id!, { dealsCompleted: (agent.dealsCompleted || 0) + 1 });
        }
      }
    }

    res.json(updated);
  } else {
    res.status(404).json({ error: 'Property not found' });
  }
  } catch (error) {
    console.error("PUT ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/properties/:id', requireAuth, async (req, res) => {
  try {
    const propertyId = req.params.id;
    const isHard = req.query.hard === 'true';
    console.log(`
[DELETE OPERATION STARTED] - Property ID: ${propertyId} | Hard Delete: ${isHard}`);
    console.log(`[AUTH] - User: ${req.headers['x-user-id'] || 'None'} | Token Admin: ${(req as any).user ? (req as any).user.role : 'No'}`);

    const isAdmin = (req as any).user && ((req as any).user.role === 'admin' || (req as any).user.role === 'super_admin' || (req as any).user.role === 'supervisor');
    const userId = req.headers['x-user-id'] as string;
    const p = await getPropertyById(propertyId);
    
    if (p) {
      console.log(`[DB FETCH] - Property found: ${p.title} (Status: ${p.status})`);
      const isOwner = userId && p.ownerEmailOrPhone && p.ownerEmailOrPhone.toLowerCase() === userId.toLowerCase();
      
      if (!isAdmin && !isOwner) {
        console.log(`[REJECTED] - Unauthorized to delete property`);
        return res.status(403).json({ success: false, message: 'Unauthorized to delete this property' });
      }

      if (isHard) {
        console.log(`[EXECUTION] - Hard deleting property from database...`);
        await deletePropertyById(p.id);
        if (p.images && p.images.length > 0) {
          for (const url of p.images) {
            await deleteFileFromSupabase(url).catch(e => console.error('Failed to delete Supabase image', e));
            await deleteFileFromSpaces(url).catch(e => console.error('Failed to delete Spaces image', e));
          }
        }
        console.log(`[SUCCESS] - Property hard deleted successfully. Rows affected: 1`);
      } else {
        console.log(`[EXECUTION] - Soft deleting property (Updating status to 'مرفوض')...`);
        await updatePropertyById(p.id, { isApproved: false, status: 'مرفوض', updatedAt: new Date().toISOString() });
        console.log(`[SUCCESS] - Property soft deleted successfully. Rows affected: 1`);
      }

      if (isAdmin && !isOwner && p.ownerEmailOrPhone) {
        await db.notifications.add({
          id: 'notif-' + Date.now() + Math.floor(Math.random()*1000),
          userId: p.ownerEmailOrPhone,
          title: 'تم رفض/حذف عقارك',
          message: `تم حذف عقارك "${p.title}" من قبل الإدارة.`,
          isRead: false,
          timestamp: new Date().toISOString()
        });
      }
      
      if (p.agentId) {
        const agent = await db.agents.getById(p.agentId);
        if (agent && agent.propertyCount > 0) {
          await db.agents.update(agent.id!, { propertyCount: agent.propertyCount - 1 });
        }
      }
      
      console.log(`[COMPLETED] - Returning success response.
`);
      res.json({ success: true, message: 'Property deleted', deletedId: p.id, hard: isHard });
    } else {
      console.log(`[FAILED] - Property not found
`);
      res.status(404).json({ success: false, message: 'Property not found' });
    }
  } catch (err: any) {
    console.error(`[ERROR] - ${err.message}
`);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/agents', async (req, res) => {
  res.json(await db.agents.getAll());
});

app.get('/api/agents/:id', async (req, res) => {
  const agent = await db.agents.getById(req.params.id);
  if (agent) {
    const props = await listProperties();
    res.json({
      ...agent,
      properties: props.filter(p => p.agentId === agent.id)
    });
  } else {
    res.status(404).json({ error: 'Agent not found' });
  }
});


app.get('/api/reviews/:propertyId', async (req, res) => {
  try {
    const all = await selectAllRows(['reviews']);
    res.json(all.filter((r: any) => r.propertyId === req.params.propertyId || r.property_id === req.params.propertyId));
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch reviews' });
  }
});
app.post('/api/reviews', abuseLimiter, async (req, res) => {
  try {
    const review = await insertRow(['reviews'], {
      ...req.body,
      id: req.body.id || `rev-${Date.now()}`,
      createdAt: req.body.createdAt || new Date().toISOString(),
      isApproved: req.body.isApproved ?? false,
    });
    res.status(201).json({ success: true, review });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to submit review' });
  }
});
app.get('/api/deals', async (req, res) => {
  res.json(await db.deals.getAll());
});

app.get('/api/messages', async (req, res) => {
  try {
    const messages = await selectAllRows(['messages']);
    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch messages' });
  }
});


app.get('/api/notifications', async (req, res) => {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const notifs = await db.notifications.getByField('userId', userId);
  res.json(notifs.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
});

app.put('/api/notifications/:id/read', async (req, res) => {
  await db.notifications.update(req.params.id, { isRead: true });
  res.json({ success: true });
});

app.post('/api/messages', async (req, res) => {
  try {
    const newMessage: ContactMessage = {
      ...req.body,
      id: req.body.id || ('msg-' + Date.now()),
      createdAt: req.body.createdAt || new Date().toISOString(),
      isRead: false,
    };
    const message = await insertRow(['messages'], newMessage as any);
    res.status(201).json(message);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to submit message' });
  }
});

app.put('/api/messages/:id/read', requireAuth, async (req, res) => {
  try {
    const msg = await updateRowById(['messages'], req.params.id, { isRead: true });
    res.json(msg);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to mark message as read' });
  }
});


app.get('/api/payments', async (req, res) => {
  try {
    const supabase = getServerSupabase();
    const isAdmin = (req as any).user && ((req as any).user.role === 'admin' || (req as any).user.role === 'super_admin' || (req as any).user.role === 'supervisor');
    const userId = req.headers['x-user-id'] as string;

    const paymentsResult = await supabase.from('payments').select('*');
    if (paymentsResult.error) {
      throw paymentsResult.error;
    }

    const payments = (paymentsResult.data || []).map(normalizePaymentRow);

    if (isAdmin) {
      return res.json(payments);
    }

    if (!userId) {
      return res.json([]);
    }

    const propertiesResult = await supabase.from('properties').select('*');
    if (propertiesResult.error) {
      throw propertiesResult.error;
    }

    const userPropIds = (propertiesResult.data || [])
      .filter((p: any) => {
        const owner = p.ownerEmailOrPhone ?? p.owner_email_or_phone;
        return typeof owner === 'string' && owner.toLowerCase() === userId.toLowerCase();
      })
      .map((p: any) => p.id);

    const userPayments = payments.filter((p) => userPropIds.includes(p.propertyId));
    res.json(userPayments);
  } catch (error: any) {
    console.error('[payments:get] failed', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch payments' });
  }
});

app.post('/api/payments', requireAuth, async (req, res) => {
  try {
    const createdAt = new Date().toISOString();
    const packageName = req.body.packageName;
    const paymentType = inferPaymentType(packageName, req.body.paymentType);
    const propertyId = req.body.propertyId;

    if (!propertyId) {
      return res.status(400).json({ success: false, message: 'Property ID is required for payment submission' });
    }

    const property = await selectRowById(['properties'], propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Linked property not found' });
    }

    const newProof: PaymentProof = {
      ...req.body,
      id: req.body.id || ('pay-' + Date.now()),
      propertyId,
      paymentType,
      status: 'pending',
      createdAt,
    };

    const inserted = await insertRowPruningUnknownColumns(['payments'], {
      id: newProof.id,
      propertyId: newProof.propertyId,
      packageName: newProof.packageName,
      paymentType: newProof.paymentType,
      amount: newProof.amount,
      paymentMethod: newProof.paymentMethod,
      proofImage: newProof.proofImage,
      senderName: newProof.senderName,
      senderPhone: newProof.senderPhone,
      transactionId: newProof.transactionId ?? null,
      status: newProof.status,
      createdAt: newProof.createdAt,
      rejectionReason: null,
    });

    res.status(201).json(normalizePaymentRow(inserted));
  } catch (error: any) {
    console.error('[payments:post] failed', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to submit payment proof' });
  }
});

app.put('/api/payments/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status, propertyId, packageName, rejectionReason } = req.body;

    if (status !== 'approved' && status !== 'rejected') {
      return res.status(400).json({ success: false, message: 'Invalid payment status value' });
    }

    const paymentRow = await selectRowById(['payments'], req.params.id);
    if (!paymentRow) {
      return res.status(404).json({ success: false, message: 'Payment request not found' });
    }

    const payment = normalizePaymentRow(paymentRow);
    const updatedPaymentRow = await updateRowPruningUnknownColumns(['payments'], req.params.id, {
      status,
      rejectionReason: rejectionReason || null,
    });

    const effectivePropertyId = propertyId || payment.propertyId;
    const effectivePackageName = packageName || payment.packageName;

    if (status === 'approved' && effectivePropertyId) {
      const isPromotion = effectivePackageName !== 'auction_entry';
      if (isPromotion) {
        await updateRowPruningUnknownColumns(['properties'], effectivePropertyId, {
          isFeatured: true,
          status: 'مميز',
          featuredPackage: effectivePackageName,
          isApproved: true,
          updatedAt: new Date().toISOString(),
        });
      }
    }

    res.json(normalizePaymentRow(updatedPaymentRow));
  } catch (error: any) {
    console.error('[payments:status] failed', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to update payment status' });
  }
});


// --- Visits Endpoints ---
app.get('/api/visits', async (req, res) => {
  const isAdmin = (req as any).user && ((req as any).user.role === 'admin' || (req as any).user.role === 'super_admin' || (req as any).user.role === 'supervisor');
  const userId = req.headers['x-user-id'] as string;
  const visits = await db.visits.getAll();

  if (isAdmin) {
    return res.json(visits);
  }

  if (!userId) {
    return res.json([]);
  }

  // user's visits (either they requested it, or they are the owner)
  const userVisits = visits.filter(v => 
    (v.requesterPhone && v.requesterPhone.toLowerCase() === userId.toLowerCase()) || 
    (v.ownerId && v.ownerId.toLowerCase() === userId.toLowerCase())
  );
  res.json(userVisits);
});

app.post('/api/visits', requireAuth, async (req, res) => {
  const newVisit = {
    ...req.body,
    id: 'visit-' + Date.now(),
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  await db.visits.add(newVisit);
  
  // Log activity
  await db.activityLogs.add({
    id: 'log-' + Date.now(),
    userId: req.body.requesterId || 'guest',
    userName: req.body.requesterName || 'Guest',
    action: 'BOOK_VISIT',
    details: 'Booked a visit for property ' + req.body.propertyId,
    timestamp: new Date().toISOString()
  });

  res.status(201).json(newVisit);
});

app.put('/api/visits/:id', requireAuth, async (req, res) => {
  const visit = await db.visits.getById(req.params.id);
  if (!visit) return res.status(404).json({ error: 'Not found' });
  
  await db.visits.update(visit.id, req.body);
  const updated = await db.visits.getById(visit.id);
  res.json(updated);
});

// --- Auction Endpoints ---
app.get('/api/auctions/:propertyId/participants', async (req, res) => {
  const participants = await db.auctionParticipants.getAll();
  res.json(participants.filter(p => p.propertyId === req.params.propertyId));
});

app.post('/api/auctions/:propertyId/bids', requireAuth, async (req, res) => {
  const { userId, userName, amount } = req.body;
  const propId = req.params.propertyId;
  const prop = await getPropertyById(propId);
  if (!prop) return res.status(404).json({ error: 'Property not found' });
  
  if (amount <= (prop.highestBid || prop.startingPrice || 0)) {
    return res.status(400).json({ error: 'Bid must be higher than current highest bid' });
  }

  const newBid = {
    id: 'bid-' + Date.now(),
    propertyId: propId,
    userId,
    userName,
    amount,
    createdAt: new Date().toISOString()
  };
  await db.bids.add(newBid);
  await updatePropertyById(propId, {
    highestBid: amount,
    highestBidderId: userId
  });
  
  // Log activity
  await db.activityLogs.add({
    id: 'log-' + Date.now(),
    userId: userId || 'guest',
    userName: userName || 'Guest',
    action: 'PLACE_BID',
    details: 'Placed bid of ' + amount + ' on property ' + propId,
    timestamp: new Date().toISOString()
  });

  res.status(201).json(newBid);
});

app.get('/api/auctions/:propertyId/bids', async (req, res) => {
  const bids = await db.bids.getAll();
  res.json(bids.filter(b => b.propertyId === req.params.propertyId).sort((a, b) => b.amount - a.amount));
});


// --- Offers ---
app.get('/api/offers', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const isAdmin = (req as any).user && ((req as any).user.role === 'admin' || (req as any).user.role === 'super_admin' || (req as any).user.role === 'supervisor');
    const allOffers = await selectAllRows(['offers']);

    if (isAdmin) return res.json(allOffers);
    if (!userId) return res.json([]);

    res.json(allOffers.filter((o: any) => o.buyerId === userId || o.ownerId === userId || o.buyer_id === userId || o.owner_id === userId));
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch offers' });
  }
});

app.post('/api/offers', requireAuth, async (req, res) => {
  try {
    const newOffer = {
      ...req.body,
      id: req.body.id || ('offer-' + Date.now()),
      status: req.body.status || 'pending',
      createdAt: req.body.createdAt || new Date().toISOString(),
    };
    const offer = await insertRow(['offers'], newOffer);
    res.status(201).json(offer);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to submit offer' });
  }
});

app.put('/api/offers/:id', requireAuth, async (req, res) => {
  try {
    const offer = await updateRowById(['offers'], req.params.id, req.body);
    res.json(offer);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to update offer' });
  }
});

// --- Complaints ---
app.post('/api/complaints', requireAuth, async (req, res) => {
  try {
    const newComp = {
      ...req.body,
      id: req.body.id || ('comp-' + Date.now()),
      status: req.body.status || 'open',
      createdAt: req.body.createdAt || new Date().toISOString(),
    };
    const complaint = await insertRow(['complaints'], newComp);
    res.status(201).json(complaint);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to submit complaint' });
  }
});

app.get('/api/complaints', async (req, res) => {
  try {
    const complaints = await selectAllRows(['complaints']);
    res.json(complaints);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch complaints' });
  }
});

app.put('/api/complaints/:id', requireAdmin, async (req, res) => {
  try {
    const comp = await updateRowById(['complaints'], req.params.id, req.body);
    res.json(comp);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to update complaint' });
  }
});

// --- Phone View Increment ---
app.post('/api/properties/:id/phone-view', abuseLimiter, async (req, res) => {
  const prop = await getPropertyById(req.params.id);
  if (prop) {
    await updatePropertyById(prop.id, {
      phoneViews: (prop.phoneViews || 0) + 1
    });
    res.json({ success: true });
  } else {
    res.status(404).json({error: 'Not found'});
  }
});

app.get('/api/supervisors', async (req, res) => {
  res.json(await db.supervisors.getAll());
});

app.post('/api/supervisors', requireSuperAdmin, async (req, res) => {
    const { name, username, secretCode, permissions } = req.body;
  if (!name || !username || !secretCode) return res.status(400).json({ error: 'يرجى تزويد كافة الحقول الإلزامية للمشرف!' });

  const supervisors = await db.supervisors.getAll();
  if (supervisors.some(s => s.username === username) || username === 'abdullah') {
    return res.status(400).json({ error: 'اسم المستخدم هذا محجوز مسبقاً، يرجى اختيار اسم مستخدم آخر!' });
  }

  const newSupervisor: Supervisor = {
    id: 'sv-' + Date.now(),
    name, username, secretCode,
    permissions: permissions || { approveProperties: true, manageLocations: false, manageInbox: true, managePayments: false }
  };

  await db.supervisors.add(newSupervisor);
  res.status(201).json(newSupervisor);
});

app.put('/api/supervisors/:id', requireSuperAdmin, async (req, res) => {
    const s = await db.supervisors.getById(req.params.id);
  if (s) {
    await db.supervisors.update(s.id!, req.body);
    res.json({ ...s, ...req.body });
  } else {
    res.status(404).json({ error: 'المشرف غير موجود!' });
  }
});

app.delete('/api/supervisors/:id', requireSuperAdmin, async (req, res) => {
    await db.supervisors.remove(req.params.id);
  res.json({ success: true, message: 'تم حذف المشرف بنجاح!' });
});

app.get('/api/profiles', async (req, res) => {
    res.json(await db.profiles.getAll());
});

app.put('/api/profiles/:identity/status', requireAdmin, async (req, res) => {
    const identity = req.params.identity.trim().toLowerCase();
  const { status, banReason } = req.body;
  
  const profiles = await db.profiles.getAll();
  const profile = profiles.find(p => p.emailOrPhone.trim().toLowerCase() === identity);
  
  if (profile) {
    await db.profiles.update(profile.id!, { status, banReason });
    await db.activityLogs.add({
      id: 'log-' + Date.now(),
      userId: 'admin',
      action: 'update_user_status',
      details: `Changed status of ${identity} to ${status}`,
      timestamp: new Date().toISOString()
    });
    profile.status = status;
    profile.banReason = banReason;
    res.json(profile);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

app.put('/api/profiles/:identity/role', requireAdmin, async (req, res) => {
    const identity = req.params.identity.trim().toLowerCase();
  const { role } = req.body;
  const profiles = await db.profiles.getAll();
  const profile = profiles.find(p => p.emailOrPhone.trim().toLowerCase() === identity);
  if (profile) {
    await db.profiles.update(profile.id!, { role });
    profile.role = role;
    res.json(profile);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});


app.post('/api/logs', async (req, res) => {
  const newLog = {
    ...req.body,
    id: 'log-' + Date.now(),
    timestamp: new Date().toISOString()
  };
  await db.activityLogs.add(newLog);
  res.status(201).json(newLog);
});

app.get('/api/logs', async (req, res) => {
  res.json(await db.activityLogs.getAll());
});

app.get('/api/profiles/:identity', async (req, res) => {
  const identity = req.params.identity.trim().toLowerCase();
  const profiles = await db.profiles.getAll();
  const profile = profiles.find(p => p.emailOrPhone.trim().toLowerCase() === identity || p.customSlug.trim().toLowerCase() === identity);

  if (profile) {
    const { password, ...safeProfile } = profile;
    const allProps = await listProperties();
    const userProperties = allProps.filter(p => p.ownerEmailOrPhone && p.ownerEmailOrPhone.trim().toLowerCase() === profile.emailOrPhone.trim().toLowerCase() && p.isApproved);
    res.json({ profile: safeProfile, properties: userProperties });
  } else {
    if (identity.includes('@') || /^\+?[0-9]{8,15}$/.test(identity)) {
      const allProps = await listProperties();
      res.json({ 
        profile: null, 
        properties: allProps.filter(p => p.ownerEmailOrPhone && p.ownerEmailOrPhone.trim().toLowerCase() === identity && p.isApproved) 
      });
    } else {
      res.status(404).json({ error: 'المستخدم غير موجود!' });
    }
  }
});

app.post('/api/profiles', async (req, res) => {
  const { emailOrPhone, name, whatsapp, phone, avatar, coverImage, bio, customSlug } = req.body;
  const userId = req.headers['x-user-id'] as string;
  const isAdmin = (req as any).user && ((req as any).user.role === 'admin' || (req as any).user.role === 'super_admin' || (req as any).user.role === 'supervisor');
  
  if (!emailOrPhone || !name) return res.status(400).json({ error: 'يرجى تقديم البريد الإلكتروني/رقم الهاتف واسم العرض!' });

  if (!isAdmin && (!userId || userId.toLowerCase() !== emailOrPhone.trim().toLowerCase())) {
    return res.status(403).json({ error: 'Unauthorized to modify this profile' });
  }

  let slug = (customSlug || '').trim().toLowerCase().replace(/[^a-z0-9\u0600-\u06FF-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  if (!slug) slug = 'user-' + emailOrPhone.replace(/[^a-zA-Z0-9]/g, '');

  const profiles = await db.profiles.getAll();
  const slugConflict = profiles.some(p => p.customSlug.toLowerCase() === slug.toLowerCase() && p.emailOrPhone.trim().toLowerCase() !== emailOrPhone.trim().toLowerCase());

  if (slugConflict) return res.status(400).json({ error: 'رابط الصفحة الفريد هذا محجوز مسبقاً! يرجى اختيار رابط آخر.' });

  const existingProfile = profiles.find(p => p.emailOrPhone.trim().toLowerCase() === emailOrPhone.trim().toLowerCase());

  const profileData: CitizenProfile = {
    id: existingProfile ? existingProfile.id : 'user-' + Date.now(),
    emailOrPhone: emailOrPhone.trim(),
    name: name.trim(),
    whatsapp: (whatsapp || '').trim(),
    phone: (phone || '').trim(),
    avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    coverImage: coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    bio: (bio || '').trim(),
    customSlug: slug,
    isVerified: existingProfile ? existingProfile.isVerified : false,
    createdAt: existingProfile ? existingProfile.createdAt : new Date().toISOString(),
    password: existingProfile ? existingProfile.password : undefined,
    status: existingProfile ? existingProfile.status : 'active',
    role: existingProfile ? existingProfile.role : 'citizen',
    banReason: existingProfile ? existingProfile.banReason : undefined
  };

  if (existingProfile) {
    await db.profiles.update(existingProfile.id!, profileData);
  } else {
    await db.profiles.add(profileData);
  }

  const allProps = await listProperties();
  for (const p of allProps) {
    if (p.ownerEmailOrPhone && p.ownerEmailOrPhone.trim().toLowerCase() === emailOrPhone.trim().toLowerCase()) {
      await updatePropertyById(p.id, {
        advertiserName: profileData.name,
        advertiserPhone: profileData.phone || p.advertiserPhone,
        advertiserWhatsapp: profileData.whatsapp || p.advertiserWhatsapp
      });
    }
  }

  const { password: _p, ...safeProfile } = profileData;
  res.status(200).json(safeProfile);
});

app.get('/api/stats', async (req, res) => {
  const allProps = await listProperties();
  const allDeals = await db.deals.getAll();
  
  const activeProperties = allProps.filter(p => p.isApproved);
  const soldDeals = allDeals.filter(d => d.type === 'بيع');
  const rentDeals = allDeals.filter(d => d.type === 'تأجير');

  const totalSold = soldDeals.length;
  const totalRented = rentDeals.length;

  const avgDaysToSell = totalSold > 0 ? Math.round(soldDeals.reduce((acc, d) => acc + d.daysToComplete, 0) / totalSold) : 0;
  const avgDaysToRent = totalRented > 0 ? Math.round(rentDeals.reduce((acc, d) => acc + d.daysToComplete, 0) / totalRented) : 0;

  const highestSale = soldDeals.length > 0 ? Math.max(...soldDeals.map(d => d.price)) : 0;
  const highestRent = rentDeals.length > 0 ? Math.max(...rentDeals.map(d => d.price)) : 0;

  const regionsMap: Record<string, number> = {};
  allDeals.forEach(d => {
    const key = `${d.governorate} - ${d.district}`;
    regionsMap[key] = (regionsMap[key] || 0) + 1;
  });
  const activeRegions = Object.entries(regionsMap).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 3);

  const govPriceMap: Record<string, { totalSale: number, countSale: number, totalRent: number, countRent: number }> = {};
  activeProperties.forEach(p => {
    if (!govPriceMap[p.governorate]) govPriceMap[p.governorate] = { totalSale: 0, countSale: 0, totalRent: 0, countRent: 0 };
    if (p.status === 'للبيع' || p.status === 'مميز') {
      govPriceMap[p.governorate].totalSale += p.price;
      govPriceMap[p.governorate].countSale += 1;
    } else if (p.status === 'للإيجار') {
      govPriceMap[p.governorate].totalRent += p.price;
      govPriceMap[p.governorate].countRent += 1;
    }
  });

  const governorateStats = Object.entries(govPriceMap).map(([gov, data]) => {
    const govSoldDeals = allDeals.filter(d => d.governorate === gov && d.type === 'بيع');
    const govRentDeals = allDeals.filter(d => d.governorate === gov && d.type === 'تأجير');
    const avgSell = govSoldDeals.length > 0 ? Math.round(govSoldDeals.reduce((acc, d) => acc + d.daysToComplete, 0) / govSoldDeals.length) : 0;
    const avgRent = govRentDeals.length > 0 ? Math.round(govRentDeals.reduce((acc, d) => acc + d.daysToComplete, 0) / govRentDeals.length) : 0;
    
    return {
      governorate: gov,
      avgSalePrice: data.countSale > 0 ? Math.round(data.totalSale / data.countSale) : 0,
      avgRentPrice: data.countRent > 0 ? Math.round(data.totalRent / data.countRent) : 0,
      totalSold: govSoldDeals.length,
      totalRented: govRentDeals.length,
      avgDaysToSell: avgSell,
      avgDaysToRent: avgRent
    };
  });

  res.json({
    activeCount: activeProperties.length,
    pendingCount: allProps.filter(p => !p.isApproved).length,
    soldCount: totalSold,
    rentedCount: totalRented,
    avgDaysToSell, avgDaysToRent, highestSale, highestRent,
    activeRegions, governorateStats
  });
});

// ── DigitalOcean Spaces Image Upload Endpoint ─────────────────────────────────
app.post('/api/upload-images', requireAuth, async (req: any, res: any) => {
  try {
    const { propertyId, files } = req.body as {
      propertyId?: string;
      files?: Array<{ name: string; type: string; base64: string }>;
    };

    if (!propertyId || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ success: false, message: 'propertyId and at least one file are required.' });
    }

    if (files.length > 30) {
      return res.status(400).json({ success: false, message: 'Cannot upload more than 30 files at once.' });
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    const urls: string[] = [];
    for (const file of files) {
      if (!allowedMimeTypes.includes(file.type)) {
        return res.status(400).json({ success: false, message: `Invalid file type: ${file.type}` });
      }

      if (!file.base64 || !file.base64.startsWith('data:')) {
        return res.status(400).json({ success: false, message: 'Invalid base64 payload.' });
      }

      const base64Data = file.base64.replace(/^data:[^;]+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      if (buffer.length > 10 * 1024 * 1024) { // 10 MB max per image
        return res.status(400).json({ success: false, message: 'File exceeds 10 MB limit.' });
      }

      const url = await uploadFileToSpaces(propertyId, file.name, buffer, file.type);
      urls.push(url);
    }

    res.json({ success: true, urls });
  } catch (err: any) {
    console.error('[upload-images] Error:', err.message);
    res.status(500).json({ success: false, message: err.message || 'Upload failed.' });
  }
});

async function startServer() {
  if (process.env.VITE_DEV === 'true') {
    const { createServer: createViteServer } = await Function('return import("vite")')();
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(`[Error] ${req.method} ${req.path} ->`, err.message || err);
    res.status(500).json({ 
      success: false, 
      message: err.message || 'حدث خطأ في الخادم' 
    });
  });

  if (process.env.VITE_DEV === 'true' || (process.env.NODE_ENV === 'production' && !process.env.LAMBDA_TASK_ROOT && !process.env.AWS_EXECUTION_ENV && !process.env.AWS_LAMBDA_FUNCTION_NAME && !process.env.NETLIFY)) {
    app.listen(PORT, '0.0.0.0', () => console.log(`Server running at http://0.0.0.0:${PORT}`));
  }
}

startServer();

export { app };

app.post('/api/agreements/scan-history', abuseLimiter, async (req, res) => {
  try {
    const { serialNumber, device, browser } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    
    // We can add it to an ActivityLog or a specific collection
    await db.activityLogs.add({
      id: 'scan-' + Date.now() + Math.random().toString(36).substring(2, 6),
      userId: 'system',
      // userType: 'system',
      action: 'qr_scan',
      details: `Correspondence ${serialNumber} scanned`,
      // targetId: serialNumber,
      timestamp: new Date().toISOString(),
      // Add extra info if needed, but for now we put it in details
    });
    
    // Actually the prompt said: "Record every QR scan. Store: Date, Time, Correspondence Number, Device, Browser, IP Address (if available)".
    // So let's create a dedicated 'scan_history' collection or use db.firestore directly.
    const { doc, setDoc } = require('firebase/firestore');
    const scanId = 'scan-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8);
    await setDoc(doc(firestore, 'scan_history', scanId), {
      serialNumber,
      device,
      browser,
      ip: ip ? ip.toString() : 'Unknown',
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString('en-GB'),
      time: new Date().toLocaleTimeString('en-GB'),
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
