import React, { useState, useEffect } from "react";
import {
  Download,
  ShieldAlert,
  LayoutDashboard,
  Building2,
  MessageSquare,
  CreditCard,
  Map,
  LogOut,
  Check,
  X,
  Shield,
  Star,
  Trash2,
  TrendingUp,
  AlertCircle,
  Sparkles,
  FolderSync,
  Plus,
  BadgeCheck,
  Eye,
  Users,
  History,
  Ban,
  Calendar,
  Banknote,
  FileSignature,
} from "lucide-react";
import {
  Property,
  ContactMessage,
  PaymentProof,
  CompletedDeal,
  LocationHierarchy,
  Supervisor,
} from "../types";
import {
  loginAdmin,
  fetchProperties,
  updateProperty,
  deleteProperty,
  fetchDeals,
  fetchMessages,
  markMessageRead,
  fetchPayments,
  updatePaymentStatus,
  fetchStats,
  fetchSupervisors,
  createSupervisor,
  deleteSupervisor,
  updateSupervisor,
  fetchAllProfiles,
  fetchOtpLogs,
  fetchVisits,
  fetchLogs,
  fetchOffers,
  fetchComplaints,
  updateOffer,
  updateComplaint,
} from "../utils/api";
import { formatPrice } from "./PropertyCard";
import { IRAQ_LOCATIONS } from "../data/mockData";
import { AdminMapEditor } from "./AdminMapEditor";
import { MapPin } from "lucide-react";
import ElectronicAgreementView from "./ElectronicAgreementView";

interface AdminPortalProps {
  onLogout: () => void;
  onRefreshProperties: () => void;
}

