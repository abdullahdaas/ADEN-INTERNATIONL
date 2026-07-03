const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

if (!code.includes('import bcrypt')) {
    code = "import bcrypt from 'bcryptjs';\n" + code;
}

const oldRegister = `app.post('/api/citizen-register', async (req, res) => {
  try {
    const { emailOrPhone, password, name } = req.body;
    if (!emailOrPhone || !password || !name) {
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
      name: name.trim(),
      whatsapp: '',
      phone: emailOrPhone.trim(),
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
});`;

const newRegister = `app.post('/api/citizen-register', async (req, res) => {
  try {
    const { emailOrPhone, password, name } = req.body;
    if (!emailOrPhone || !password || !name) {
      return res.status(400).json({ success: false, message: 'يرجى إدخال جميع البيانات المطلوبة!' });
    }

    const identity = emailOrPhone.trim().toLowerCase();
    
    // Check if user already exists
    const existingProfiles = await db.profiles.getByField('emailOrPhone', identity);
    let existing = existingProfiles[0];
    
    // Also check standard matching just in case
    if (!existing) {
        const all = await db.profiles.getAll();
        existing = all.find(p => p.emailOrPhone.trim().toLowerCase() === identity);
    }
    
    if (existing) {
      return res.status(400).json({ success: false, message: 'هذا الحساب مسجل مسبقاً، يرجى تسجيل الدخول.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newProfile = {
      id: 'user-' + Date.now(),
      emailOrPhone: identity,
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
    return res.json({ success: true, profile: safeProfile });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, message: "حدث خطأ أثناء إنشاء الحساب" });
  }
});`;

const oldLogin = `app.post('/api/citizen-login', async (req, res) => {
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

const newLogin = `app.post('/api/citizen-login', async (req, res) => {
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
      return res.status(401).json({ success: false, message: 'كلمة المرور غير صحيحة!' });
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

code = code.replace(oldRegister, newRegister);
code = code.replace(oldLogin, newLogin);

fs.writeFileSync('server.ts', code);
console.log("Updated server.ts auth logic");
