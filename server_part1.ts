import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './src/data/db';
import { INITIAL_PROPERTIES, INITIAL_AGENTS, INITIAL_DEALS } from './src/data/mockData';
import { Property, Agent, CompletedDeal, ContactMessage, PaymentProof, Supervisor, CitizenProfile, ActivityLog, UserNotification, PlatformSettings, OTPLog } from './src/types';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));

// In-memory OTP Cache
const activeOTPs = new Map<string, { code: string; expiresAt: number; attempts: number }>();

// Load database or seed it
async function seedDatabase() {
  try {
    const props = await db.properties.getAll();
    if (props.length === 0) {
      console.log('Database empty. Seeding with initial mock data...');
      for (const p of INITIAL_PROPERTIES) await db.properties.add(p);
      for (const a of INITIAL_AGENTS) await db.agents.add(a);
      for (const d of INITIAL_DEALS) await db.deals.add(d);
      
      await db.messages.add({
        id: 'msg-1',
        name: 'احمد الركابي',
        phone: '07801122334',
        email: 'ahmed@gmail.com',
        subject: 'استفسار عن فيلا المنصور',
        message: 'السلام عليكم، هل السعر المعروض للفيلا قابل للتفاوض؟ وهل يمكن جدولة موعد لزيارتها ومعاينتها ميدانياً؟ شكراً لكم.',
        propertyId: 'prop-1',
        createdAt: new Date().toISOString(),
        isRead: false,
        type: 'request'
      });
      console.log('Database seeded successfully.');
    }
  } catch (error) {
    console.error('Error loading database:', error);
  }
}

seedDatabase();

// --- REST API ENDPOINTS ---

