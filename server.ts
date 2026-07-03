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

app.get('/api/agreements', async (req, res) => {
  if (req.headers['x-admin'] !== 'true') return res.status(403).json({ error: 'Unauthorized' });
  res.json(await db.agreements.getAll());
});

app.post('/api/agreements', async (req, res) => {
  try {
    const agreement = req.body;
    agreement.id = Date.now().toString(36) + Math.random().toString(36).substr(2); // UUID-like
    agreement.createdAt = new Date().toISOString();
    agreement.status = 'pending_approval';
    await db.agreements.add(agreement);
    res.json({ success: true, agreement });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
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


app.get('/api/properties', async (req, res) => {
  let list = await db.properties.getAll();
  
  const userId = req.headers['x-user-id'] as string;
  const isAdmin = req.headers['x-admin'] === 'true';

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

app.post('/api/properties', async (req, res) => {
  const isAdmin = req.headers['x-admin'] === 'true';
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

app.put('/api/properties/:id', async (req, res) => {
  const isAdmin = req.headers['x-admin'] === 'true';
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
});

app.delete('/api/properties/:id', async (req, res) => {
  const isAdmin = req.headers['x-admin'] === 'true';
  const userId = req.headers['x-user-id'] as string;
  const p = await db.properties.getById(req.params.id);
  
  if (p) {
    const isOwner = userId && p.ownerEmailOrPhone && p.ownerEmailOrPhone.toLowerCase() === userId.toLowerCase();
    
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this property' });
    }

    await db.properties.remove(p.id!);
    
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

app.get('/api/deals', async (req, res) => {
  res.json(await db.deals.getAll());
});

app.get('/api/messages', async (req, res) => {
  if (req.headers['x-admin'] !== 'true') return res.status(403).json({success: false, message: 'Unauthorized'});
  res.json(await db.messages.getAll());
});

app.post('/api/messages', async (req, res) => {
  const newMessage: ContactMessage = {
    ...req.body,
    id: 'msg-' + Date.now(),
    createdAt: new Date().toISOString(),
    isRead: false
  };
  await db.messages.add(newMessage);
  res.status(201).json(newMessage);
});

app.put('/api/messages/:id/read', async (req, res) => {
  if (req.headers['x-admin'] !== 'true') return res.status(403).json({ error: 'Unauthorized' });
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
  const isAdmin = req.headers['x-admin'] === 'true';
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

app.post('/api/payments', async (req, res) => {
  const newProof: PaymentProof = {
    ...req.body,
    id: 'pay-' + Date.now(),
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  await db.payments.add(newProof);
  res.status(201).json(newProof);
});

app.put('/api/payments/:id/status', async (req, res) => {
  if (req.headers['x-admin'] !== 'true') return res.status(403).json({ error: 'Unauthorized' });
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
  const isAdmin = req.headers['x-admin'] === 'true';
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

app.post('/api/visits', async (req, res) => {
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

app.put('/api/visits/:id', async (req, res) => {
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

app.post('/api/auctions/:propertyId/bids', async (req, res) => {
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
  const isAdmin = req.headers['x-admin'] === 'true';
  const allOffers = await db.offers.getAll();
  
  if (isAdmin) return res.json(allOffers);
  if (!userId) return res.json([]);
  
  res.json(allOffers.filter(o => o.buyerId === userId || o.ownerId === userId));
});

app.post('/api/offers', async (req, res) => {
  const newOffer = {
    ...req.body,
    id: 'offer-' + Date.now(),
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  await db.offers.add(newOffer);
  res.status(201).json(newOffer);
});

app.put('/api/offers/:id', async (req, res) => {
  const offer = await db.offers.getById(req.params.id);
  if (!offer) return res.status(404).json({error: 'Not found'});
  await db.offers.update(offer.id, req.body);
  res.json(await db.offers.getById(offer.id));
});

// --- Complaints ---
app.post('/api/complaints', async (req, res) => {
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

app.put('/api/complaints/:id', async (req, res) => {
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

app.post('/api/supervisors', async (req, res) => {
  if (req.headers['x-admin'] !== 'true') return res.status(403).json({ error: 'Unauthorized' });
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

app.put('/api/supervisors/:id', async (req, res) => {
  if (req.headers['x-admin'] !== 'true') return res.status(403).json({ error: 'Unauthorized' });
  const s = await db.supervisors.getById(req.params.id);
  if (s) {
    await db.supervisors.update(s.id!, req.body);
    res.json({ ...s, ...req.body });
  } else {
    res.status(404).json({ error: 'المشرف غير موجود!' });
  }
});

app.delete('/api/supervisors/:id', async (req, res) => {
  if (req.headers['x-admin'] !== 'true') return res.status(403).json({ error: 'Unauthorized' });
  await db.supervisors.remove(req.params.id);
  res.json({ success: true, message: 'تم حذف المشرف بنجاح!' });
});

app.get('/api/profiles', async (req, res) => {
  if (req.headers['x-admin'] !== 'true') return res.status(403).json({success: false, message: 'Unauthorized'});
  res.json(await db.profiles.getAll());
});

app.put('/api/profiles/:identity/status', async (req, res) => {
  if (req.headers['x-admin'] !== 'true') return res.status(403).json({ error: 'Unauthorized' });
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

app.put('/api/profiles/:identity/role', async (req, res) => {
  if (req.headers['x-admin'] !== 'true') return res.status(403).json({ error: 'Unauthorized' });
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
  const isAdmin = req.headers['x-admin'] === 'true';
  
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

  const avgDaysToSell = totalSold > 0 ? Math.round(soldDeals.reduce((acc, d) => acc + d.daysToComplete, 0) / totalSold) : 12;
  const avgDaysToRent = totalRented > 0 ? Math.round(rentDeals.reduce((acc, d) => acc + d.daysToComplete, 0) / totalRented) : 5;

  const highestSale = soldDeals.length > 0 ? Math.max(...soldDeals.map(d => d.price)) : 750000000;
  const highestRent = rentDeals.length > 0 ? Math.max(...rentDeals.map(d => d.price)) : 1500000;

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
  if (process.env.NODE_ENV !== 'production' && !process.env.NETLIFY) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else if (!process.env.NETLIFY) {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled server error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  });

  if (!process.env.NETLIFY && process.env.NODE_ENV !== 'test' && !process.env.LAMBDA_TASK_ROOT) {
    app.listen(PORT, '0.0.0.0', () => console.log(`Server running at http://0.0.0.0:${PORT}`));
  }
}

startServer();

export { app };
