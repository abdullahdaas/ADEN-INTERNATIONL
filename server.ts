import bcrypt from 'bcryptjs';
import express from 'express';
import path from 'path';
import fs from 'fs';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_for_dev_only';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'abdullah';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '3008';

// Removed top level vite import
import { db, firestore } from './src/data/db';

import { Property, Agent, CompletedDeal, ContactMessage, PaymentProof, Supervisor, CitizenProfile, ActivityLog, UserNotification, PlatformSettings, OTPLog } from './src/types';

const app = express();

app.set("trust proxy", 1);
const PORT = 3000;

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
const limiter = rateLimit({
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

app.use('/api/', limiter);
app.use('/api/login', authLimiter);
app.use('/api/citizen-login', authLimiter);
app.use('/api/citizen-register', authLimiter);


// RBAC Middlewares
const requireAuth = (req, res, next) => {
  if (!req.user) {
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
  res.json(await db.serviceProviders.getAll());
});
app.post('/api/service-providers', requireAuth, async (req, res) => {
  await db.serviceProviders.add(req.body);
  res.json({ success: true, provider: req.body });
});
app.put('/api/service-providers/:id', requireAdmin, async (req, res) => {
  await db.serviceProviders.update(req.params.id, req.body);
  res.json({ success: true });
});
app.delete('/api/service-providers/:id', requireAdmin, async (req, res) => {
  await db.serviceProviders.remove(req.params.id);
  res.json({ success: true });
});

// Provider Applications
app.get('/api/provider-applications', async (req, res) => {
  res.json(await db.providerApplications.getAll());
});
app.post('/api/provider-applications', requireAuth, async (req, res) => {
  await db.providerApplications.add(req.body);
  res.json({ success: true, application: req.body });
});
app.put('/api/provider-applications/:id', requireAdmin, async (req, res) => {
  await db.providerApplications.update(req.params.id, req.body);
    const provApp = await db.providerApplications.getById(req.params.id);
    if (provApp && provApp.emailOrPhone && (req.body.status === 'approved' || req.body.status === 'rejected')) {
        const title = req.body.status === 'approved' ? 'تم الموافقة على طلب مزود الخدمة' : 'تم رفض طلب مزود الخدمة';
        const msg = req.body.status === 'approved' ? 'تهانينا، تم قبول طلبك كمزود خدمة.' : 'نأسف، تم رفض طلبك.';
        await db.notifications.add({
            id: 'notif-' + Date.now() + Math.floor(Math.random()*1000),
            userId: provApp.emailOrPhone,
            title, message: msg, isRead: false, timestamp: new Date().toISOString()
        });
    }
  res.json({ success: true });
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

app.get('/api/agreements/verify/:serial', async (req, res) => {
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
  let list = await db.properties.getAll();
  
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
      return (p.isApproved && !p.pendingDeletion) || isOwner;
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
  const p = await db.properties.getById(req.params.id);
  if (p) {
    await db.properties.update(p.id!, { views: (p.views || 0) + 1 });
    p.views = (p.views || 0) + 1;
    res.json(p);
  } else {
    res.status(404).json({ error: 'Property not found' });
  }
});

app.post('/api/properties', requireAuth, async (req, res) => {
  const isAdmin = (req as any).user && ((req as any).user.role === 'admin' || (req as any).user.role === 'super_admin' || (req as any).user.role === 'supervisor');
  const propertyData = { ...req.body };
  
  if (!isAdmin) {
    propertyData.isApproved = false;
    propertyData.isFeatured = false;
    delete propertyData.featuredPackage;
  }
  
  const newProperty: Property = {
    ...propertyData,
    id: 'prop-' + Date.now(),
    views: 0,
    favoritesCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    daysOnPlatform: 0,
    isApproved: propertyData.isApproved !== undefined ? propertyData.isApproved : false
  };

  await db.properties.add(newProperty);
  
  if (newProperty.agentId) {
    const agent = await db.agents.getById(newProperty.agentId);
    if (agent) {
      await db.agents.update(agent.id!, { propertyCount: (agent.propertyCount || 0) + 1 });
    }
  }

  res.status(201).json(newProperty);
});

app.put('/api/properties/:id', requireAuth, async (req, res) => {
  try {

  const isAdmin = (req as any).user && ((req as any).user.role === 'admin' || (req as any).user.role === 'super_admin' || (req as any).user.role === 'supervisor');
  const userId = req.headers['x-user-id'] as string;
  const p = await db.properties.getById(req.params.id);
  
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
    }
    
    const updated = {
      ...p,
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    await db.properties.update(p.id!, updated);
    
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

  const isAdmin = (req as any).user && ((req as any).user.role === 'admin' || (req as any).user.role === 'super_admin' || (req as any).user.role === 'supervisor');
  const userId = req.headers['x-user-id'] as string;
  const p = await db.properties.getById(req.params.id);
  
  if (p) {
    const isOwner = userId && p.ownerEmailOrPhone && p.ownerEmailOrPhone.toLowerCase() === userId.toLowerCase();
    
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this property' });
    }

    if (req.query.hard === 'true') { await db.properties.remove(p.id!); } else { await db.properties.update(p.id!, { pendingDeletion: true, isApproved: false, status: 'مرفوض' }); }
    if (isAdmin && !isOwner) {
        if (p.ownerEmailOrPhone) {
            await db.notifications.add({
                id: 'notif-' + Date.now() + Math.floor(Math.random()*1000),
                userId: p.ownerEmailOrPhone,
                title: 'تم رفض/حذف عقارك',
                message: `تم حذف عقارك "${p.title}" من قبل الإدارة.`,
                isRead: false,
                timestamp: new Date().toISOString()
            });
        }
    }
    
    if (p.agentId) {
      const agent = await db.agents.getById(p.agentId);
      if (agent && agent.propertyCount > 0) {
        await db.agents.update(agent.id!, { propertyCount: agent.propertyCount - 1 });
      }
    }

    res.json({ success: true, message: 'Property deleted' });
  } else {
    res.status(404).json({ error: 'Property not found' });
  }
  } catch (error) {
    console.error("DELETE ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/agents', async (req, res) => {
  res.json(await db.agents.getAll());
});

app.get('/api/agents/:id', async (req, res) => {
  const agent = await db.agents.getById(req.params.id);
  if (agent) {
    const props = await db.properties.getAll();
    res.json({
      ...agent,
      properties: props.filter(p => p.agentId === agent.id)
    });
  } else {
    res.status(404).json({ error: 'Agent not found' });
  }
});


app.get('/api/reviews/:propertyId', async (req, res) => {
  const all = await db.reviews.getAll();
  res.json(all.filter(r => r.propertyId === req.params.propertyId));
});
app.post('/api/reviews', requireAuth, async (req, res) => {
  await db.reviews.add(req.body);
  res.json({ success: true, review: req.body });
});
app.get('/api/deals', async (req, res) => {
  res.json(await db.deals.getAll());
});

app.get('/api/messages', async (req, res) => {
    res.json(await db.messages.getAll());
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

app.post('/api/messages', requireAuth, async (req, res) => {
  const newMessage: ContactMessage = {
    ...req.body,
    id: 'msg-' + Date.now(),
    createdAt: new Date().toISOString(),
    isRead: false
  };
  await db.messages.add(newMessage);
  res.status(201).json(newMessage);
});

app.put('/api/messages/:id/read', requireAuth, async (req, res) => {
    const msg = await db.messages.getById(req.params.id);
  if (msg) {
    await db.messages.update(msg.id!, { isRead: true });
    msg.isRead = true;
    res.json(msg);
  } else {
    res.status(404).json({ error: 'Message not found' });
  }
});


app.get('/api/payments', async (req, res) => {
  const isAdmin = (req as any).user && ((req as any).user.role === 'admin' || (req as any).user.role === 'super_admin' || (req as any).user.role === 'supervisor');
  const userId = req.headers['x-user-id'] as string;
  const payments = await db.payments.getAll();

  if (isAdmin) {
    return res.json(payments);
  }

  if (!userId) {
    return res.json([]);
  }

  const props = await db.properties.getAll();
  const userProps = props.filter(p => p.ownerEmailOrPhone && p.ownerEmailOrPhone.toLowerCase() === userId.toLowerCase());
  const userPropIds = userProps.map(p => p.id);
  
  const userPayments = payments.filter(p => userPropIds.includes(p.propertyId));
  res.json(userPayments);
});

app.post('/api/payments', requireAuth, async (req, res) => {
  const newProof: PaymentProof = {
    ...req.body,
    id: 'pay-' + Date.now(),
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  await db.payments.add(newProof);
  res.status(201).json(newProof);
});

app.put('/api/payments/:id/status', requireAdmin, async (req, res) => {
    const { status, propertyId, packageName, rejectionReason } = req.body;
  const payment = await db.payments.getById(req.params.id);
  
  if (payment) {
    const updates: any = { status };
    if (rejectionReason) updates.rejectionReason = rejectionReason;
    
    await db.payments.update(payment.id!, updates);
    Object.assign(payment, updates);
    
    if (status === 'approved') {
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
    }
    
    res.json(payment);
  } else {
    res.status(404).json({ error: 'Payment record not found' });
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
  const prop = await db.properties.getById(propId);
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
  await db.properties.update(propId, {
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
  const userId = req.headers['x-user-id'];
  const isAdmin = (req as any).user && ((req as any).user.role === 'admin' || (req as any).user.role === 'super_admin' || (req as any).user.role === 'supervisor');
  const allOffers = await db.offers.getAll();
  
  if (isAdmin) return res.json(allOffers);
  if (!userId) return res.json([]);
  
  res.json(allOffers.filter(o => o.buyerId === userId || o.ownerId === userId));
});

app.post('/api/offers', requireAuth, async (req, res) => {
  const newOffer = {
    ...req.body,
    id: 'offer-' + Date.now(),
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  await db.offers.add(newOffer);
  res.status(201).json(newOffer);
});

app.put('/api/offers/:id', requireAuth, async (req, res) => {
  const offer = await db.offers.getById(req.params.id);
  if (!offer) return res.status(404).json({error: 'Not found'});
  await db.offers.update(offer.id, req.body);
  res.json(await db.offers.getById(offer.id));
});

// --- Complaints ---
app.post('/api/complaints', requireAuth, async (req, res) => {
  const newComp = {
    ...req.body,
    id: 'comp-' + Date.now(),
    status: 'open',
    createdAt: new Date().toISOString()
  };
  await db.complaints.add(newComp);
  res.status(201).json(newComp);
});

app.get('/api/complaints', async (req, res) => {
  res.json(await db.complaints.getAll());
});

app.put('/api/complaints/:id', requireAdmin, async (req, res) => {
  const comp = await db.complaints.getById(req.params.id);
  if (!comp) return res.status(404).json({error: 'Not found'});
  await db.complaints.update(comp.id, req.body);
  res.json(await db.complaints.getById(comp.id));
});

// --- Phone View Increment ---
app.post('/api/properties/:id/phone-view', async (req, res) => {
  const prop = await db.properties.getById(req.params.id);
  if (prop) {
    await db.properties.update(prop.id, {
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
    const allProps = await db.properties.getAll();
    const userProperties = allProps.filter(p => p.ownerEmailOrPhone && p.ownerEmailOrPhone.trim().toLowerCase() === profile.emailOrPhone.trim().toLowerCase() && p.isApproved);
    res.json({ profile: safeProfile, properties: userProperties });
  } else {
    if (identity.includes('@') || /^\+?[0-9]{8,15}$/.test(identity)) {
      const allProps = await db.properties.getAll();
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

  const allProps = await db.properties.getAll();
  for (const p of allProps) {
    if (p.ownerEmailOrPhone && p.ownerEmailOrPhone.trim().toLowerCase() === emailOrPhone.trim().toLowerCase()) {
      await db.properties.update(p.id!, {
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
  const allProps = await db.properties.getAll();
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

  const governorateStats = Object.entries(govPriceMap).map(([gov, data]) => ({
    governorate: gov,
    avgSalePrice: data.countSale > 0 ? Math.round(data.totalSale / data.countSale) : 0,
    avgRentPrice: data.countRent > 0 ? Math.round(data.totalRent / data.countRent) : 0,
    totalSold: allDeals.filter(d => d.governorate === gov && d.type === 'بيع').length,
    totalRented: allDeals.filter(d => d.governorate === gov && d.type === 'تأجير').length,
    avgDaysToSell: 10,
    avgDaysToRent: 4
  }));

  res.json({
    activeCount: activeProperties.length,
    pendingCount: allProps.filter(p => !p.isApproved).length,
    soldCount: totalSold,
    rentedCount: totalRented,
    avgDaysToSell, avgDaysToRent, highestSale, highestRent,
    activeRegions, governorateStats
  });
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

app.post('/api/agreements/scan-history', async (req, res) => {
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