// OTP Endpoints
app.post('/api/otp/send', async (req, res) => {
  const { phone } = req.body;
  if (!phone || !/^(\+?\d{8,15})$/.test(phone)) {
    return res.status(400).json({ success: false, message: 'يرجى إدخال رقم هاتف صحيح.' });
  }

  const code = Math.floor(1000 + Math.random() * 9000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

  const existing = activeOTPs.get(phone);
  if (existing && existing.expiresAt - Date.now() > 4 * 60 * 1000) {
     return res.status(429).json({ success: false, message: 'يرجى الانتظار قبل طلب رمز جديد.' });
  }

  activeOTPs.set(phone, { code, expiresAt, attempts: 0 });

  await db.otpLogs.add({
    id: 'otp-' + Date.now(),
    phone,
    status: 'success',
    attempts: 0,
    createdAt: new Date().toISOString()
  });

  const settings = await db.settings.get();
  if (settings.isOtpEnabled && settings.smsProvider !== 'mock') {
    console.log(`[REAL SMS VIA ${settings.smsProvider}] Sending OTP ${code} to ${phone}`);
  } else {
    console.log(`[MOCK OTP] Code for ${phone} is: ${code}`);
  }

  res.json({ success: true, message: 'تم إرسال رمز التحقق بنجاح.' });
});

app.post('/api/otp/verify', async (req, res) => {
  const { phone, code, name } = req.body;
  const settings = await db.settings.get();
  
  if (!phone || (!code && settings.isOtpEnabled)) {
    return res.status(400).json({ success: false, message: 'رقم الهاتف والرمز مطلوبان.' });
  }

  if (settings.isOtpEnabled) {
    const otpData = activeOTPs.get(phone);
    const logs = await db.otpLogs.getAll();
    const logEntry = logs.find(l => l.phone === phone && l.status === 'success');

    if (!otpData) {
      return res.status(400).json({ success: false, message: 'لا توجد عملية تحقق نشطة لهذا الرقم.' });
    }

    if (Date.now() > otpData.expiresAt) {
      activeOTPs.delete(phone);
      if (logEntry) await db.otpLogs.update(logEntry.id!, { status: 'expired' });
      return res.status(400).json({ success: false, message: 'انتهت صلاحية الرمز، يرجى طلب رمز جديد.' });
    }

    if (otpData.attempts >= 5) {
      activeOTPs.delete(phone);
      if (logEntry) await db.otpLogs.update(logEntry.id!, { status: 'failed' });
      return res.status(403).json({ success: false, message: 'تم تجاوز الحد الأقصى للمحاولات، يرجى طلب رمز جديد.' });
    }

    if (otpData.code !== code) {
      otpData.attempts += 1;
      if (logEntry) await db.otpLogs.update(logEntry.id!, { attempts: otpData.attempts });
      return res.status(400).json({ success: false, message: 'الرمز غير صحيح.' });
    }

    activeOTPs.delete(phone);
  }

  const profiles = await db.profiles.getAll();
  let profile = profiles.find(p => p.emailOrPhone.trim().toLowerCase() === phone.trim().toLowerCase());
  
  if (profile) {
    if (profile.status === 'banned') return res.status(403).json({ success: false, message: `هذا الحساب محظور.` });
    if (profile.status === 'suspended') return res.status(403).json({ success: false, message: 'هذا الحساب معطل مؤقتاً.' });
  } else {
    profile = {
      id: 'user-' + Date.now(),
      emailOrPhone: phone.trim().toLowerCase(),
      name: name || 'مستخدم جديد',
      whatsapp: '',
      phone: phone.trim(),
      avatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&q=80',
      coverImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80',
      bio: '',
      customSlug: `user-${Date.now()}`,
      isVerified: true,
      createdAt: new Date().toISOString(),
      status: 'active',
      role: 'citizen'
    };
    await db.profiles.add(profile);
  }

  await db.activityLogs.add({
    id: 'log-' + Date.now(),
    userId: profile.emailOrPhone,
    action: 'LOGIN',
    details: 'تسجيل دخول ناجح عبر OTP',
    timestamp: new Date().toISOString()
  });

  const { password, ...safeProfile } = profile;
  res.json({ success: true, profile: safeProfile });
});

app.post('/api/citizen-login', async (req, res) => {
  const { emailOrPhone, password, name } = req.body;
  if (!emailOrPhone || !password) return res.status(400).json({ success: false, message: 'يرجى إدخال البيانات!' });

  const identity = emailOrPhone.trim().toLowerCase();
  const profiles = await db.profiles.getAll();
  let profile = profiles.find(p => p.emailOrPhone.trim().toLowerCase() === identity);

  if (profile) {
    if (profile.status === 'banned') return res.status(403).json({ success: false, message: 'محظور' });
    if (profile.status === 'suspended') return res.status(403).json({ success: false, message: 'معطل' });

    if (profile.password && profile.password !== password) {
      return res.status(401).json({ success: false, message: 'كلمة المرور غير صحيحة!' });
    }
    if (!profile.password) {
      await db.profiles.update(profile.id!, { password });
      profile.password = password;
    }
    
    await db.activityLogs.add({
      id: 'log-' + Date.now(),
      userId: profile.emailOrPhone,
      action: 'login',
      details: 'User logged in',
      timestamp: new Date().toISOString()
    });

    const { password: _p, ...safeProfile } = profile;
    return res.json({ success: true, profile: safeProfile });
  } else {
    const newProfile: CitizenProfile = {
      id: 'user-' + Date.now(),
      emailOrPhone: emailOrPhone.trim(),
      name: name || identity.split('@')[0],
      whatsapp: '',
      phone: '',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      bio: '',
      customSlug: 'user-' + Date.now(),
      isVerified: false,
      password: password,
      status: 'active',
      role: 'citizen',
      createdAt: new Date().toISOString()
    };
    await db.profiles.add(newProfile);

    await db.activityLogs.add({
      id: 'log-' + Date.now(),
      userId: newProfile.emailOrPhone,
      action: 'register',
      details: 'New user registered',
      timestamp: new Date().toISOString()
    });
    
    const { password: _p, ...safeProfile } = newProfile;
    return res.json({ success: true, profile: safeProfile });
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

app.put('/api/settings', async (req, res) => {
  if (req.headers['x-admin'] !== 'true') return res.status(403).json({ error: 'Unauthorized' });
  await db.settings.update(req.body);
  res.json(await db.settings.get());
});

app.get('/api/otp/logs', async (req, res) => {
  if (req.headers['x-admin'] !== 'true') return res.status(403).json({success: false, message: 'Unauthorized'});
  res.json(await db.otpLogs.getAll());
});

// Part 1
