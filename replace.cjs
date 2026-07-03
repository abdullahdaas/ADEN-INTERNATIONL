const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `app.post('/api/citizen-login', async (req, res) => {
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
});`;

const replacement = `app.post('/api/citizen-register', async (req, res) => {
  try {
    const { emailOrPhone, password, name } = req.body;
    if (!emailOrPhone || !password) {
      return res.status(400).json({ success: false, message: 'يرجى إدخال جميع البيانات المطلوبة!' });
    }
    const identity = emailOrPhone.trim().toLowerCase();
    const profiles = await db.profiles.getAll();
    let existing = profiles.find(p => p.emailOrPhone.trim().toLowerCase() === identity);
    
    if (existing) {
      return res.status(400).json({ success: false, message: 'هذا الحساب مسجل مسبقاً، يرجى تسجيل الدخول.' });
    }

    const newProfile = {
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
    return res.json({ success: true, profile: safeProfile });
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
    const profiles = await db.profiles.getAll();
    let profile = profiles.find(p => p.emailOrPhone.trim().toLowerCase() === identity);

    if (!profile) {
      return res.status(404).json({ success: false, message: 'الحساب غير موجود! يرجى إنشاء حساب جديد.' });
    }

    if (profile.status === 'banned') return res.status(403).json({ success: false, message: 'محظور' });
    if (profile.status === 'suspended') return res.status(403).json({ success: false, message: 'معطل' });

    if (profile.password && profile.password !== password) {
      return res.status(401).json({ success: false, message: 'كلمة المرور غير صحيحة!' });
    }

    if (!profile.password) {
      await db.profiles.update(profile.id, { password });
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
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "حدث خطأ أثناء تسجيل الدخول" });
  }
});`;

code = code.replace(target, replacement);
fs.writeFileSync('server.ts', code);
console.log("Replaced successfully!");