export default function AdminPortal({
  onLogout,
  onRefreshProperties,
}: AdminPortalProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Active Admin View State
  const [adminView, setAdminView] = useState<
    | "dashboard"
    | "properties"
    | "map"
    | "inbox"
    | "payments"
    | "locations"
    | "supervisors"
    | "users"
    | "logs"
    | "otp"
    | "auctions"
    | "visits"
    | "offers"
    | "complaints"
    | "finance"
    | "analytics"
    | "cms"
    | "ads"
    | "settings"
    | "services"
    | "agreements"
    | "agreement-payments"
  >("dashboard");
  const [selectedPaymentProof, setSelectedPaymentProof] = useState<any>(null);
  const [agreementRequests, setAgreementRequests] = useState([
    {
      id: "req_1",
      payerName: "أحمد محمود",
      phone: "07812345678",
      method: "zain_cash",
      amount: "25,000",
      date: new Date().toLocaleDateString("en-GB"),
      status: "pending",
    },
    {
      id: "req_2",
      payerName: "علي حسين",
      phone: "07712345678",
      method: "qi_card",
      amount: "25,000",
      date: "12/03/2024",
      status: "approved",
    },
  ]);

  const handleApproveRequest = (id: string) => {
    setAgreementRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "approved" } : r)),
    );
    alert("تم اعتماد الدفع وإصدار المكاتبة بنجاح");
  };

  const handleRejectRequest = (id: string) => {
    setAgreementRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "rejected" } : r)),
    );
    alert("تم رفض طلب الدفع");
  };

  const [profiles, setProfiles] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [otpLogs, setOtpLogs] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [auctionParticipants, setAuctionParticipants] = useState<any[]>([]);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [agreements, setAgreements] = useState<any[]>([]);
  const [selectedAgreementId, setSelectedAgreementId] = useState<string | null>(null);
  const [settings, setSettings] = useState<any>({
    mastercard: "",
    zainCash: "",
    isOtpEnabled: true,
    smsProvider: "mock",
    smsApiKey: "",
    smsApiSecret: "",
    smsSenderId: "",
  });
  const [selectedInspectProperty, setSelectedInspectProperty] =
    useState<Property | null>(null);

  // New Supervisor Form States
  const [newSvName, setNewSvName] = useState("");
  const [newSvUsername, setNewSvUsername] = useState("");
  const [newSvSecret, setNewSvSecret] = useState("");
  const [newSvPermApprove, setNewSvPermApprove] = useState(true);
  const [newSvPermLocations, setNewSvPermLocations] = useState(false);
  const [newSvPermInbox, setNewSvPermInbox] = useState(true);
  const [newSvPermPayments, setNewSvPermPayments] = useState(false);
  const [supervisorSuccess, setSupervisorSuccess] = useState("");
  const [supervisorError, setSupervisorError] = useState("");

  // Server state copies
  const [properties, setProperties] = useState<Property[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [payments, setPayments] = useState<PaymentProof[]>([]);
  const [deals, setDeals] = useState<CompletedDeal[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [locations, setLocations] =
    useState<LocationHierarchy[]>(IRAQ_LOCATIONS);

  // New Location Form State
  const [newGov, setNewGov] = useState("");
  const [newDist, setNewDist] = useState("");
  const [newSubDist, setNewSubDist] = useState("");
  const [newNeigh, setNewNeigh] = useState("");
  const [locationSuccess, setLocationSuccess] = useState("");

  // Notifications State (Alert center counts)
  const [notifs, setNotifs] = useState({
    unreadMsgs: 0,
    pendingProps: 0,
    pendingPayments: 0,
  });

  const loadAdminData = async () => {
    try {
      const allProps = await fetchProperties({ isApproved: "all" }); // Fetch ALL including pending and active
      const allMsgs = await fetchMessages();
      const allPays = await fetchPayments();
      const allDeals = await fetchDeals();
      const currentStats = await fetchStats();

      setProperties(allProps);
      setMessages(allMsgs);
      setPayments(allPays);
      setDeals(allDeals);
      setStats(currentStats);

      try {
        const p = await fetchAllProfiles();
        setProfiles(p);
      } catch (e) {}

      try {
        const l = await fetchLogs();
        setLogs(l);
      } catch (e) {}

      try {
        const o = await fetchOtpLogs();
        setOtpLogs(o);
      } catch (e) {}

      try {
        const v = await fetchVisits();
        setVisits(v);
      } catch (e) {}

      try {
        const o = await fetchOffers();
        setOffers(o);
      } catch (e) {}

      try {
        const c = await fetchComplaints();
        setComplaints(c);
      } catch (e) {}

      try {
        const res = await fetch('/api/agreements', { headers: { 'x-admin': 'true' }});
        if (res.ok) {
          const data = await res.json();
          setAgreements(data);
        }
      } catch (e) {}

      setNotifs({
        pendingProps: allProps.filter((p: any) => !p.isApproved).length,
        unreadMsgs: allMsgs.filter((m: any) => !m.isRead).length,
        pendingPayments: allPays.filter((p: any) => p.status === "pending")
          .length,
      });
    } catch (err) {
      console.error("Failed to load admin data", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAdminData();
    }
  }, [isAuthenticated, adminView]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    try {
      const data = await loginAdmin(username, password);
      if (data.success) {
        setIsAuthenticated(true);
        setAdminUser(data.user);
        localStorage.setItem("aden-user", JSON.stringify(data.user));
        localStorage.setItem("aden-admin-auth", "true");
      } else {
        setLoginError(data.message);
      }
    } catch (err) {
      setLoginError("فشل الاتصال بالخادم الإداري!");
    }
  };

  // Re-check persistent storage login
  useEffect(() => {
    if (localStorage.getItem("aden-admin-auth") === "true") {
      setIsAuthenticated(true);
      const cached = localStorage.getItem("aden-user");
      if (cached && cached !== "undefined") {
        try {
          setAdminUser(JSON.parse(cached));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const handleCreateSupervisor = async (e: React.FormEvent) => {
    e.preventDefault();
    setSupervisorSuccess("");
    setSupervisorError("");

    if (!newSvName || !newSvUsername || !newSvSecret) {
      setSupervisorError("يرجى ملء كافة الحقول المطلوبة!");
      return;
    }

    try {
      const payload = {
        name: newSvName,
        username: newSvUsername,
        secretCode: newSvSecret,
        permissions: {
          approveProperties: newSvPermApprove,
          manageLocations: newSvPermLocations,
          manageInbox: newSvPermInbox,
          managePayments: newSvPermPayments,
        },
      };

      await createSupervisor(payload);
      setSupervisorSuccess("تم إضافة المشرف بنجاح!");
      setNewSvName("");
      setNewSvUsername("");
      setNewSvSecret("");

      // Reload supervisors
      const svs = await fetchSupervisors();
      setSupervisors(svs);
    } catch (err: any) {
      setSupervisorError(err.message || "فشل في إضافة المشرف.");
    }
  };

  const handleDeleteSupervisor = async (id: string) => {
    if (
      !window.confirm(
        "هل أنت متأكد من رغبتك في إلغاء صلاحيات وحذف هذا المشرف نهائياً؟",
      )
    )
      return;
    try {
      await deleteSupervisor(id);
      const svs = await fetchSupervisors();
      setSupervisors(svs);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleSupervisorPermission = async (
    sv: Supervisor,
    permKey: keyof Supervisor["permissions"],
  ) => {
    try {
      const updatedPerms = {
        ...sv.permissions,
        [permKey]: !sv.permissions[permKey],
      };
      await updateSupervisor(sv.id, { permissions: updatedPerms });
      const svs = await fetchSupervisors();
      setSupervisors(svs);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("aden-admin-auth");
    onLogout();
  };

  const handleApproveProperty = async (id: string) => {
    try {
      await updateProperty(id, { isApproved: true, pendingDeletion: false });
      loadAdminData();
      onRefreshProperties();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProperty = async (id: string) => {
    if (!window.confirm("هل أنت متأكد من رغبتك في حذف هذا العقار نهائياً؟"))
      return;
    try {
      await deleteProperty(id);
      loadAdminData();
      onRefreshProperties();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkMessageRead = async (id: string) => {
    try {
      await markMessageRead(id);
      loadAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerifyPayment = async (
    payId: string,
    status: "approved" | "rejected",
    propertyId: string,
    packageName: string,
  ) => {
    try {
      let reason = undefined;
      if (status === "rejected") {
        reason = prompt("الرجاء إدخال سبب الرفض لإشعار المستخدم:");
        if (reason === null) return; // User cancelled prompt
      }
      await updatePaymentStatus(payId, status, propertyId, packageName, reason);
      loadAdminData();
      onRefreshProperties();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGov || !newDist || !newSubDist || !newNeigh) return;

    // Mutate locations in memory / local state
    const currentLocs = [...locations];
    let govObj = currentLocs.find((l) => l.governorate === newGov);

    if (!govObj) {
      govObj = { governorate: newGov, districts: [] };
      currentLocs.push(govObj);
    }

    let distObj = govObj.districts.find((d) => d.name === newDist);
    if (!distObj) {
      distObj = { name: newDist, subDistricts: [] };
      govObj.districts.push(distObj);
    }

    let subObj = distObj.subDistricts.find((s) => s.name === newSubDist);
    if (!subObj) {
      subObj = { name: newSubDist, neighborhoods: [] };
      distObj.subDistricts.push(subObj);
    }

    if (!subObj.neighborhoods.includes(newNeigh)) {
      subObj.neighborhoods.push(newNeigh);
    }

    setLocations(currentLocs);
    setNewNeigh("");
    setLocationSuccess("تمت إضافة المنطقة الجغرافية الجديدة بنجاح للمخطط!");
    setTimeout(() => setLocationSuccess(""), 4000);
  };

  // Auth Guard Screen render
  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-red-500/10 bg-slate-950 p-8 shadow-2xl shadow-black/80">
        <div className="text-center space-y-4 mb-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500">
            <ShieldAlert className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              بوابة الدخول للمسؤولين
            </h2>
            <p className="text-xs text-slate-400 font-sans mt-1">
              يجب تسجيل الدخول بصلاحيات الإدارة لمتابعة الطلبات والرسائل
            </p>
          </div>
        </div>

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              اسم المستخدم
            </label>
            <input
              type="text"
              required
              placeholder="اسم المستخدم..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-white/5 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-red-500/40"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              كلمة المرور الخاصة
            </label>
            <input
              type="password"
              required
              placeholder="••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/5 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-red-500/40 font-mono"
            />
          </div>

          {loginError && (
            <div className="rounded-lg bg-red-500/10 p-3 border border-red-500/20 text-xs text-red-400 flex items-center gap-1.5 font-sans">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <button
            id="btn-admin-login-submit"
            type="submit"
            className="w-full rounded-xl bg-red-600 hover:bg-red-500 px-4 py-3 text-sm font-bold text-white transition-all shadow-lg cursor-pointer"
          >
            تحقق وتسجيل دخول الإدارة
          </button>
        </form>
      </div>
    );
  }

  return (
    <div
      id="admin-portal-dashboard"
      className="grid grid-cols-1 gap-6 lg:grid-cols-4"
    >
      {/* Admin Panel Sidebar Controls */}
      <div className="lg:col-span-1 space-y-4">
        <div className="rounded-2xl border border-white/5 bg-slate-900/10 backdrop-blur-md p-5 space-y-6">
          {/* Header Title */}
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">
                {adminUser?.name || "عبدالله الدعاس"}
              </h3>
              <p className="text-[10px] text-red-400 font-sans mt-0.5">
                {adminUser?.isSupervisor
                  ? "مشرف المنصة المعتمد"
                  : "المدير العام للمنصة"}
              </p>
            </div>
          </div>

          {/* Views Toggles Menu */}
          <nav className="space-y-1 text-xs">
            {/* Dashboard */}
            <button
              onClick={() => setAdminView("dashboard")}
              className={`w-full flex items-center justify-between rounded-lg px-4 py-3 font-semibold transition-all ${
                adminView === "dashboard"
                  ? "bg-white/5 text-gold-prestige"
                  : "text-slate-300 hover:bg-white/5"
              }`}
            >
              <div className="flex items-center space-x-2.5 space-x-reverse">
                <LayoutDashboard className="h-4 w-4" />
                <span>لوحة التحكم الرئيسية</span>
              </div>
              <span className="bg-slate-900 text-slate-400 px-2 py-0.5 rounded-full font-mono font-bold text-[9px]">
                {deals.length} صفقة
              </span>
            </button>

            {/* Properties Approval Queue (Perm check) */}
            {(!adminUser?.isSupervisor ||
              adminUser?.permissions?.approveProperties) && (
              <button
                onClick={() => setAdminView("properties")}
                className={`w-full flex items-center justify-between rounded-lg px-4 py-3 font-semibold transition-all ${
                  adminView === "properties"
                    ? "bg-white/5 text-gold-prestige"
                    : "text-slate-300 hover:bg-white/5"
                }`}
              >
                <div className="flex items-center space-x-2.5 space-x-reverse">
                  <Building2 className="h-4 w-4" />
                  <span>إدارة طلبات العقارات</span>
                </div>
                {notifs.pendingProps > 0 && (
                  <span className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full font-mono font-black text-[9px] animate-pulse">
                    {notifs.pendingProps} معلق
                  </span>
                )}
              </button>
            )}

            {/* Properties Map Editor */}
            {(!adminUser?.isSupervisor ||
              adminUser?.permissions?.manageLocations) && (
              <button
                onClick={() => setAdminView("map")}
                className={`w-full flex items-center justify-between rounded-lg px-4 py-3 font-semibold transition-all ${
                  adminView === "map"
                    ? "bg-white/5 text-gold-prestige"
                    : "text-slate-300 hover:bg-white/5"
                }`}
              >
                <div className="flex items-center space-x-2.5 space-x-reverse">
                  <MapPin className="h-4 w-4" />
                  <span>الخريطة الإدارية الشاملة</span>
                </div>
              </button>
            )}

            {/* General Inbox Messages (Perm check) */}
            {(!adminUser?.isSupervisor ||
              adminUser?.permissions?.manageInbox) && (
              <button
                onClick={() => setAdminView("inbox")}
                className={`w-full flex items-center justify-between rounded-lg px-4 py-3 font-semibold transition-all ${
                  adminView === "inbox"
                    ? "bg-white/5 text-gold-prestige"
                    : "text-slate-300 hover:bg-white/5"
                }`}
              >
                <div className="flex items-center space-x-2.5 space-x-reverse">
                  <MessageSquare className="h-4 w-4" />
                  <span>صندوق الوارد الإداري</span>
                </div>
                {notifs.unreadMsgs > 0 && (
                  <span className="bg-red-500 text-white px-2 py-0.5 rounded-full font-mono font-bold text-[9px] animate-bounce">
                    {notifs.unreadMsgs} جديد
                  </span>
                )}
              </button>
            )}

            {/* Featured Packages payments proof (Perm check) */}
            {(!adminUser?.isSupervisor ||
              adminUser?.permissions?.managePayments) && (
              <button
                onClick={() => setAdminView("payments")}
                className={`w-full flex items-center justify-between rounded-lg px-4 py-3 font-semibold transition-all ${
                  adminView === "payments"
                    ? "bg-white/5 text-gold-prestige"
                    : "text-slate-300 hover:bg-white/5"
                }`}
              >
                <div className="flex items-center space-x-2.5 space-x-reverse">
                  <CreditCard className="h-4 w-4" />
                  <span>التحققات وإثباتات الدفع</span>
                </div>
                {notifs.pendingPayments > 0 && (
                  <span className="bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full font-mono font-black text-[9px] animate-pulse">
                    {notifs.pendingPayments} معلق
                  </span>
                )}
              </button>
            )}

            {/* Geographical Hierarchy setup (Perm check) */}
            {(!adminUser?.isSupervisor ||
              adminUser?.permissions?.manageLocations) && (
              <button
                onClick={() => setAdminView("locations")}
                className={`w-full flex items-center justify-between rounded-lg px-4 py-3 font-semibold transition-all ${
                  adminView === "locations"
                    ? "bg-white/5 text-gold-prestige"
                    : "text-slate-300 hover:bg-white/5"
                }`}
              >
                <div className="flex items-center space-x-2.5 space-x-reverse">
                  <Map className="h-4 w-4" />
                  <span>إدارة المخطط الجغرافي</span>
                </div>
              </button>
            )}

            {/* Supervisor Management Tab - ONLY FOR MASTER ADMIN (عبدالله الدعاس) */}
            {!adminUser?.isSupervisor && (
              <>
                <button
                  onClick={() => setAdminView("users")}
                  className={`w-full flex items-center justify-between rounded-lg px-4 py-3 font-semibold transition-all ${
                    adminView === "users"
                      ? "bg-white/5 text-gold-prestige"
                      : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center space-x-2.5 space-x-reverse">
                    <Users className="h-4 w-4" />
                    <span>إدارة المستخدمين</span>
                  </div>
                </button>

                <button
                  onClick={() => setAdminView("logs")}
                  className={`w-full flex items-center justify-between rounded-lg px-4 py-3 font-semibold transition-all ${
                    adminView === "logs"
                      ? "bg-white/5 text-gold-prestige"
                      : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center space-x-2.5 space-x-reverse">
                    <History className="h-4 w-4" />
                    <span>سجل النشاطات</span>
                  </div>
                </button>

                <button
                  onClick={() => setAdminView("otp")}
                  className={`w-full flex items-center justify-between rounded-lg px-4 py-3 font-semibold transition-all ${
                    adminView === "otp"
                      ? "bg-white/5 text-gold-prestige"
                      : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center space-x-2.5 space-x-reverse">
                    <Shield className="h-4 w-4" />
                    <span>إعدادات التحقق (OTP)</span>
                  </div>
                </button>

                <button
                  onClick={() => setAdminView("finance")}
                  className={`w-full flex items-center justify-between rounded-lg px-4 py-3 font-semibold transition-all ${
                    adminView === "finance"
                      ? "bg-white/5 text-gold-prestige"
                      : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center space-x-2.5 space-x-reverse">
                    <Banknote className="h-4 w-4" />
                    <span>المالية والإيرادات</span>
                  </div>
                </button>
                <button
                  onClick={() => setAdminView("analytics")}
                  className={`w-full flex items-center justify-between rounded-lg px-4 py-3 font-semibold transition-all ${
                    adminView === "analytics"
                      ? "bg-white/5 text-gold-prestige"
                      : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center space-x-2.5 space-x-reverse">
                    <TrendingUp className="h-4 w-4" />
                    <span>التحليلات والإحصائيات</span>
                  </div>
                </button>
                <button
                  onClick={() => setAdminView("cms")}
                  className={`w-full flex items-center justify-between rounded-lg px-4 py-3 font-semibold transition-all ${
                    adminView === "cms"
                      ? "bg-white/5 text-gold-prestige"
                      : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center space-x-2.5 space-x-reverse">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>إدارة المحتوى (CMS)</span>
                  </div>
                </button>
                <button
                  onClick={() => setAdminView("ads")}
                  className={`w-full flex items-center justify-between rounded-lg px-4 py-3 font-semibold transition-all ${
                    adminView === "ads"
                      ? "bg-white/5 text-gold-prestige"
                      : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center space-x-2.5 space-x-reverse">
                    <Star className="h-4 w-4" />
                    <span>إدارة الإعلانات</span>
                  </div>
                </button>
                <button
                  onClick={() => setAdminView("services")}
                  className={`w-full flex items-center justify-between rounded-lg px-4 py-3 font-semibold transition-all ${
                    adminView === "services"
                      ? "bg-white/5 text-gold-prestige"
                      : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center space-x-2.5 space-x-reverse">
                    <Building2 className="h-4 w-4" />
                    <span>الخدمات العقارية</span>
                  </div>
                </button>
                <button
                  onClick={() => setAdminView("agreements")}
                  className={`w-full flex items-center justify-between rounded-lg px-4 py-3 font-semibold transition-all ${
                    adminView === "agreements"
                      ? "bg-white/5 text-gold-prestige"
                      : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center space-x-2.5 space-x-reverse">
                    <FileSignature className="h-4 w-4" />
                    <span>المكاتبات الإلكترونية</span>
                  </div>
                </button>
                <button
                  onClick={() => setAdminView("agreement-payments")}
                  className={`w-full flex items-center justify-between rounded-lg px-4 py-3 font-semibold transition-all ${
                    adminView === "agreement-payments"
                      ? "bg-white/5 text-gold-prestige"
                      : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center space-x-2.5 space-x-reverse">
                    <Banknote className="h-4 w-4" />
                    <span>طلبات دفع المكاتبات</span>
                  </div>
                  <span className="bg-[#F27D26] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                    جديد
                  </span>
                </button>
                <button
                  onClick={() => setAdminView("settings")}
                  className={`w-full flex items-center justify-between rounded-lg px-4 py-3 font-semibold transition-all ${
                    adminView === "settings"
                      ? "bg-white/5 text-gold-prestige"
                      : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center space-x-2.5 space-x-reverse">
                    <ShieldAlert className="h-4 w-4" />
                    <span>الإعدادات العامة</span>
                  </div>
                </button>

                <button
                  onClick={() => setAdminView("supervisors")}
                  className={`w-full flex items-center justify-between rounded-lg px-4 py-3 font-semibold transition-all ${
                    adminView === "supervisors"
                      ? "bg-white/5 text-gold-prestige"
                      : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center space-x-2.5 space-x-reverse">
                    <Shield className="h-4 w-4 text-[#F27D26]" />
                    <span className="text-[#F27D26]">
                      إدارة المشرفين والترميز
                    </span>
                  </div>
                  {supervisors.length > 0 && (
                    <span className="bg-red-500/20 text-[#F27D26] border border-[#F27D26]/20 px-2 py-0.5 rounded-full font-mono font-bold text-[9px]">
                      {supervisors.length} نشط
                    </span>
                  )}
                </button>
              </>
            )}
          </nav>

          {/* Quick Stats overview */}
          <div className="border-t border-white/5 pt-4 space-y-2 text-[11px] text-slate-400">
            <p className="flex justify-between">
              <span>نشط عام في المنصة:</span>
              <span className="font-bold text-white font-mono">
                {properties.filter((p) => p.isApproved).length}
              </span>
            </p>
            <p className="flex justify-between">
              <span>إجمالي المقيمين:</span>
              <span className="font-bold text-white">مفعل</span>
            </p>
          </div>

          {/* Logout Trigger */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 space-x-reverse rounded-xl bg-red-600/10 border border-red-500/20 hover:bg-red-600 hover:text-white py-2.5 text-xs font-bold text-red-400 transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>خروج من لوحة التحكم</span>
          </button>
        </div>
      </div>

      {/* ADMIN WORKSPACE (3/4 width on desktop) */}
      <div className="lg:col-span-3 space-y-6">
        {/* VIEW 1: ADMIN DASHBOARD */}
        {adminView === "dashboard" && (
          <div className="space-y-6 animate-fade-in">
            <div className="rounded-2xl border border-white/5 bg-slate-900/10 backdrop-blur-md p-6">
              <h2 className="text-base font-bold text-white mb-2 flex items-center gap-1.5">
                <Sparkles className="h-4.5 w-4.5 text-gold-prestige animate-pulse" />
                <span>مرحباً بك في بوابة الإدارة المركزية</span>
              </h2>
              <p className="text-xs text-slate-400 font-sans">
                تمنحك لوحة التحكم إشرافاً ومراقبة كاملة على العقارات والاتصالات
                والمشتريات والنشاط الجغرافي.
              </p>
            </div>

            {/* Quick Live Counters */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="p-4 rounded-xl border border-white/5 bg-slate-950/30 text-center">
                <span className="text-xs text-slate-400 block">
                  العقارات قيد المراجعة
                </span>
                <span className="block text-2xl font-black text-amber-400 font-mono mt-1">
                  {notifs.pendingProps}
                </span>
              </div>
              <div className="p-4 rounded-xl border border-white/5 bg-slate-950/30 text-center">
                <span className="text-xs text-slate-400 block">
                  إثباتات دفع معلقة
                </span>
                <span className="block text-2xl font-black text-emerald-400 font-mono mt-1">
                  {notifs.pendingPayments}
                </span>
              </div>
              <div className="p-4 rounded-xl border border-white/5 bg-slate-950/30 text-center">
                <span className="text-xs text-slate-400 block">
                  الرسائل غير المقروءة
                </span>
                <span className="block text-2xl font-black text-red-400 font-mono mt-1">
                  {notifs.unreadMsgs}
                </span>
              </div>
              <div className="p-4 rounded-xl border border-white/5 bg-slate-950/30 text-center">
                <span className="text-xs text-slate-400 block">
                  إجمالي صفقات المنصة
                </span>
                <span className="block text-2xl font-black text-white font-mono mt-1">
                  {deals.length}
                </span>
              </div>
            </div>

            {/* Live Operations / Completed deals logs */}
            <div className="rounded-2xl border border-white/5 bg-slate-900/10 backdrop-blur-md p-6 space-y-4">
              <h3 className="text-sm font-bold text-white border-b border-white/5 pb-3">
                تأريخ العمليات والصفقات المكتملة
              </h3>

              <div className="space-y-3 font-sans">
                {deals?.map((deal) => (
                  <div
                    key={deal.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-lg bg-slate-950/40 border border-white/5 text-xs text-slate-300 gap-2"
                  >
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <span
                        className={`h-2 w-2 rounded-full ${deal.type === "بيع" ? "bg-emerald-500" : "bg-blue-500"}`}
                      ></span>
                      <span className="font-bold text-white">
                        {deal.propertyTitle}
                      </span>
                      <span className="text-slate-400">
                        ({deal.governorate} • {deal.district})
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 space-x-reverse font-mono text-[11px]">
                      <span className="text-gold-prestige font-bold">
                        {formatPrice(
                          deal.price,
                          deal.type === "بيع" ? "للبيع" : "للإيجار",
                        )}
                      </span>
                      <span className="text-slate-500">
                        تم إبرام الصفقة خلال {deal.daysToComplete} يوم
                      </span>
                    </div>
                  </div>
                ))}
                {deals.length === 0 && (
                  <p className="text-xs text-slate-500 text-center">
                    لا توجد صفقات مكتملة مسجلة بعد.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: MANAGE PROPERTIES (APPROVAL QUEUE) */}
        {adminView === "properties" && (
          <div className="space-y-6 animate-fade-in">
            <div className="rounded-2xl border border-white/5 bg-slate-900/10 backdrop-blur-md p-6">
              <h2 className="text-base font-bold text-white mb-1">
                طلبات إدراج العقارات والمراجعة والتحكيم
              </h2>
              <p className="text-xs text-slate-400 font-sans">
                وافق على العقارات السكنية الجديدة قبل إتاحتها للزوار والباحثين
              </p>
            </div>

            <div className="space-y-4">
              {properties?.map((p) => (
                <div
                  key={p.id}
                  className="p-5 rounded-2xl border border-white/5 bg-slate-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex gap-4 items-center min-w-0">
                    <img
                      src={p.images?.[0]}
                      alt="listing"
                      referrerPolicy="no-referrer"
                      className="h-16 w-20 object-cover rounded-xl shrink-0 border border-white/10"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        {p.pendingDeletion && (
                          <span className="text-[9.5px] font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            طلب إلغاء نشر (حذف)
                          </span>
                        )}
                        <span
                          className={`text-[9.5px] font-bold px-2 py-0.5 rounded ${p.isApproved ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}
                        >
                          {p.isApproved ? "منشور ونشط" : "بانتظار المراجعة"}
                        </span>
                        <span className="text-[10px] text-gold-prestige font-extrabold">
                          {formatPrice(p.price, p.status)}
                        </span>
                        <span className="text-[10px] text-slate-500 font-sans">
                          {p.buildingType} • {p.space} م²
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white truncate">
                        {p.title}
                      </h4>
                      <p className="text-xs text-slate-400 truncate mt-1">
                        📍 {p.governorate} • {p.district} • {p.neighborhood}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedInspectProperty(p)}
                      className="rounded-lg bg-slate-850 hover:bg-[#F27D26]/20 hover:text-[#F27D26] border border-white/5 px-3 py-2 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                      title="عرض كامل التفاصيل والتحقق من المالك"
                    >
                      <Eye className="h-4 w-4" />
                      <span>كامل التفاصيل</span>
                    </button>

                    {!p.isApproved && (
                      <button
                        id={`btn-admin-approve-${p.id}`}
                        onClick={() => handleApproveProperty(p.id)}
                        className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-2 text-xs font-bold text-white flex items-center gap-1 cursor-pointer"
                        title="موافقة ونشر"
                      >
                        <Check className="h-4 w-4" />
                        <span>موافقة ونشر</span>
                      </button>
                    )}
                    <button
                      id={`btn-admin-delete-${p.id}`}
                      onClick={() => handleDeleteProperty(p.id)}
                      className="rounded-lg bg-rose-600/10 border border-rose-500/20 hover:bg-rose-600 text-rose-400 hover:text-white px-3 py-2 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      title="حذف العقار"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>حذف</span>
                    </button>
                  </div>
                </div>
              ))}
              {properties.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-10">
                  لا توجد عقارات مضافة حتى الآن.
                </p>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2.5: MAP EDITOR */}
        {adminView === "map" && (
          <div className="animate-fade-in">
            <AdminMapEditor properties={properties} onRefresh={loadAdminData} />
          </div>
        )}

        {/* OFFERS VIEW */}
        {adminView === "offers" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-6">عروض الشراء</h2>
            <div className="bg-slate-950/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-400">
                      <th className="py-3 px-4 font-normal">العقار</th>
                      <th className="py-3 px-4 font-normal">المشتري</th>
                      <th className="py-3 px-4 font-normal">المبلغ المقترح</th>
                      <th className="py-3 px-4 font-normal">الرسالة</th>
                      <th className="py-3 px-4 font-normal">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {offers?.map((o) => (
                      <tr
                        key={o.id}
                        className="text-slate-300 hover:bg-white/[0.02]"
                      >
                        <td className="py-3 px-4">{o.propertyTitle}</td>
                        <td className="py-3 px-4">{o.buyerName}</td>
                        <td className="py-3 px-4 font-bold text-gold-prestige">
                          {o.amount.toLocaleString("ar-IQ")} د.ع
                        </td>
                        <td className="py-3 px-4 text-[10px]">
                          {o.message || "-"}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded text-[10px] ${o.status === "pending" ? "bg-amber-500/20 text-amber-500" : o.status === "accepted" ? "bg-emerald-500/20 text-emerald-500" : "bg-red-500/20 text-red-500"}`}
                          >
                            {o.status === "pending"
                              ? "قيد الانتظار"
                              : o.status === "accepted"
                                ? "مقبول"
                                : "مرفوض"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* COMPLAINTS VIEW */}
        {adminView === "complaints" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-6">
              مركز الشكاوى والنزاعات
            </h2>
            <div className="bg-slate-950/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
              <div className="space-y-4">
                {complaints?.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 bg-slate-900 border border-white/10 rounded-xl space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="text-white font-bold text-sm text-red-400">
                        {c.subject}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded text-[10px] ${c.status === "open" ? "bg-amber-500/20 text-amber-500" : c.status === "closed" ? "bg-slate-500/20 text-slate-400" : "bg-blue-500/20 text-blue-400"}`}
                      >
                        {c.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">{c.description}</p>
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>
                        المرسل: {c.reporterName} ({c.reporterId})
                      </span>
                      <span>
                        {new Date(c.createdAt).toLocaleDateString("ar-IQ")}
                      </span>
                    </div>
                    {c.status !== "closed" && (
                      <button
                        onClick={async () => {
                          try {
                            await updateComplaint(c.id, {
                              status: "closed",
                              resolution: "تم الإغلاق من قبل الإدارة",
                            });
                            loadAdminData();
                          } catch (e) {}
                        }}
                        className="mt-2 px-3 py-1 bg-slate-800 text-white rounded text-[10px] hover:bg-slate-700"
                      >
                        إغلاق الشكوى
                      </button>
                    )}
                  </div>
                ))}
                {complaints.length === 0 && (
                  <div className="text-center text-slate-500 text-xs py-8">
                    لا توجد شكاوى حالياً.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: INBOX MESSAGES */}
        {adminView === "inbox" && (
          <div className="space-y-6 animate-fade-in">
            <div className="rounded-2xl border border-white/5 bg-slate-900/10 backdrop-blur-md p-6">
              <h2 className="text-base font-bold text-white mb-1">
                مركز المراسلات وصندوق الوارد الموحد
              </h2>
              <p className="text-xs text-slate-400 font-sans">
                تصفح رسائل التواصل، الاستفسارات، الشكاوى وطلبات المكاتب العقارية
                من مكان واحد
              </p>
            </div>

            <div className="space-y-4">
              {messages?.map((m) => {
                const messageTypes: Record<
                  string,
                  { label: string; color: string }
                > = {
                  general: {
                    label: "استفسار عام",
                    color: "bg-blue-500/10 text-blue-400",
                  },
                  request: {
                    label: "طلب معاينة عقار",
                    color: "bg-emerald-500/10 text-emerald-400",
                  },
                  office_request: {
                    label: "طلب تسجيل مكتب",
                    color: "bg-amber-500/10 text-amber-400",
                  },
                  complaint: {
                    label: "شكوى / بلاغ",
                    color: "bg-rose-500/10 text-rose-400 font-bold",
                  },
                };
                const style = messageTypes[m.type] || {
                  label: "اتصال",
                  color: "bg-slate-500/10 text-slate-400",
                };

                return (
                  <div
                    key={m.id}
                    className={`p-5 rounded-2xl border border-white/5 bg-slate-950/40 space-y-3 relative ${!m.isRead ? "border-r-4 border-r-gold-prestige" : ""}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${style.color}`}
                        >
                          {style.label}
                        </span>
                        <span className="text-xs font-bold text-white">
                          {m.name}
                        </span>
                        <span className="text-xs text-slate-400">
                          ({m.phone})
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">
                        {m.createdAt?.split("T")?.[0] || ""}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {m.message}
                    </p>

                    {m.propertyId && (
                      <div className="text-[11px] text-slate-400 font-sans bg-slate-900/40 p-2 rounded">
                        مرفق برقم العقار:{" "}
                        <span className="font-bold text-white font-mono">
                          {m.propertyId}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-end pt-2 border-t border-white/5">
                      {!m.isRead ? (
                        <button
                          id={`btn-admin-read-${m.id}`}
                          onClick={() => handleMarkMessageRead(m.id)}
                          className="rounded-lg bg-gold-prestige/10 hover:bg-gold-prestige hover:text-white border border-gold-prestige/25 text-gold-prestige px-3 py-1.5 text-xs font-bold cursor-pointer"
                        >
                          تم القراءة ومعالجة الطلب
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          <span>تم الاطلاع والمعالجة</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              {messages.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-10">
                  صندوق الوارد الإداري فارغ تماماً حالياً.
                </p>
              )}
            </div>
          </div>
        )}

        {/* VIEW 4: PROMOTIONS & PAYMENT RECEIPTS */}
        {adminView === "payments" && (
          <div className="space-y-6 animate-fade-in">
            <div className="rounded-2xl border border-white/5 bg-slate-900/10 backdrop-blur-md p-6">
              <h2 className="text-base font-bold text-white mb-1">
                التحقق من إثباتات دفع الباقات المميزة والترقيات
              </h2>
              <p className="text-xs text-slate-400 font-sans">
                دقق المعاملات الواردة وفَعِّل باقات الترقية للعقارات المميزة في
                لوحة البحث
              </p>
            </div>

            {/* Payment Settings Edit */}
            <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                إعدادات أرقام الدفع للمنصة
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">
                    رقم ماستر كارد (Mastercard)
                  </label>
                  <input
                    type="text"
                    value={settings.mastercard}
                    onChange={(e) =>
                      setSettings({ ...settings, mastercard: e.target.value })
                    }
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-emerald-500/40"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">
                    رقم زين كاش (Zain Cash)
                  </label>
                  <input
                    type="text"
                    value={settings.zainCash}
                    onChange={(e) =>
                      setSettings({ ...settings, zainCash: e.target.value })
                    }
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-emerald-500/40"
                  />
                </div>
              </div>
              <button
                onClick={async () => {
                  try {
                    await fetch("/api/settings", {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        mastercard: settings.mastercard,
                        zainCash: settings.zainCash,
                      }),
                    });
                    alert("تم حفظ إعدادات الدفع بنجاح!");
                  } catch (e) {
                    alert("خطأ في حفظ الإعدادات");
                  }
                }}
                className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white transition-all"
              >
                حفظ الإعدادات
              </button>
            </div>

            <div className="space-y-4">
              {payments?.map((pay) => (
                <div
                  key={pay.id}
                  className="p-5 rounded-2xl border border-white/5 bg-slate-950/40 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                    <div className="flex items-center space-x-2.5 space-x-reverse text-xs">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          pay.status === "pending"
                            ? "bg-amber-500/10 text-amber-400"
                            : pay.status === "approved"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-rose-500/10 text-rose-400"
                        }`}
                      >
                        {pay.status === "pending"
                          ? "معاملة معلقة للتدقيق"
                          : pay.status === "approved"
                            ? "مقبولة ومفعلة"
                            : "مرفوضة"}
                      </span>
                      <span className="font-bold text-white">
                        {pay.senderName}
                      </span>
                      <span className="text-slate-400">
                        ({pay.senderPhone})
                      </span>
                    </div>
                    <span className="text-xs text-gold-prestige font-bold font-sans">
                      المبلغ المحول: {(pay.amount ?? 0).toLocaleString()} د.ع
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs font-sans text-slate-300">
                    <div className="space-y-1.5">
                      <p>
                        رمز العقار المستهدف:{" "}
                        <span className="font-bold text-white font-mono select-all">
                          {pay.propertyId}
                        </span>
                      </p>
                      <p>
                        الباقة المطلوبة:{" "}
                        <span className="font-bold text-white font-sans">
                          {pay.packageName}
                        </span>
                      </p>
                      <p>
                        وسيلة التحويل المستخدمة:{" "}
                        <span className="font-bold text-white font-sans">
                          {pay.paymentMethod === "zain_cash"
                            ? "زين كاش"
                            : "كي كارد"}
                        </span>
                      </p>
                      <p>
                        رقم المعاملة للتحقق:{" "}
                        <span className="font-bold text-emerald-400 font-mono">
                          {pay.transactionId || "لم يزود"}
                        </span>
                      </p>
                    </div>

                    <div className="text-left flex items-end">
                      {pay.status === "pending" ? (
                        <div className="flex gap-2 w-full justify-end">
                          <button
                            id={`btn-approve-payment-${pay.id}`}
                            onClick={() =>
                              handleVerifyPayment(
                                pay.id,
                                "approved",
                                pay.propertyId,
                                pay.packageName,
                              )
                            }
                            className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="h-4 w-4" />
                            <span>قبول وتفعيل</span>
                          </button>
                          <button
                            id={`btn-reject-payment-${pay.id}`}
                            onClick={() =>
                              handleVerifyPayment(
                                pay.id,
                                "rejected",
                                pay.propertyId,
                                pay.packageName,
                              )
                            }
                            className="rounded-lg bg-rose-600/10 border border-rose-500/20 hover:bg-rose-600 text-rose-400 hover:text-white px-4 py-2 text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <X className="h-4 w-4" />
                            <span>رفض المعاملة</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500">
                          تم حسم المعاملة وأرشفتها.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {payments.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-10">
                  لا توجد إثباتات دفع أو ترقيات معلقة حالياً.
                </p>
              )}
            </div>
          </div>
        )}

        {/* VIEW 5: MANAGE LOCATIONS (GOVERNORATES & DISTRICTS) */}

        {/* NEW VISITS VIEW */}
        {adminView === "visits" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-6">
              طلبات زيارة العقارات
            </h2>
            <div className="bg-slate-950/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-400">
                      <th className="py-3 px-4 font-normal">العقار</th>
                      <th className="py-3 px-4 font-normal">طالب الزيارة</th>
                      <th className="py-3 px-4 font-normal">الموعد</th>
                      <th className="py-3 px-4 font-normal">المالك</th>
                      <th className="py-3 px-4 font-normal">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {visits?.map((v) => (
                      <tr
                        key={v.id}
                        className="text-slate-300 hover:bg-white/[0.02]"
                      >
                        <td className="py-3 px-4">{v.propertyTitle}</td>
                        <td className="py-3 px-4 text-emerald-400">
                          {v.requesterName} <br />
                          <span className="text-[9px] text-slate-500">
                            {v.requesterPhone}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gold-prestige">
                          {v.date} <br /> {v.time}
                        </td>
                        <td className="py-3 px-4 font-mono">{v.ownerId}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded text-[10px] ${v.status === "pending" ? "bg-amber-500/20 text-amber-500" : v.status === "accepted" ? "bg-emerald-500/20 text-emerald-500" : "bg-red-500/20 text-red-500"}`}
                          >
                            {v.status === "pending"
                              ? "قيد الانتظار"
                              : v.status === "accepted"
                                ? "مقبول"
                                : "مرفوض"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* NEW AUCTIONS VIEW */}
        {adminView === "auctions" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-6">
              المزادات العقارية
            </h2>
            <div className="bg-slate-950/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
              <p className="text-xs text-slate-400 mb-4">
                هذه اللوحة تعرض العقارات المعروضة في مزاد.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {properties
                  .filter((p) => p.isAuction)
                  ?.map((p) => (
                    <div
                      key={p.id}
                      className="p-4 bg-slate-900 border border-amber-500/30 rounded-xl space-y-2"
                    >
                      <h3 className="text-white font-bold text-sm">
                        {p.title}
                      </h3>
                      <div className="flex justify-between text-[10px]">
                        <span className="text-slate-400">
                          الحالة:{" "}
                          {p.isAuctionActive ? (
                            <span className="text-emerald-400">نشط</span>
                          ) : (
                            <span className="text-red-400">مغلق</span>
                          )}
                        </span>
                        <span className="text-amber-500 font-bold">
                          السعر الابتدائي:{" "}
                          {p.startingPrice?.toLocaleString("ar-IQ")} د.ع
                        </span>
                      </div>
                      <div className="flex justify-between text-[10px] bg-black/40 p-2 rounded">
                        <span className="text-slate-300">
                          أعلى مزايدة:{" "}
                          <span className="text-gold-prestige font-bold text-xs">
                            {p.highestBid?.toLocaleString("ar-IQ") || "لا يوجد"}{" "}
                            د.ع
                          </span>
                        </span>
                      </div>
                    </div>
                  ))}
                {properties.filter((p) => p.isAuction).length === 0 && (
                  <div className="col-span-full text-center text-slate-500 text-xs py-8">
                    لا توجد مزادات عقارية حالياً.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {adminView === "locations" && (
          <div className="space-y-6 animate-fade-in">
            <div className="rounded-2xl border border-white/5 bg-slate-900/10 backdrop-blur-md p-6">
              <h2 className="text-base font-bold text-white mb-1">
                إدارة التقسيم والمخطط الإداري الجغرافي
              </h2>
              <p className="text-xs text-slate-400 font-sans">
                أضف محافظات أو أقضية أو نواحي أو أحياء جديدة لدعم دقة وسلاسة
                البحث للمستخدمين
              </p>
            </div>

            {/* Insertion Form */}
            <form
              onSubmit={handleAddLocation}
              className="p-5 rounded-2xl border border-white/5 bg-slate-950/40 space-y-4"
            >
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Plus className="h-4.5 w-4.5 text-gold-prestige" />
                <span>إضافة تقسيم إداري جغرافي جديد</span>
              </h4>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 text-xs font-sans">
                <div>
                  <label className="block text-slate-400 mb-1">المحافظة</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: الأنبار"
                    value={newGov}
                    onChange={(e) => setNewGov(e.target.value)}
                    className="w-full rounded-lg border border-white/5 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">القضاء</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: الفلوجة"
                    value={newDist}
                    onChange={(e) => setNewDist(e.target.value)}
                    className="w-full rounded-lg border border-white/5 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">الناحية</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: الكرمة"
                    value={newSubDist}
                    onChange={(e) => setNewSubDist(e.target.value)}
                    className="w-full rounded-lg border border-white/5 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">
                    الحي السكني
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: حي الشهداء"
                    value={newNeigh}
                    onChange={(e) => setNewNeigh(e.target.value)}
                    className="w-full rounded-lg border border-white/5 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-600 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  id="btn-add-location-submit"
                  type="submit"
                  className="rounded-lg bg-gold-prestige hover:bg-gold-accent px-5 py-2 text-xs font-bold text-white transition-all cursor-pointer flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  <span>إضافة وتوسيع النطاق</span>
                </button>
              </div>

              {locationSuccess && (
                <div className="rounded-lg bg-emerald-500/10 p-3 border border-emerald-500/20 text-xs text-emerald-400 text-center">
                  {locationSuccess}
                </div>
              )}
            </form>

            {/* Location hierarchy inspection */}
            <div className="rounded-2xl border border-white/5 bg-slate-900/10 backdrop-blur-md p-6 space-y-4">
              <h3 className="text-sm font-bold text-white border-b border-white/5 pb-2">
                المخطط الإداري الجغرافي النشط حالياً
              </h3>

              <div className="space-y-4 max-h-[350px] overflow-y-auto text-xs font-sans">
                {locations?.map((loc) => (
                  <div
                    key={loc.governorate}
                    className="p-4 rounded-xl bg-slate-950/30 border border-white/5 space-y-2"
                  >
                    <h4 className="font-bold text-white text-sm">
                      محافظة: {loc.governorate}
                    </h4>
                    <div className="mr-4 space-y-1 text-slate-400 text-[11px]">
                      {loc.districts?.map((d) => (
                        <p key={d.name}>
                          قضاء:{" "}
                          <span className="text-slate-200 font-bold">
                            {d.name}
                          </span>{" "}
                          ← نواحي:{" "}
                          {d.subDistricts?.map((s) => s.name).join(", ")}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 6: SUPERVISOR ACCOUNTS MANAGEMENT */}
        {adminView === "supervisors" && (
          <div className="space-y-6 animate-fade-in text-right" dir="rtl">
            <div className="rounded-2xl border border-white/5 bg-slate-900/10 backdrop-blur-md p-6">
              <h2 className="text-base font-bold text-white mb-1">
                إدارة المشرفين وصلاحيات الترميز والتحكيم
              </h2>
              <p className="text-xs text-slate-400 font-sans">
                أنشئ حسابات مخصصة للمشرفين وحدد الصلاحيات الدقيقة والأقسام
                المسموح لهم بإدارتها
              </p>
            </div>

            {/* Add Supervisor Form */}
            <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-6 space-y-4">
              <h3 className="text-sm font-bold text-white border-b border-white/5 pb-2">
                إضافة مشرف جديد للمنصة
              </h3>
              <form onSubmit={handleCreateSupervisor} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-400 mb-1.5 text-xs">
                      اسم المشرف بالكامل
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: أبو علي..."
                      value={newSvName}
                      onChange={(e) => setNewSvName(e.target.value)}
                      className="w-full rounded-lg border border-white/5 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-[#F27D26]/40"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1.5 text-xs">
                      اسم المستخدم للدخول (Username)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: ali_admin..."
                      value={newSvUsername}
                      onChange={(e) => setNewSvUsername(e.target.value)}
                      className="w-full rounded-lg border border-white/5 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-[#F27D26]/40 text-left font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1.5 text-xs">
                      الرمز السري الخاص (Secret Code)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="كلمة مرور قوية..."
                      value={newSvSecret}
                      onChange={(e) => setNewSvSecret(e.target.value)}
                      className="w-full rounded-lg border border-white/5 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-[#F27D26]/40 text-left font-mono"
                    />
                  </div>
                </div>

                {/* Permissions checkboxes */}
                <div className="border-t border-white/5 pt-4">
                  <label className="block text-xs font-bold text-slate-300 mb-3">
                    تخصيص وتحديد عمل وصلاحيات هذا المشرف:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                      <input
                        type="checkbox"
                        checked={newSvPermApprove}
                        onChange={(e) => setNewSvPermApprove(e.target.checked)}
                        className="rounded accent-[#F27D26] h-4 w-4"
                      />
                      <span>مراجعة واعتماد طلبات النشر</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                      <input
                        type="checkbox"
                        checked={newSvPermLocations}
                        onChange={(e) =>
                          setNewSvPermLocations(e.target.checked)
                        }
                        className="rounded accent-[#F27D26] h-4 w-4"
                      />
                      <span>إدارة المخطط الجغرافي</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                      <input
                        type="checkbox"
                        checked={newSvPermInbox}
                        onChange={(e) => setNewSvPermInbox(e.target.checked)}
                        className="rounded accent-[#F27D26] h-4 w-4"
                      />
                      <span>إشراف الرسائل وصندوق الوارد</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                      <input
                        type="checkbox"
                        checked={newSvPermPayments}
                        onChange={(e) => setNewSvPermPayments(e.target.checked)}
                        className="rounded accent-[#F27D26] h-4 w-4"
                      />
                      <span>التحقق من الدفعات والتمويل</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="rounded-lg bg-gradient-to-r from-[#F27D26] to-[#ff8a3d] hover:scale-105 active:scale-95 px-5 py-2 text-xs font-bold text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-[#F27D26]/10"
                  >
                    <Plus className="h-4 w-4" />
                    <span>تأكيد وإضافة المشرف</span>
                  </button>
                </div>

                {supervisorSuccess && (
                  <div className="rounded-lg bg-emerald-500/10 p-3 border border-emerald-500/20 text-xs text-emerald-400 text-center">
                    {supervisorSuccess}
                  </div>
                )}
                {supervisorError && (
                  <div className="rounded-lg bg-red-500/10 p-3 border border-red-500/20 text-xs text-red-400 text-center">
                    {supervisorError}
                  </div>
                )}
              </form>
            </div>

            {/* List of current supervisors */}
            <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-6 space-y-4">
              <h3 className="text-sm font-bold text-white border-b border-white/5 pb-2">
                المشرفون الحاليون وصلاحياتهم النشطة
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {supervisors?.map((sv) => (
                  <div
                    key={sv.id}
                    className="p-4 rounded-xl border border-white/5 bg-slate-900/20 space-y-3 relative group"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-white text-sm">
                          {sv.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 font-mono">
                          @{sv.username} • الرمز السري:{" "}
                          <span className="text-slate-300 font-bold">
                            {sv.secretCode}
                          </span>
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteSupervisor(sv.id)}
                        className="p-1.5 rounded-lg border border-red-500/15 text-red-400 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                        title="حذف وإلغاء صلاحيات المشرف"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="border-t border-white/5 pt-2 space-y-1 text-xs">
                      <p className="text-[11px] text-slate-400 mb-1">
                        الصلاحيات النشطة (اضغط للتبديل):
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        <span
                          onClick={() =>
                            handleToggleSupervisorPermission(
                              sv,
                              "approveProperties",
                            )
                          }
                          className={`cursor-pointer text-[10px] px-2 py-0.5 rounded transition-all ${sv.permissions.approveProperties ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-slate-900 text-slate-500 border border-white/5 line-through"}`}
                        >
                          الموافقة والنشر
                        </span>
                        <span
                          onClick={() =>
                            handleToggleSupervisorPermission(
                              sv,
                              "manageLocations",
                            )
                          }
                          className={`cursor-pointer text-[10px] px-2 py-0.5 rounded transition-all ${sv.permissions.manageLocations ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-slate-900 text-slate-500 border border-white/5 line-through"}`}
                        >
                          المخطط الجغرافي
                        </span>
                        <span
                          onClick={() =>
                            handleToggleSupervisorPermission(sv, "manageInbox")
                          }
                          className={`cursor-pointer text-[10px] px-2 py-0.5 rounded transition-all ${sv.permissions.manageInbox ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-slate-900 text-slate-500 border border-white/5 line-through"}`}
                        >
                          صندوق الوارد
                        </span>
                        <span
                          onClick={() =>
                            handleToggleSupervisorPermission(
                              sv,
                              "managePayments",
                            )
                          }
                          className={`cursor-pointer text-[10px] px-2 py-0.5 rounded transition-all ${sv.permissions.managePayments ? "bg-emerald-500/20 text-[#F27D26] border border-[#F27D26]/30" : "bg-slate-900 text-slate-500 border border-white/5 line-through"}`}
                        >
                          الدفعات والتمويل
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {supervisors.length === 0 && (
                  <p className="text-xs text-slate-500 col-span-2 py-6 text-center">
                    لا يوجد أي مشرف مضاف حالياً.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {adminView === "users" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-6">
              إدارة المستخدمين
            </h2>
            <div className="bg-slate-950/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-400">
                      <th className="py-3 px-4 font-normal">الاسم</th>
                      <th className="py-3 px-4 font-normal">المعرف</th>
                      <th className="py-3 px-4 font-normal">الدور</th>
                      <th className="py-3 px-4 font-normal">الحالة</th>
                      <th className="py-3 px-4 font-normal">تاريخ التسجيل</th>
                      <th className="py-3 px-4 font-normal">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {profiles?.map((p) => (
                      <tr key={p.emailOrPhone} className="text-slate-300">
                        <td className="py-3 px-4 font-bold text-white">
                          {p.name}
                        </td>
                        <td className="py-3 px-4 font-mono">
                          {p.emailOrPhone}
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={p.role || "citizen"}
                            onChange={async (e) => {
                              await fetch(
                                `/api/profiles/${encodeURIComponent(p.emailOrPhone)}/role`,
                                {
                                  method: "PUT",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({
                                    role: e.target.value,
                                  }),
                                },
                              );
                              loadAdminData();
                            }}
                            className="bg-slate-900 border border-white/10 rounded px-2 py-1 text-xs text-slate-300"
                          >
                            <option value="citizen">مستخدم عادي</option>
                            <option value="moderator">مدير محتوى</option>
                            <option value="admin">مسؤول</option>
                          </select>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] ${
                              p.status === "banned"
                                ? "bg-rose-500/20 text-rose-400"
                                : p.status === "suspended"
                                  ? "bg-amber-500/20 text-amber-400"
                                  : "bg-emerald-500/20 text-emerald-400"
                            }`}
                          >
                            {p.status === "banned"
                              ? "محظور"
                              : p.status === "suspended"
                                ? "معطل مؤقتاً"
                                : "نشط"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {new Date(p.createdAt).toLocaleDateString("ar-IQ")}
                        </td>
                        <td className="py-3 px-4 flex gap-2">
                          {p.status !== "banned" ? (
                            <button
                              onClick={async () => {
                                const reason = prompt("سبب الحظر؟");
                                if (reason) {
                                  await fetch(
                                    `/api/profiles/${encodeURIComponent(p.emailOrPhone)}/status`,
                                    {
                                      method: "PUT",
                                      headers: {
                                        "Content-Type": "application/json",
                                      },
                                      body: JSON.stringify({
                                        status: "banned",
                                        banReason: reason,
                                      }),
                                    },
                                  );
                                  loadAdminData();
                                }
                              }}
                              className="text-rose-400 hover:text-rose-300 p-1 bg-white/5 rounded border border-white/10"
                              title="حظر"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={async () => {
                                await fetch(
                                  `/api/profiles/${encodeURIComponent(p.emailOrPhone)}/status`,
                                  {
                                    method: "PUT",
                                    headers: {
                                      "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                      status: "active",
                                      banReason: "",
                                    }),
                                  },
                                );
                                loadAdminData();
                              }}
                              className="text-emerald-400 hover:text-emerald-300 p-1 bg-white/5 rounded border border-white/10"
                              title="إلغاء الحظر"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {adminView === "logs" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-6">
              سجل النشاطات (Activity Logs)
            </h2>
            <div className="bg-slate-950/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
              <div className="overflow-x-auto max-h-[70vh]">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-400">
                      <th className="py-3 px-4 font-normal">الوقت</th>
                      <th className="py-3 px-4 font-normal">المستخدم</th>
                      <th className="py-3 px-4 font-normal">الإجراء</th>
                      <th className="py-3 px-4 font-normal">التفاصيل</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {logs
                      .slice()
                      .reverse()
                      ?.map((l) => (
                        <tr key={l.id} className="text-slate-300">
                          <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono text-[10px]">
                            {new Date(l.timestamp).toLocaleString("ar-IQ")}
                          </td>
                          <td className="py-3 px-4 font-mono text-emerald-400">
                            {l.userId}
                          </td>
                          <td className="py-3 px-4">
                            <span className="bg-white/5 px-2 py-1 rounded text-slate-300">
                              {l.action}
                            </span>
                          </td>
                          <td className="py-3 px-4">{l.details}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {adminView === "otp" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-6">
              إعدادات التحقق (OTP)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-white/5 bg-slate-900 p-6 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#F27D26]" />
                  مزود خدمة رسائل SMS
                </h3>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">
                    حالة النظام (تمكين أو تعطيل التحقق الحقيقي)
                  </label>
                  <select
                    value={settings.isOtpEnabled ? "true" : "false"}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        isOtpEnabled: e.target.value === "true",
                      })
                    }
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-2 text-xs text-white outline-none"
                  >
                    <option value="true">مُفَعّل (Enabled)</option>
                    <option value="false">
                      مُعَطّل (Disabled - يسمح بأي رمز)
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">
                    مزود الخدمة (Provider)
                  </label>
                  <select
                    value={settings.smsProvider}
                    onChange={(e) =>
                      setSettings({ ...settings, smsProvider: e.target.value })
                    }
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-2 text-xs text-white outline-none"
                  >
                    <option value="mock">
                      محاكي التطوير (Mock OTP - يظهر في السجلات فقط)
                    </option>
                    <option value="twilio">Twilio API (حقيقي)</option>
                    <option value="generic">مزود آخر (Generic API)</option>
                  </select>
                </div>
                {(settings.smsProvider === "twilio" ||
                  settings.smsProvider === "generic") && (
                  <>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">
                        مفتاح API (API Key)
                      </label>
                      <input
                        type="password"
                        value={settings.smsApiKey || ""}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            smsApiKey: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-2 text-xs text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">
                        سر API (API Secret)
                      </label>
                      <input
                        type="password"
                        value={settings.smsApiSecret || ""}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            smsApiSecret: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-2 text-xs text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">
                        اسم المرسل (Sender ID)
                      </label>
                      <input
                        type="text"
                        value={settings.smsSenderId || ""}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            smsSenderId: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-2 text-xs text-white outline-none"
                      />
                    </div>
                  </>
                )}
                <button
                  onClick={async () => {
                    try {
                      await fetch("/api/settings", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(settings),
                      });
                      alert("تم حفظ إعدادات الـ OTP بنجاح!");
                    } catch (e) {
                      alert("خطأ في الحفظ");
                    }
                  }}
                  className="rounded-lg bg-[#F27D26] hover:bg-[#ff8a3d] px-4 py-2 text-xs font-bold text-white w-full"
                >
                  حفظ إعدادات الـ SMS
                </button>
              </div>

              <div className="rounded-2xl border border-white/5 bg-slate-900 p-6">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                  <History className="w-4 h-4 text-slate-400" />
                  سجل عمليات إرسال OTP
                </h3>
                <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
                  {otpLogs.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-4">
                      لا توجد سجلات بعد
                    </p>
                  ) : (
                    otpLogs?.map((log) => (
                      <div
                        key={log.id}
                        className="p-3 rounded-xl border border-white/5 bg-slate-950 flex flex-col gap-1"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className="text-xs font-mono font-bold text-white"
                            dir="ltr"
                          >
                            {log.phone}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-bold ${log.status === "success" ? "bg-emerald-500/10 text-emerald-400" : log.status === "failed" ? "bg-rose-500/10 text-rose-400" : "bg-amber-500/10 text-amber-400"}`}
                          >
                            {log.status === "success"
                              ? "تم الإرسال (ناجح)"
                              : log.status === "failed"
                                ? "محاولة فاشلة"
                                : "منتهي الصلاحية"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
                          <span>محاولات: {log.attempts}</span>
                          <span>
                            {new Date(log.createdAt).toLocaleString("en-GB")}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FINANCE VIEW */}
        {adminView === "finance" && (
          <div className="space-y-6 animate-fade-in">
            <div className="rounded-2xl border border-white/5 bg-slate-900/10 backdrop-blur-md p-6">
              <h2 className="text-base font-bold text-white mb-1">
                لوحة المالية والإيرادات
              </h2>
              <p className="text-xs text-slate-400 font-sans">
                عرض الإيرادات والتقارير المالية والمدفوعات الشاملة
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-center">
                <span className="text-xs text-emerald-400 block">
                  إجمالي الإيرادات
                </span>
                <span className="block text-xl font-black text-white font-mono mt-1">
                  24,500,000 د.ع
                </span>
              </div>
              <div className="p-4 rounded-xl border border-white/5 bg-slate-950/30 text-center">
                <span className="text-xs text-slate-400 block">
                  إيرادات الإعلانات المميزة
                </span>
                <span className="block text-xl font-black text-white font-mono mt-1">
                  12,000,000 د.ع
                </span>
              </div>
              <div className="p-4 rounded-xl border border-white/5 bg-slate-950/30 text-center">
                <span className="text-xs text-slate-400 block">
                  اشتراكات المزادات
                </span>
                <span className="block text-xl font-black text-white font-mono mt-1">
                  8,500,000 د.ع
                </span>
              </div>
              <div className="p-4 rounded-xl border border-white/5 bg-slate-950/30 text-center">
                <span className="text-xs text-slate-400 block">
                  المكاتبات الإلكترونية
                </span>
                <span className="block text-xl font-black text-white font-mono mt-1">
                  4,000,000 د.ع
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-slate-900/10 backdrop-blur-md p-6">
              <h3 className="text-sm font-bold text-white mb-4 border-b border-white/5 pb-2">
                سجل الأنشطة المالية (Recent Transactions)
              </h3>
              <div className="space-y-3">
                {[1, 2, 3]?.map((i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-3 rounded-xl bg-slate-950 border border-white/5 text-xs text-slate-300"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                        <Banknote className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="block font-bold text-white">
                          ترقية إعلان مميز
                        </span>
                        <span className="text-slate-500">
                          بواسطة: أحمد علي • بطاقة زين كاش
                        </span>
                      </div>
                    </div>
                    <div className="text-left font-mono">
                      <span className="block font-bold text-emerald-400">
                        +25,000 د.ع
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date().toLocaleDateString("ar-IQ")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <button className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs hover:bg-slate-700">
                  تصدير PDF
                </button>
                <button className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs hover:bg-slate-700">
                  تصدير Excel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ANALYTICS VIEW */}
        {adminView === "analytics" && (
          <div className="space-y-6 animate-fade-in">
            <div className="rounded-2xl border border-white/5 bg-slate-900/10 backdrop-blur-md p-6">
              <h2 className="text-base font-bold text-white mb-1">
                لوحة التحليلات المتقدمة
              </h2>
              <p className="text-xs text-slate-400 font-sans">
                إحصائيات المنصة، الزيارات ومؤشرات الأداء
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="p-4 rounded-xl border border-white/5 bg-slate-950/30 text-center">
                <span className="text-xs text-slate-400 block">
                  إجمالي الزوار
                </span>
                <span className="block text-2xl font-black text-white font-mono mt-1">
                  45,210
                </span>
              </div>
              <div className="p-4 rounded-xl border border-white/5 bg-slate-950/30 text-center">
                <span className="text-xs text-slate-400 block">
                  العقارات المنشورة
                </span>
                <span className="block text-2xl font-black text-white font-mono mt-1">
                  1,204
                </span>
              </div>
              <div className="p-4 rounded-xl border border-white/5 bg-slate-950/30 text-center">
                <span className="text-xs text-slate-400 block">
                  العقارات المباعة
                </span>
                <span className="block text-2xl font-black text-emerald-400 font-mono mt-1">
                  842
                </span>
              </div>
              <div className="p-4 rounded-xl border border-white/5 bg-slate-950/30 text-center">
                <span className="text-xs text-slate-400 block">
                  مستخدمين نشطين
                </span>
                <span className="block text-2xl font-black text-[#F27D26] font-mono mt-1">
                  3,490
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-white/5 bg-slate-900/10 backdrop-blur-md p-6">
                <h3 className="text-sm font-bold text-white mb-4 border-b border-white/5 pb-2">
                  أكثر المحافظات نشاطاً
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">بغداد</span>
                    <span className="font-mono text-emerald-400">45%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">أربيل</span>
                    <span className="font-mono text-emerald-400">25%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">البصرة</span>
                    <span className="font-mono text-emerald-400">15%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">السليمانية</span>
                    <span className="font-mono text-emerald-400">10%</span>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-white/5 bg-slate-900/10 backdrop-blur-md p-6">
                <h3 className="text-sm font-bold text-white mb-4 border-b border-white/5 pb-2">
                  تقارير الأداء
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">
                      متوسط مدة بقاء المستخدم
                    </span>
                    <span className="font-mono text-[#F27D26]">4 دقائق</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">
                      معدل التحويل للإعلانات
                    </span>
                    <span className="font-mono text-[#F27D26]">12.5%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">نسبة نجاح المزادات</span>
                    <span className="font-mono text-[#F27D26]">85%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CMS VIEW */}
        {adminView === "cms" && (
          <div className="space-y-6 animate-fade-in">
            <div className="rounded-2xl border border-white/5 bg-slate-900/10 backdrop-blur-md p-6 flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold text-white mb-1">
                  نظام إدارة المحتوى (CMS)
                </h2>
                <p className="text-xs text-slate-400 font-sans">
                  تعديل الصفحات، المقالات، البنرات الإعلانية وسياسات المنصة
                </p>
              </div>
              <button className="flex items-center gap-2 bg-[#F27D26] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#d96a1a]">
                <Plus className="h-4 w-4" /> صفحة جديدة
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-white/5 bg-slate-900/10 p-6">
                <h3 className="text-sm font-bold text-white mb-4">
                  الصفحات الأساسية
                </h3>
                <div className="space-y-2 text-xs">
                  {[
                    "من نحن",
                    "سياسة الخصوصية",
                    "الشروط والأحكام",
                    "الأسئلة الشائعة",
                  ]?.map((page) => (
                    <div
                      key={page}
                      className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-white/5"
                    >
                      <span className="text-slate-300">{page}</span>
                      <button className="text-blue-400 hover:text-blue-300">
                        تحرير
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-white/5 bg-slate-900/10 p-6">
                <h3 className="text-sm font-bold text-white mb-4">
                  الأخبار والمقالات
                </h3>
                <div className="space-y-2 text-xs">
                  {[
                    "تحديث سوق العقارات العراقي 2026",
                    "أهم النصائح قبل شراء منزل",
                  ]?.map((article) => (
                    <div
                      key={article}
                      className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-white/5"
                    >
                      <span className="text-slate-300 truncate w-3/4">
                        {article}
                      </span>
                      <button className="text-blue-400 hover:text-blue-300">
                        تحرير
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-white/5 bg-slate-900/10 p-6">
              <h3 className="text-sm font-bold text-white mb-4">
                بنرات الصفحة الرئيسية
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                إدارة الصور المتحركة والبنرات الإعلانية في الصفحة الرئيسية (Drag
                & Drop)
              </p>
              <div className="h-32 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center text-slate-500 cursor-pointer hover:border-white/20 hover:text-slate-400">
                + إضافة بنر جديد
              </div>
            </div>
          </div>
        )}

        {/* ADS VIEW */}
        {adminView === "ads" && (
          <div className="space-y-6 animate-fade-in">
            <div className="rounded-2xl border border-white/5 bg-slate-900/10 backdrop-blur-md p-6 flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold text-white mb-1">
                  إدارة الإعلانات الترويجية
                </h2>
                <p className="text-xs text-slate-400 font-sans">
                  التحكم بالحملات الإعلانية المدفوعة ومساحات العرض في المنصة
                </p>
              </div>
              <button className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-500">
                <Plus className="h-4 w-4" /> حملة جديدة
              </button>
            </div>

            <div className="overflow-x-auto bg-slate-900/50 rounded-2xl border border-white/5">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-950/80">
                  <tr className="border-b border-white/5 text-slate-400">
                    <th className="py-3 px-4 font-normal">اسم الحملة</th>
                    <th className="py-3 px-4 font-normal">الموضع</th>
                    <th className="py-3 px-4 font-normal">تاريخ الانتهاء</th>
                    <th className="py-3 px-4 font-normal">
                      المشاهدات (النقرات)
                    </th>
                    <th className="py-3 px-4 font-normal">الحالة</th>
                    <th className="py-3 px-4 font-normal">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr className="text-slate-300 hover:bg-white/[0.02]">
                    <td className="py-3 px-4">إعلان فلل المنصور</td>
                    <td className="py-3 px-4">شريط البحث</td>
                    <td className="py-3 px-4">2026-08-01</td>
                    <td className="py-3 px-4">12,500 (342)</td>
                    <td className="py-3 px-4">
                      <span className="text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                        نشط
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button className="text-blue-400">تعديل</button>
                    </td>
                  </tr>
                  <tr className="text-slate-300 hover:bg-white/[0.02]">
                    <td className="py-3 px-4">مجمع الزهور السكني</td>
                    <td className="py-3 px-4">الصفحة الرئيسية</td>
                    <td className="py-3 px-4">2026-07-15</td>
                    <td className="py-3 px-4">8,200 (150)</td>
                    <td className="py-3 px-4">
                      <span className="text-amber-400 bg-amber-500/10 px-2 py-1 rounded">
                        معلق
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button className="text-blue-400">تعديل</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SETTINGS VIEW */}
        {adminView === "settings" && (
          <div className="space-y-6 animate-fade-in">
            <div className="rounded-2xl border border-white/5 bg-slate-900/10 backdrop-blur-md p-6">
              <h2 className="text-base font-bold text-white mb-1">
                الإعدادات العامة للمنصة
              </h2>
              <p className="text-xs text-slate-400 font-sans">
                التحكم بهوية المنصة، الرسوم، وسائل الدفع والإشعارات
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {/* Brand Settings */}
                <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-5">
                  <h3 className="text-sm font-bold text-white mb-4">
                    هوية المنصة (Branding)
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-slate-400 mb-1">
                        اسم المنصة
                      </label>
                      <input
                        type="text"
                        defaultValue="عدن للوساطة العقارية"
                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">
                        البريد الإلكتروني للإدارة
                      </label>
                      <input
                        type="email"
                        defaultValue="admin@aden-realestate.com"
                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">
                        رقم هاتف الدعم الفني
                      </label>
                      <input
                        type="text"
                        defaultValue="+964 780 000 0000"
                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>

                {/* Notification Settings */}
                <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-5">
                  <h3 className="text-sm font-bold text-white mb-4">
                    الإشعارات والتنبيهات
                  </h3>
                  <div className="space-y-2 text-xs">
                    <label className="flex items-center gap-2 text-slate-300">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-white/10 bg-slate-950"
                      />
                      إرسال بريد إلكتروني عند تسجيل مستخدم جديد
                    </label>
                    <label className="flex items-center gap-2 text-slate-300">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-white/10 bg-slate-950"
                      />
                      إرسال رسالة نصية (SMS) عند الموافقة على عقار
                    </label>
                    <label className="flex items-center gap-2 text-slate-300">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-white/10 bg-slate-950"
                      />
                      إشعارات فورية بالشكاوى الجديدة
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Fee Settings */}
                <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-5">
                  <h3 className="text-sm font-bold text-white mb-4">
                    الرسوم والتسعير (IQD)
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-slate-400 mb-1">
                        سعر الإعلان المميز (الباقة الأساسية)
                      </label>
                      <input
                        type="number"
                        defaultValue="25000"
                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">
                        رسوم الاشتراك في المزادات
                      </label>
                      <input
                        type="number"
                        defaultValue="100000"
                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">
                        رسوم إنشاء المكاتبات الإلكترونية
                      </label>
                      <input
                        type="number"
                        defaultValue="15000"
                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Integration Settings */}
                <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-5">
                  <h3 className="text-sm font-bold text-white mb-4">
                    إعدادات الخرائط والدفع
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-slate-400 mb-1">
                        Google Maps API Key
                      </label>
                      <input
                        type="password"
                        defaultValue="**********************"
                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">
                        Zain Cash Merchant ID
                      </label>
                      <input
                        type="text"
                        defaultValue="ZC_123456"
                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl text-sm transition-all shadow-lg">
                حفظ جميع الإعدادات
              </button>
            </div>
          </div>
        )}

        {/* SERVICES VIEW */}
        {adminView === "services" && (
          <div className="space-y-6 animate-fade-in">
            <div className="rounded-2xl border border-white/5 bg-slate-900/10 backdrop-blur-md p-6 flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold text-white mb-1">
                  إدارة الخدمات العقارية
                </h2>
                <p className="text-xs text-slate-400 font-sans">
                  مراجعة حسابات مقدمي الخدمات والموافقة عليها
                </p>
              </div>
              <button className="flex items-center gap-2 bg-[#F27D26] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#d96a1a]">
                <Plus className="h-4 w-4" /> مقدم خدمة جديد
              </button>
            </div>

            <div className="overflow-x-auto bg-slate-900/50 rounded-2xl border border-white/5">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-950/80">
                  <tr className="border-b border-white/5 text-slate-400">
                    <th className="py-3 px-4 font-normal">اسم مقدم الخدمة</th>
                    <th className="py-3 px-4 font-normal">الفئة</th>
                    <th className="py-3 px-4 font-normal">المحافظة</th>
                    <th className="py-3 px-4 font-normal">الاشتراك</th>
                    <th className="py-3 px-4 font-normal">الحالة</th>
                    <th className="py-3 px-4 font-normal">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr className="text-slate-300 hover:bg-white/[0.02]">
                    <td className="py-3 px-4 font-bold text-white">
                      مكتب الرواد للمساحة
                    </td>
                    <td className="py-3 px-4">مكاتب المساحة والمساحين</td>
                    <td className="py-3 px-4">بغداد</td>
                    <td className="py-3 px-4">أعمال (Business)</td>
                    <td className="py-3 px-4">
                      <span className="text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                        معتمد
                      </span>
                    </td>
                    <td className="py-3 px-4 flex gap-2">
                      <button className="text-blue-400 hover:text-blue-300">
                        مراجعة
                      </button>
                      <button className="text-red-400 hover:text-red-300">
                        إيقاف
                      </button>
                    </td>
                  </tr>
                  <tr className="text-slate-300 hover:bg-white/[0.02]">
                    <td className="py-3 px-4 font-bold text-white">
                      شركة البيت الحديث للمقاولات
                    </td>
                    <td className="py-3 px-4">شركات البناء والمقاولات</td>
                    <td className="py-3 px-4">أربيل</td>
                    <td className="py-3 px-4">احترافي (Pro)</td>
                    <td className="py-3 px-4">
                      <span className="text-amber-400 bg-amber-500/10 px-2 py-1 rounded">
                        بانتظار المراجعة
                      </span>
                    </td>
                    <td className="py-3 px-4 flex gap-2">
                      <button className="text-emerald-400 hover:text-emerald-300">
                        قبول
                      </button>
                      <button className="text-red-400 hover:text-red-300">
                        رفض
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* AGREEMENTS VIEW */}
        {adminView === "agreements" && selectedAgreementId ? (
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-4 sm:p-6 overflow-hidden">
             <ElectronicAgreementView
               agreementId={selectedAgreementId}
               lang="ar"
               onBack={() => setSelectedAgreementId(null)}
             />
          </div>
        ) : adminView === "agreements" && (
          <div className="space-y-6 animate-fade-in">
            <div className="rounded-2xl border border-white/5 bg-slate-900/10 backdrop-blur-md p-6 flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold text-white mb-1">
                  المكاتبات الإلكترونية
                </h2>
                <p className="text-xs text-slate-400 font-sans">
                  مراجعة والتحقق من صحة المكاتبات التي تمت بين البائع والمشتري
                </p>
              </div>
            </div>

            <div className="overflow-x-auto bg-slate-900/50 rounded-2xl border border-white/5">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-950/80">
                  <tr className="border-b border-white/5 text-slate-400">
                    <th className="py-3 px-4 font-normal">رقم الوثيقة</th>
                    <th className="py-3 px-4 font-normal">البائع</th>
                    <th className="py-3 px-4 font-normal">المشتري</th>
                    <th className="py-3 px-4 font-normal">السعر (د.ع)</th>
                    <th className="py-3 px-4 font-normal">تاريخ الإصدار</th>
                    <th className="py-3 px-4 font-normal">الدفع</th>
                    <th className="py-3 px-4 font-normal">الحالة</th>
                    <th className="py-3 px-4 font-normal">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {agreements.map((agr: any) => (
                    <tr key={agr.id} className="text-slate-300 hover:bg-white/[0.02]">
                      <td className="py-3 px-4 font-mono text-[#F27D26]">
                        {agr.serialNumber}
                      </td>
                      <td className="py-3 px-4 font-bold text-white">
                        {agr.sellerName}
                      </td>
                      <td className="py-3 px-4">{agr.buyerName}</td>
                      <td className="py-3 px-4 font-sans text-white">
                        {agr.agreedPrice?.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-sans">
                        {new Date(agr.createdAt).toLocaleDateString("en-GB")}
                      </td>
                      <td className="py-3 px-4">
                        {agr.buyerPaid && agr.sellerPaid ? (
                           <span className="text-emerald-400 font-bold">مدفوعة</span>
                        ) : (
                           <span className="text-amber-400 font-bold">بانتظار الدفع</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded ${agr.status === 'active' ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'}`}>
                          {agr.status === 'active' ? 'سارية' : (agr.status === 'pending_approval' ? 'معلقة' : agr.status)}
                        </span>
                      </td>
                      <td className="py-3 px-4 flex gap-2">
                        <button 
                          onClick={() => setSelectedAgreementId(agr.id)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          عرض
                        </button>
                      </td>
                    </tr>
                  ))}
                  {agreements.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-slate-500">لا توجد مكاتبات</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* AGREEMENT PAYMENTS VIEW */}
        {adminView === "agreement-payments" && (
          <div className="space-y-6 animate-fade-in">
            <div className="rounded-2xl border border-white/5 bg-slate-900/10 backdrop-blur-md p-6 flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold text-white mb-1">
                  طلبات دفع المكاتبات الإلكترونية
                </h2>
                <p className="text-xs text-slate-400 font-sans">
                  مراجعة واعتماد طلبات الدفع الواردة لإصدار المكاتبات
                </p>
              </div>
            </div>

            <div className="overflow-x-auto bg-slate-900/50 rounded-2xl border border-white/5">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-950/80">
                  <tr className="border-b border-white/5 text-slate-400">
                    <th className="py-3 px-4 font-normal">اسم الدافع</th>
                    <th className="py-3 px-4 font-normal">رقم الهاتف</th>
                    <th className="py-3 px-4 font-normal">وسيلة الدفع</th>
                    <th className="py-3 px-4 font-normal">المبلغ (د.ع)</th>
                    <th className="py-3 px-4 font-normal">تاريخ الإرسال</th>
                    <th className="py-3 px-4 font-normal">الحالة</th>
                    <th className="py-3 px-4 font-normal">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {agreementRequests.map((req) => (
                    <tr
                      key={req.id}
                      className="text-slate-300 hover:bg-white/[0.02]"
                    >
                      <td className="py-3 px-4 font-bold text-white">
                        {req.payerName}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {req.phone}
                      </td>
                      <td className="py-3 px-4">
                        {req.method === "zain_cash" ? (
                          <span className="flex items-center gap-1.5">
                            <span className="w-5 h-5 bg-red-500/20 text-red-400 rounded flex items-center justify-center font-bold text-[10px]">
                              Z
                            </span>
                            زين كاش
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5">
                            <span className="w-5 h-5 bg-blue-500/20 text-blue-400 rounded flex items-center justify-center font-bold text-[10px]">
                              M
                            </span>
                            ماستر كارد
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-sans text-white">
                        {req.amount}
                      </td>
                      <td className="py-3 px-4 font-sans">{req.date}</td>
                      <td className="py-3 px-4">
                        {req.status === "pending" && (
                          <span className="text-amber-400 bg-amber-500/10 px-2 py-1 rounded">
                            بانتظار المراجعة
                          </span>
                        )}
                        {req.status === "approved" && (
                          <span className="text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                            معتمدة
                          </span>
                        )}
                        {req.status === "rejected" && (
                          <span className="text-red-400 bg-red-500/10 px-2 py-1 rounded">
                            مرفوضة
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 flex gap-2">
                        <button
                          onClick={() => setSelectedPaymentProof(req)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          عرض الإثبات
                        </button>
                        {req.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApproveRequest(req.id)}
                              className="text-emerald-400 hover:text-emerald-300"
                            >
                              اعتماد
                            </button>
                            <button
                              onClick={() => handleRejectRequest(req.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              رفض
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* INSPECT PROPERTY DETAIL MODAL - رؤية كامل تفاصيل العرض والتدقيق */}
      {selectedInspectProperty && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md overflow-y-auto text-right"
          dir="rtl"
        >
          <div className="relative w-full max-w-4xl rounded-3xl border border-white/10 bg-[#070707] p-6 shadow-2xl md:p-8 animate-scale-in max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setSelectedInspectProperty(null)}
              className="absolute top-4 left-4 flex h-9 w-9 items-center justify-center rounded-xl border border-white/5 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-all z-10"
            >
              ✕
            </button>

            <div className="space-y-6">
              {/* Header Title */}
              <div className="border-b border-white/5 pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold bg-[#F27D26]/10 text-[#F27D26] px-2.5 py-0.5 rounded">
                    رقم المعرف: {selectedInspectProperty.id}
                  </span>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                    السعر المالي:{" "}
                    {(selectedInspectProperty.price ?? 0).toLocaleString()} د.ع
                  </span>
                  {selectedInspectProperty.isApproved ? (
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      العرض نشط عام
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded animate-pulse">
                      بانتظار الموافقة والنشر
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-black text-white mt-2 leading-tight">
                  {selectedInspectProperty.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  📍 المخطط: {selectedInspectProperty.governorate} •{" "}
                  {selectedInspectProperty.district} •{" "}
                  {selectedInspectProperty.subDistrict || "لا يوجد"} •{" "}
                  {selectedInspectProperty.neighborhood}
                </p>
              </div>

              {/* Photos & Videos Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 mb-2">
                    معرض صور العقار المدخلة:
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedInspectProperty.images?.map((img, i) => (
                      <a
                        key={i}
                        href={img}
                        target="_blank"
                        rel="noreferrer"
                        className="relative h-20 rounded-lg overflow-hidden border border-white/5 hover:border-[#F27D26] block"
                      >
                        <img
                          src={img}
                          alt="Property"
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </a>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 mb-2">
                    الفيديو المرفق (إن وجد):
                  </h4>
                  {selectedInspectProperty.videoUrl ? (
                    <div className="rounded-xl overflow-hidden border border-white/5 bg-black h-24 flex items-center justify-center p-2">
                      <a
                        href={selectedInspectProperty.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-[#F27D26] underline hover:text-[#ff8a3d]"
                      >
                        اضغط لفتح ومعاينة رابط الفيديو المرفق ↗
                      </a>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic py-6">
                      لم يتم إرفاق أي فيديو مع هذا العرض.
                    </p>
                  )}
                </div>
              </div>

              {/* Specifications details */}
              <div className="border-t border-white/5 pt-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-400">
                  مواصفات وتصاميم العقار الدقيقة:
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="bg-white/5 p-2.5 rounded-xl">
                    <span className="text-slate-400">المساحة الكلية:</span>{" "}
                    <span className="font-bold text-white font-mono">
                      {selectedInspectProperty.space} م²
                    </span>
                  </div>
                  <div className="bg-white/5 p-2.5 rounded-xl">
                    <span className="text-slate-400">نوع العقار سكن:</span>{" "}
                    <span className="font-bold text-white">
                      {selectedInspectProperty.buildingType}
                    </span>
                  </div>
                  <div className="bg-white/5 p-2.5 rounded-xl">
                    <span className="text-slate-400">غرف النوم:</span>{" "}
                    <span className="font-bold text-white font-mono">
                      {selectedInspectProperty.bedrooms}
                    </span>
                  </div>
                  <div className="bg-white/5 p-2.5 rounded-xl">
                    <span className="text-slate-400">الحمامات:</span>{" "}
                    <span className="font-bold text-white font-mono">
                      {selectedInspectProperty.bathrooms}
                    </span>
                  </div>
                  <div className="bg-white/5 p-2.5 rounded-xl">
                    <span className="text-slate-400">الصالات السكنية:</span>{" "}
                    <span className="font-bold text-white font-mono">
                      {selectedInspectProperty.livingRooms || 0}
                    </span>
                  </div>
                  <div className="bg-white/5 p-2.5 rounded-xl">
                    <span className="text-slate-400">عدد الطوابق:</span>{" "}
                    <span className="font-bold text-white font-mono">
                      {selectedInspectProperty.floors || 1}
                    </span>
                  </div>
                  <div className="bg-white/5 p-2.5 rounded-xl">
                    <span className="text-slate-400">سنة التشييد:</span>{" "}
                    <span className="font-bold text-white font-mono">
                      {selectedInspectProperty.constructionYear || "غير محدد"}
                    </span>
                  </div>
                  <div className="bg-white/5 p-2.5 rounded-xl">
                    <span className="text-slate-400">حالة التأثيث:</span>{" "}
                    <span className="font-bold text-white">
                      {selectedInspectProperty.isFurnished
                        ? "مؤثث بالكامل"
                        : "غير مؤثث"}
                    </span>
                  </div>
                </div>

                {/* Amenities checklist */}
                <div className="flex flex-wrap gap-2 text-[11px] pt-1.5">
                  {selectedInspectProperty.hasGarage && (
                    <span className="bg-[#F27D26]/10 text-[#F27D26] px-2 py-1 rounded">
                      كراج سيارة
                    </span>
                  )}
                  {selectedInspectProperty.hasGarden && (
                    <span className="bg-[#F27D26]/10 text-[#F27D26] px-2 py-1 rounded">
                      حديقة منزلية
                    </span>
                  )}
                  {selectedInspectProperty.hasElevator && (
                    <span className="bg-[#F27D26]/10 text-[#F27D26] px-2 py-1 rounded">
                      مصعد كهربائي
                    </span>
                  )}
                  {selectedInspectProperty.hasGenerator && (
                    <span className="bg-[#F27D26]/10 text-[#F27D26] px-2 py-1 rounded">
                      مولدة طاقة
                    </span>
                  )}
                  {selectedInspectProperty.hasSolarPower && (
                    <span className="bg-[#F27D26]/10 text-[#F27D26] px-2 py-1 rounded">
                      منظومة شمسية
                    </span>
                  )}
                  {selectedInspectProperty.hasPool && (
                    <span className="bg-[#F27D26]/10 text-[#F27D26] px-2 py-1 rounded">
                      مسبح خاص
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="border-t border-white/5 pt-4">
                <h4 className="text-xs font-bold text-slate-400 mb-1.5">
                  الوصف التفصيلي المرفق:
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed bg-white/5 p-3 rounded-xl whitespace-pre-line">
                  {selectedInspectProperty.description}
                </p>
              </div>

              {/* Contact and Owner Verification Details */}
              <div className="border-t border-white/5 pt-4">
                <h4 className="text-xs font-bold text-slate-400 mb-3">
                  بيانات التواصل والملكية للتحقق:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-white/5">
                    <span className="text-slate-400 block mb-1">
                      اسم المعلن
                    </span>
                    <span className="font-bold text-white">
                      {selectedInspectProperty.advertiserName || "غير متوفر"}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-white/5">
                    <span className="text-slate-400 block mb-1">
                      رقم الهاتف للاتصال
                    </span>
                    <span className="font-bold text-white font-mono select-all text-[#F27D26]">
                      {selectedInspectProperty.advertiserPhone || "غير متوفر"}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-white/5">
                    <span className="text-slate-400 block mb-1">
                      رقم هاتف الواتساب
                    </span>
                    <span className="font-bold text-white font-mono select-all text-emerald-400">
                      {selectedInspectProperty.advertiserWhatsapp ||
                        "غير متوفر"}
                    </span>
                  </div>

                  {selectedInspectProperty.ownerEmailOrPhone && (
                    <div className="p-3 rounded-xl bg-slate-900/40 border border-dashed border-[#F27D26]/20 sm:col-span-3">
                      <span className="text-slate-400 block mb-1">
                        حساب المواطن المالك المسجل (Email/Phone)
                      </span>
                      <span className="font-bold text-[#F27D26] font-mono">
                        {selectedInspectProperty.ownerEmailOrPhone}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Approve & Delete inside details */}
              <div className="border-t border-white/5 pt-5 flex justify-end gap-3">
                {!selectedInspectProperty.isApproved && (
                  <button
                    onClick={() => {
                      handleApproveProperty(selectedInspectProperty.id);
                      setSelectedInspectProperty(null);
                    }}
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-3 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="h-4 w-4" />
                    <span>موافقة ونشر للعقارات العامة</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    handleDeleteProperty(selectedInspectProperty.id);
                    setSelectedInspectProperty(null);
                  }}
                  className="rounded-xl bg-rose-600/10 border border-rose-500/20 hover:bg-rose-600 text-rose-400 hover:text-white px-5 py-3 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>حذف وإلغاء العقار</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedInspectProperty(null)}
                  className="rounded-xl border border-white/5 bg-white/5 px-5 py-3 text-xs font-bold text-slate-300 hover:bg-white/10 transition-all"
                >
                  إغلاق نافذة المعاينة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
