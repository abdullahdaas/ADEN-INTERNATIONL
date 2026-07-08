import AdenLogo from "./components/AdenLogo";
import React, { useState, useEffect } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { Mail,
  Building,
  MapPin,
  Phone,
  MessageSquare,
  Award,
  HelpCircle,
  Sparkles,
  Star,
  CheckCircle,
  Flame,
  ArrowLeft,
  Heart,
  X,
  MessageCircle,
  Info,
  Trash2,
  Send,
  PlusCircle,
  ShieldCheck,
  BadgeCheck,
  ClipboardList,
  Calendar,
  Layers,
  Eye,
} from "lucide-react";
import Header from "./components/Header";
import HeroSearch from "./components/HeroSearch";
import PropertyCard, { formatPrice } from "./components/PropertyCard";
import CompletedDealsList from "./components/CompletedDealsList";
import MarketIndicators from "./components/MarketIndicators";
import LiveActivityTicker from "./components/LiveActivityTicker";
import CompareView from "./components/CompareView";
import PropertyDetails from "./components/PropertyDetails";
import AdminPortal from "./components/AdminPortal";
import CitizenProperties from "./components/CitizenProperties";
import UserProfileView from "./components/UserProfileView";
import ServiceProvidersList from "./components/ServiceProvidersList";
import ServiceProviderProfile from "./components/ServiceProviderProfile";
import VerifyAgreement from "./components/VerifyAgreement";
import ElectronicAgreementForm from "./components/ElectronicAgreementForm";
import ElectronicAgreementView from "./components/ElectronicAgreementView";
import MyAgreementsList from "./components/MyAgreementsList";
import { SmartLocationPicker } from "./components/SmartLocationPicker";
import MapSearch from "./components/MapSearch";
import { Property, CompletedDeal, ContactMessage, Agent } from "./types";
import {
  fetchProperties,
  fetchDeals,
  sendMessage,
  createProperty,
  buildMarketStats,
  subscribeToSupabaseTables,
} from "./utils/api";
import { translations } from "./utils/translations";
import { batchUploadToSupabase } from "./data/supabaseStorage";

export default function App() {
  const [verifySerialNumber, setVerifySerialNumber] = useState("");
  const [currentView, setView] = useState<
    | "home"
    | "listings"
    | "map-search"
    | "details"
    | "admin"
    | "contact"
    | "compare"
    | "my-properties"
    | "profile"
    | "service-providers"
    | "service-provider-profile"
    | "my-agreements"
    | "electronic-agreement-form"
    | "electronic-agreement-view"
    | "verify-agreement"
  >("home");
  const [profileIdentity, setProfileIdentity] = useState<string | null>(null);
  const [selectedServiceProvider, setSelectedServiceProvider] =
    useState<any>(null);
  const [selectedAgreementId, setSelectedAgreementId] = useState<string | null>(
    null,
  );
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null,
  );

  // Favorites and Compare states
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [compareList, setCompareList] = useState<Property[]>([]);
  const [showFavoritesDrawer, setShowFavoritesDrawer] = useState(false);

  // Completed deals & stats from server
  const [deals, setDeals] = useState<CompletedDeal[]>([]);
  const [stats, setStats] = useState<any>({
    activeCount: 0,
    soldCount: 0,
    rentedCount: 0,
    avgDaysToSell: 0,
    avgDaysToRent: 0,
    highestSale: 0,
    highestRent: 0,
    activeRegions: [],
    governorateStats: [],
  });

  // Filter state for Listings Search
  const [listingsFilters, setListingsFilters] = useState<Record<string, any>>({
    status: "للبيع",
  });

  // Language & User Session state
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const [theme, setTheme] = useState<"dark" | "light">(() => (localStorage.getItem("aden-theme") as "dark" | "light") || "dark");

  useEffect(() => {
    if (theme === "light") {
      document.documentElement.setAttribute("data-theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    localStorage.setItem("aden-theme", theme);
  }, [theme]);
  const [user, setUser] = useState<{
    name: string;
    role: "admin" | "citizen";
  } | null>(null);

  // Modals state
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false);

  // Login fields
  const [loginRole, setLoginRole] = useState<"citizen" | "admin">("citizen");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [citizenName, setCitizenName] = useState("");
  const [citizenEmailOrPhone, setCitizenEmailOrPhone] = useState("");
  const [citizenPassword, setCitizenPassword] = useState("");
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Add Property Fields
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newSpace, setNewSpace] = useState("");
  const [newLocationData, setNewLocationData] = useState<any>(null);
  const [isLocationValid, setIsLocationValid] = useState(false);
  const [newBuildingType, setNewBuildingType] = useState("منزل");
  const [newStatus, setNewStatus] = useState<any>("للبيع");
  const [newAuctionStart, setNewAuctionStart] = useState("");
  const [newAuctionEnd, setNewAuctionEnd] = useState("");
  const [newStartingPrice, setNewStartingPrice] = useState("");
  const [newDocuments, setNewDocuments] = useState<
    { title: string; url: string; isPublic: boolean }[]
  >([]);
  const [newBedrooms, setNewBedrooms] = useState("3");
  const [newBathrooms, setNewBathrooms] = useState("2");
  const [newLivingRooms, setNewLivingRooms] = useState("1");
  const [newFloors, setNewFloors] = useState("2");
  const [newConstructionYear, setNewConstructionYear] = useState("2025");
  const [newIsFurnished, setNewIsFurnished] = useState(false);
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadedVideo, setUploadedVideo] = useState<string>("");
  const [advertiserName, setAdvertiserName] = useState("");
  const [advertiserPhone, setAdvertiserPhone] = useState("");
  const [advertiserWhatsapp, setAdvertiserWhatsapp] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string>('');
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [newAgentId, setNewAgentId] = useState("abdullah_daas");

  // Amenities
  const [hasGarage, setHasGarage] = useState(false);
  const [hasGarden, setHasGarden] = useState(false);
  const [hasElevator, setHasElevator] = useState(false);
  const [hasGenerator, setHasGenerator] = useState(false);
  const [hasSolarPower, setHasSolarPower] = useState(false);
  const [hasPool, setHasPool] = useState(false);

  const [addSuccess, setAddSuccess] = useState(false);
  const [addError, setAddError] = useState("");

  // Citizen Submitted Properties (stored in localStorage)
  const [citizenSubmittedProps, setCitizenSubmittedProps] = useState<
    Property[]
  >([]);

  // Contact Page Form
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactType, setContactType] = useState<
    "general" | "office_request" | "complaint"
  >("general");
  const [contactMsg, setContactMsg] = useState("");
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactSubmitting, setContactSubmitting] = useState(false);

  // Dynamic Locations lookup lists
  const [districtsList, setDistrictsList] = useState<any[]>([]);
  const [subDistrictsList, setSubDistrictsList] = useState<any[]>([]);
  const [neighborhoodsList, setNeighborhoodsList] = useState<string[]>([]);

  const t = translations[lang];

  // Guided Tour
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('aden-tour-completed');
    if (!hasSeenTour) {
      const tour = driver({
        showProgress: true,
        animate: true,
        allowClose: false,
        nextBtnText: lang === 'ar' ? 'التالي' : 'Next',
        prevBtnText: lang === 'ar' ? 'السابق' : 'Prev',
        doneBtnText: lang === 'ar' ? 'إنهاء' : 'Done',
        popoverClass: 'driver-theme-glass',
        steps: [
          {
            element: '#app-header',
            popover: {
              title: lang === 'ar' ? 'تصفح الخدمات' : 'Browse Services',
              description: lang === 'ar' ? 'اسحب يمين ويسار هنا لتصفح جميع خدمات منصة عدن.' : 'Swipe left/right here to browse all services of Aden platform.',
              side: 'bottom', align: 'center'
            }
          },
          {
            element: '#search-filter-section',
            popover: {
              title: lang === 'ar' ? 'البحث الذكي' : 'Smart Search',
              description: lang === 'ar' ? 'اختر نوع العقار وابحث بسهولة عن مساحتك المثالية.' : 'Choose property type and easily search for your ideal space.',
              side: 'bottom', align: 'center'
            }
          },
          {
            element: '#hero-banner',
            popover: {
              title: lang === 'ar' ? 'أهلاً بك في عدن' : 'Welcome to Aden',
              description: lang === 'ar' ? 'هنا تجد الوجهة الأذكى لخياراتك العقارية.' : 'Here is the smartest destination for your real estate choices.',
              side: 'bottom', align: 'center'
            }
          }
        ],
        onDestroyStarted: () => {
          localStorage.setItem('aden-tour-completed', 'true');
          tour.destroy();
        }
      });
      setTimeout(() => tour.drive(), 800);
    }
  }, [lang]);

  // Fetch user specific data on user change
  useEffect(() => {
    if (user?.role === "citizen" && user.emailOrPhone) {
      // Fetch user's own properties
      fetchProperties({ isApproved: "all" })
        .then((props) => {
          const myProps = props.filter(
            (p) =>
              p.ownerEmailOrPhone &&
              p.ownerEmailOrPhone.toLowerCase() ===
                user.emailOrPhone.toLowerCase(),
          );
          setCitizenSubmittedProps(myProps);
        })
        .catch(console.error);
    } else if (!user) {
      setCitizenSubmittedProps([]);
    }
  }, [user]);

  const refreshCitizenSubmittedProperties = async () => {
    if (user?.role !== "citizen" || !user.emailOrPhone) {
      setCitizenSubmittedProps([]);
      return;
    }

    try {
      const props = await fetchProperties({ isApproved: "all" });
      const myProps = props.filter(
        (p) =>
          p.ownerEmailOrPhone &&
          p.ownerEmailOrPhone.toLowerCase() === user.emailOrPhone?.toLowerCase(),
      );
      setCitizenSubmittedProps(myProps);
    } catch (error) {
      console.error("Failed to refresh citizen properties:", error);
    }
  };

  const loadData = async () => {
    try {
      const [props, serverDeals] = await Promise.all([
        fetchProperties(listingsFilters),
        fetchDeals(),
      ]);
      setProperties(props);
      
      // Sync dependent lists to ensure deleted items are removed
      setFavorites(prev => {
        const synced = prev.filter(f => props.some(p => p.id === f.id));
        localStorage.setItem("aden-favorites", JSON.stringify(synced));
        return synced;
      });
      
      setCompareList(prev => {
        const synced = prev.filter(c => props.some(p => p.id === c.id));
        localStorage.setItem("aden-compare", JSON.stringify(synced));
        return synced;
      });

      setDeals(serverDeals);
      setStats(buildMarketStats(props, serverDeals));
    } catch (err) {
      console.error("Error fetching data from API:", err);
    }
  };

  // Re-load listings when filters update or on initial boot
  useEffect(() => {
    loadData();
  }, [listingsFilters]);

  useEffect(() => {
    const refreshAll = async () => {
      await loadData();
      await refreshCitizenSubmittedProperties();
    };

    const unsubscribe = subscribeToSupabaseTables(["properties", "deals"], () => {
      void refreshAll();
    });

    return unsubscribe;
  }, [listingsFilters, user?.role, user?.emailOrPhone]);

  // Load configuration and persistent states
  useEffect(() => {
    // 1. Language preference
    const cachedLang = localStorage.getItem("aden-lang");
    if (cachedLang === "en" || cachedLang === "ar") {
      setLang(cachedLang);
    }

    // 2. User session
    const cachedUser = localStorage.getItem("aden-user");
    if (cachedUser && cachedUser !== "undefined") {
      try {
        setUser(JSON.parse(cachedUser));
      } catch (e) {
        console.error(e);
      }
    }

    // 3. Saved favorites
    const cachedFavs = localStorage.getItem("aden-favorites");
    if (cachedFavs && cachedFavs !== "undefined") {
      try {
        setFavorites(JSON.parse(cachedFavs));
      } catch (e) {
        console.error(e);
      }
    }

    // 5. Query params check (for unique user profile links)
    const urlParams = new URLSearchParams(window.location.search);
    const profileSlug = urlParams.get("profile");
    if (profileSlug) {
      setProfileIdentity(profileSlug);
      setView("profile");
    }

    // 6. Check for electronic agreement URL
    
    const path = window.location.pathname;
    if (path.startsWith("/letter/")) {
      const parts = path.split("/");
      if (parts.length >= 3 && parts[2]) {
        setSelectedAgreementId(parts[2]);
        setView("electronic-agreement-view");
      }
    }
    
    if (path.startsWith("/verify/")) {
      const parts = path.split("/");
      if (parts.length >= 3 && parts[2]) {
        setVerifySerialNumber(parts[2]);
        setView("verify-agreement");
      }
    }
  }, []);

  // Save language preference when updated
  useEffect(() => {
    localStorage.setItem("aden-lang", lang);
  }, [lang]);

  // Sync Locations Dropdowns for Add Property Form
  

  

  const saveFavorites = (newFavs: Property[]) => {
    setFavorites(newFavs);
    localStorage.setItem("aden-favorites", JSON.stringify(newFavs));
  };

  const handleToggleFavorite = (prop: Property) => {
    const exists = favorites.find((f) => f.id === prop.id);
    let updated;
    if (exists) {
      updated = favorites.filter((f) => f.id !== prop.id);
    } else {
      updated = [...favorites, prop];
    }
    saveFavorites(updated);
  };

  const handleToggleCompare = (prop: Property) => {
    const exists = compareList.find((c) => c.id === prop.id);
    if (exists) {
      setCompareList(compareList.filter((c) => c.id !== prop.id));
    } else {
      if (compareList.length >= 3) {
        alert(
          lang === "ar"
            ? "يمكنك مقارنة 3 عقارات كحد أقصى في وقت واحد!"
            : "You can compare up to 3 properties at once!",
        );
        return;
      }
      setCompareList([...compareList, prop]);
    }
  };

  const handleSelectProperty = async (prop: Property) => {
    setSelectedProperty(prop);
    setView("details");

    // Refresh to fetch with updated view count incremented by backend
    try {
      const res = await fetch(`/api/properties/${prop.id}`);
      if (res.ok) {
        const updated = await res.json();
        setSelectedProperty(updated);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearchTrigger = (filters: Record<string, any>) => {
    setListingsFilters(filters);
    setView("listings");
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactPhone || !contactMsg || contactSubmitting) return;

    setContactSubmitting(true);

    try {
      await sendMessage({
        name: contactName,
        phone: contactPhone,
        message: contactMsg,
        type: contactType,
        subject: `طلب تواصل بخصوص: ${contactType === "general" ? "استفسار عام" : contactType === "office_request" ? "تسجيل مكتب" : "شكوى أو بلاغ"}`,
      });
      setContactSuccess(true);
      setContactName("");
      setContactPhone("");
      setContactMsg("");
      setTimeout(() => setContactSuccess(false), 5000);
    } catch (err) {
      console.error(err);
      alert(lang === "ar" ? "تعذر إرسال الرسالة حالياً. حاول مرة أخرى." : "Failed to send your message. Please try again.");
    } finally {
      setContactSubmitting(false);
    }
  };

  // Perform Citizen/Admin Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (loginRole === "citizen") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^(\+?\d{8,15})$/;
      const identifier = citizenEmailOrPhone.trim();

      if (!emailRegex.test(identifier) && !phoneRegex.test(identifier)) {
        setLoginError(
          lang === "ar"
            ? "يرجى إدخال بريد إلكتروني صالح أو رقم هاتف صحيح!"
            : "Please enter a valid email or phone number!",
        );
        return;
      }

      if (!citizenEmailOrPhone.trim() || !citizenPassword.trim()) {
        setLoginError(
          lang === "ar"
            ? "يرجى إدخال البريد الإلكتروني أو رقم الهاتف مع كلمة المرور!"
            : "Please enter your email or phone and password!",
        );
        return;
      }
      if (citizenPassword.length !== 4) {
        setLoginError(
          lang === "ar"
            ? "كلمة المرور يجب أن تتكون من 4 أرقام أو حروف فقط!"
            : "Password must be exactly 4 characters or digits!",
        );
        return;
      }
      
      if (authMode === "register" && !citizenName.trim()) {
        setLoginError(
          lang === "ar"
            ? "يرجى إدخال الاسم الكريم للتسجيل!"
            : "Please enter your name for registration!",
        );
        return;
      }

      try {
        const endpoint = authMode === "register" ? "/api/citizen-register" : "/api/citizen-login";
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            emailOrPhone: citizenEmailOrPhone,
            password: citizenPassword,
            name: citizenName,
          }),
        });
        const data = await res.json();

        if (data.success) {
          setUser(data.profile);
          localStorage.setItem("aden-user", JSON.stringify(data.profile));
          if (data.token) localStorage.setItem('aden_token', data.token);
          setIsLoginOpen(false);
          setCitizenName("");
          setCitizenEmailOrPhone("");
          setCitizenPassword("");
          alert(authMode === "register" ? (lang === "ar" ? "تم إنشاء الحساب وتسجيل الدخول بنجاح!" : "Account created successfully!") : t.loginSuccess);
        } else {
          setLoginError(data.message || t.loginError);
        }
      } catch (err) {
        setLoginError(
          lang === "ar"
            ? "خطأ في الاتصال بالخادم!"
            : "Server connection failed!",
        );
      }
    } else {
      // Admin flow
      if (!adminUsername || !adminPassword) {
        setLoginError(
          lang === "ar" ? "يرجى ملء جميع الحقول!" : "Please fill all fields!",
        );
        return;
      }
      try {
        const res = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: adminUsername,
            password: adminPassword,
          }),
        });
        const data = await res.json();
        if (data.success) {
          const newSessionUser = {
            name: "عبدالله الدعاس",
            role: "admin" as const,
          };
          setUser(newSessionUser);
          localStorage.setItem("aden-user", JSON.stringify(newSessionUser));
          localStorage.setItem("aden-admin-auth", "true");
          setIsLoginOpen(false);
          setAdminUsername("");
          setAdminPassword("");
          setView("admin");
        } else {
          setLoginError(t.loginError);
        }
      } catch (err) {
        setLoginError(
          lang === "ar"
            ? "خطأ في الاتصال بالخادم!"
            : "Server connection failed!",
        );
      }
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCitizenSubmittedProps([]);
    setFavorites([]);
    setCompareList([]);
    localStorage.removeItem("aden-user");
    localStorage.removeItem("aden_token");
    localStorage.removeItem("aden-admin-auth");
    localStorage.removeItem("aden-citizen-props");
    localStorage.removeItem("aden-favorites");
    localStorage.removeItem("aden-compare");
    setView("home");
  };

  
  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      console.log("[compressImage] Starting compression for:", file.name, "Size:", file.size);
      const startTime = Date.now();
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_SIZE = 1200;
          
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", { type: 'image/webp' });
              console.log(`[compressImage] Completed in ${Date.now() - startTime}ms. New size: ${compressedFile.size}`);
              resolve(compressedFile);
            } else {
              console.error("[compressImage] Canvas to Blob failed");
              reject(new Error('Canvas to Blob failed'));
            }
          }, 'image/webp', 0.85);
        };
        img.onerror = (error) => {
          console.error("[compressImage] Image load error", error);
          reject(error);
        };
      };
      reader.onerror = (error) => {
        console.error("[compressImage] FileReader error", error);
        reject(error);
      };
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setIsUploadingImage(true);
    setUploadProgress(0);
    setUploadError('');
    
    console.log("[handleImageUpload] Starting upload for", files.length, "files");
    const startTimeTotal = Date.now();
    
    const tempPropertyId = 'temp_' + Date.now() + Math.random().toString(36).substring(2,7);
    
    try {
      // Compress all files before upload
      const compressedFiles = await Promise.all(
        Array.from(files).map((file: any) => compressImage(file as File))
      );

      // Batch upload directly to Supabase Storage public bucket
      const results = await batchUploadToSupabase(tempPropertyId, compressedFiles, (prog) => {
        setUploadProgress(prog);
      });
      
      console.log(`[handleImageUpload] All uploads resolved in ${Date.now() - startTimeTotal}ms. URLs:`, results);
      
      setUploadedImages((prev) => [...prev, ...results]);
      setIsUploadingImage(false);
      setUploadProgress(100);
      
      setTimeout(() => setUploadProgress(0), 1000);
      
    } catch (err: any) {
      console.error("[handleImageUpload] Caught error:", err);
      const errorMsg = err.message || 'Unknown error';
      setUploadError(lang === 'ar' ? `فشل الرفع: ${errorMsg}` : `Upload failed: ${errorMsg}`);
      setIsUploadingImage(false);
      setUploadProgress(0);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingVideo(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedVideo(reader.result as string);
      setIsUploadingVideo(false);
    };
    reader.readAsDataURL(file);
  };

  // Submit property from public user
  const handleAddPropertySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError("");
    setAddSuccess(false);

    if (!newTitle || !newDesc || !newPrice || !newSpace || !isLocationValid) {
      setAddError(
        lang === "ar"
          ? "يرجى ملء كافة تفاصيل العنوان والموقع المحددة!"
          : "Please fill in all physical address & location attributes!",
      );
      return;
    }

    try {
      const parsedPrice = parseInt(newPrice.replace(/,/g, ""));
      const parsedSpace = parseInt(newSpace);

      const defaultImage =
        newImageUrl.trim() ||
        "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&auto=format&fit=crop&q=80";
      const imagesList =
        uploadedImages.length > 0 ? uploadedImages : [defaultImage];

      const payload: any = {
        title: newTitle,
        description: newDesc,
        price: parsedPrice,
        space: parsedSpace,
        status: newStatus,
        isFeatured: false,
        ...newLocationData,
        bedrooms: parseInt(newBedrooms),
        bathrooms: parseInt(newBathrooms),
        livingRooms: parseInt(newLivingRooms),
        floors: parseInt(newFloors),
        isFurnished: newIsFurnished,
        hasGarage,
        hasGarden,
        hasElevator,
        hasGenerator,
        hasSolarPower,
        hasPool,
        buildingType: newBuildingType,
        constructionYear: parseInt(newConstructionYear),
        images: imagesList,
        videoUrl: uploadedVideo || newVideoUrl || undefined,
        agentId: newAgentId,
        advertiserName: advertiserName.trim() || undefined,
        advertiserPhone: advertiserPhone.trim() || undefined,
        advertiserWhatsapp: advertiserWhatsapp.trim() || undefined,
        ownerEmailOrPhone:
          user?.role === "citizen"
            ? user?.emailOrPhone
            : advertiserPhone.trim() || undefined,
        isApproved: false, // Sent to admin queue
        documents: newDocuments,
      };

      if (newStatus === "مزاد عقاري") {
        payload.isAuction = true;
        payload.auctionStart = newAuctionStart;
        payload.auctionEnd = newAuctionEnd;
        payload.startingPrice = parseInt(newStartingPrice);
        payload.highestBid = 0;
        payload.isAuctionActive = true;
      }

      const result = await createProperty(payload);

      // Save locally to display on Citizen Dashboard
      const updatedCitizenProps = [result, ...citizenSubmittedProps];
      setCitizenSubmittedProps(updatedCitizenProps);

      setAddSuccess(true);

      // Reset form states
      setNewTitle("");
      setNewDesc("");
      setNewPrice("");
      setNewSpace("");
      
      setNewVideoUrl("");
      setNewImageUrl("");
      setUploadedImages([]);
      setUploadedVideo("");
      setAdvertiserName("");
      setAdvertiserPhone("");
      setAdvertiserWhatsapp("");

      // Reload properties list
      loadData();
    } catch (err: any) {
      console.error(err);
      setAddError(err.message || (lang === "ar" ? "فشل إضافة العقار" : "Failed to add property"));
    }
  };

  const approvedProperties = properties.filter((property) => property.isApproved);
  const featuredProperties = approvedProperties.filter((property) => property.isFeatured).slice(0, 3);
  const latestApprovedProperties = approvedProperties.slice(0, 6);

  return (
    <div
      id="aden-app"
      dir={lang === "ar" || lang === "ku" ? "rtl" : "ltr"}
      className="min-h-screen w-full overflow-x-hidden bg-royal-dark text-slate-100 flex flex-col font-sans selection:bg-[#F27D26] selection:text-[#ffffff]"
    >
      
      {/* Global Hero Background Image (Persistent) */}
      <div 
        className="absolute top-0 left-0 w-full h-[800px] z-0 bg-cover bg-center pointer-events-none"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2075&q=80')`,
        }}
      />
      <div className="absolute top-0 left-0 w-full h-[800px] z-0 bg-gradient-to-b from-[#050505]/60 via-[#050505]/80 to-[#050505] pointer-events-none" />

      {/* Dynamic Background Mesh Grid */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(242,125,38,0.07)_0%,transparent_60%)] opacity-80 pointer-events-none z-0"></div>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(242,125,38,0.03)_0%,transparent_50%)] opacity-80 pointer-events-none z-0"></div>

      {/* Top Professional Navigation Header */}
      <Header
        theme={theme}
        setTheme={setTheme}
        currentView={currentView}
        setView={(v) => {
          setView(v);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        favorites={favorites}
        onOpenFavorites={() => setShowFavoritesDrawer(true)}
        onLogoDoubleClick={() => {
          setLoginRole("admin");
          setAuthMode("login");
          setIsLoginOpen(true);
        }}
        selectedCompareCount={compareList.length}
        lang={lang}
        setLang={setLang}
        user={user}
        onOpenLogin={() => {
          setLoginError("");
          setAuthMode("login");
          setIsLoginOpen(true);
        }}
        onOpenAddProperty={() => {
          if (!user || user.role !== "citizen") {
            setLoginRole("citizen");
            setAuthMode("login");
            setIsLoginOpen(true);
            return;
          }
          setAddSuccess(false);
          setAddError("");
          setIsAddPropertyOpen(true);
        }}
        onLogout={handleLogout}
      />

      {/* Main Workspace Frame */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 relative z-10">
        {/* VIEW 1: HOMEPAGE (الصفحة الرئيسية) */}
        {currentView === "home" && (
          <div className="space-y-12">
            {/* Elegant Hero Slogan with Hierarchical Search */}
            <div
              id="hero-banner"
              className="relative rounded-3xl border border-white/5 p-6 sm:p-12 text-center overflow-hidden"
            >
              {/* Background Image with Gradient Overlay */}
              

              <div className="relative z-10 max-w-3xl mx-auto space-y-4 mb-8">
                <span className="inline-flex flex-wrap items-center gap-2 rounded-full bg-[#F27D26]/20 px-3.5 py-1 text-xs font-bold text-[#F27D26] border border-[#F27D26]/30 backdrop-blur-md">
                  <Award className="h-3.5 w-3.5 animate-pulse" />
                  <span>الوجهة الأذكى لخياراتك العقارية</span>
                </span>
                <h1 className="text-3xl font-black text-white sm:text-5xl leading-normal drop-shadow-lg">
                  {t.sloganTitle}
                </h1>
                <p className="text-sm sm:text-base text-slate-200 leading-relaxed sm:leading-loose max-w-2xl mx-auto font-sans drop-shadow-md">
                  اكتشف مساحتك المثالية مع أدق أدوات البحث. نوفر لك تجربة سلسة وآمنة لبيع، شراء، واستثمار العقارات بمعايير استثنائية وشفافية تامة.
                </p>
              </div>

              {/* Advanced Hierarchical Search Widget */}
              <div id="search-filter-section" className="relative z-10 max-w-4xl mx-auto">
                <HeroSearch
                  onSearch={handleSearchTrigger}
                  initialFilters={listingsFilters}
                />
              </div>
            </div>

            {/* Citizen Submitted Listings Tracker (If logged in as Citizen) */}
            {user?.role === "citizen" && (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                      <ClipboardList className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">
                        {t.citizenDashboard}
                      </h3>
                      <p className="text-xs text-slate-400 font-sans">
                        {t.welcomeUser} {user.name}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setAddSuccess(false);
                      setAddError("");
                      setIsAddPropertyOpen(true);
                    }}
                    className="flex flex-wrap items-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 px-4 py-2 text-xs font-bold text-[#ffffff] transition-all cursor-pointer self-start sm:self-auto"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>{t.addProperty}</span>
                  </button>
                </div>

                <div className="border-t border-white/5 pt-4">
                  <h4 className="text-xs font-bold text-slate-300 mb-3">
                    {t.submittedByYou} ({citizenSubmittedProps.length}):
                  </h4>
                  {citizenSubmittedProps.length === 0 ? (
                    <p className="text-xs text-slate-500 font-sans italic">
                      {lang === "ar"
                        ? "لم تقم بإضافة أي عقار للمنصة حتى الآن. أضف أول عقار لك الآن مجاناً!"
                        : "You have not submitted any properties yet. List your first property today!"}
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {citizenSubmittedProps?.map((prop) => (
                        <div
                          key={prop.id}
                          className="p-3 bg-slate-900/40 rounded-xl border border-white/5 flex flex-col justify-between space-y-2"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="text-xs font-bold text-amber-400 bg-amber-400/10 rounded px-1.5 py-0.5 border border-amber-400/25">
                                {t.notApprovedYet}
                              </span>
                              <span className="text-[9px] font-mono text-slate-500">
                                #{prop.id}
                              </span>
                            </div>
                            <h5 className="text-xs font-bold text-white truncate">
                              {prop.title}
                            </h5>
                            <p className="text-xs text-slate-400 font-sans">
                              📍 {prop.governorate} • {prop.district}
                            </p>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-white/5">
                            <span className="text-xs font-bold text-[#F27D26]">
                              {formatPrice(prop.price, prop.status)}
                            </span>
                            <span className="text-xs text-slate-500">
                              {prop.space} م²
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Live Ticker Alert Popups */}
            <LiveActivityTicker />

            {/* Quick Type Categories Grid */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#F27D26]"></span>
                <span>{t.browseByType}</span>
              </h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-5 text-center">
                {[
                  {
                    label:
                      lang === "ar"
                        ? "منازل سكنية"
                        : lang === "ku"
                          ? "خانووی نیشتەجێبوون"
                          : "Houses",
                    type: "منزل",
                    img: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&auto=format&fit=crop&q=80",
                  },
                  {
                    label:
                      lang === "ar"
                        ? "شقق سكنية"
                        : lang === "ku"
                          ? "شوقەی نیشتەجێبوون"
                          : "Apartments",
                    type: "شقة",
                    img: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&auto=format&fit=crop&q=80",
                  },
                  {
                    label:
                      lang === "ar"
                        ? "فلل فاخرة"
                        : lang === "ku"
                          ? "ڤێلای ناوازە"
                          : "Luxury Villas",
                    type: "فيلا",
                    img: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&auto=format&fit=crop&q=80",
                  },
                  {
                    label:
                      lang === "ar"
                        ? "أراضي سكنية"
                        : lang === "ku"
                          ? "زەوی نیشتەجێبوون"
                          : "Lands",
                    type: "أرض",
                    img: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&auto=format&fit=crop&q=80",
                  },
                  {
                    label:
                      lang === "ar"
                        ? "مجمعات تجارية"
                        : lang === "ku"
                          ? "کۆمەڵگەی بازرگانی"
                          : "Commercial Blocks",
                    type: "مجمع تجاري",
                    img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&auto=format&fit=crop&q=80",
                  },
                ]?.map((cat, i) => (
                  <button
                    key={i}
                    onClick={() =>
                      handleSearchTrigger({ buildingType: cat.type })
                    }
                    className="relative overflow-hidden rounded-2xl h-24 border border-white/5 bg-slate-900/30 backdrop-blur-xs text-right p-4 group transition-all hover:border-[#F27D26]/30 cursor-pointer"
                  >
                    <img loading="lazy"
                      src={cat.img}
                      referrerPolicy="no-referrer"
                      alt={cat.label}
                      className="absolute inset-0 h-full w-full object-cover opacity-20 group-hover:opacity-30 group-hover:scale-105 transition-all"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                    <span className="absolute bottom-3 right-3 text-xs font-bold text-white block truncate">
                      {cat.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Featured Properties Row (العقارات المميزة) */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Flame className="h-5 w-5 text-[#ff8a3d] animate-pulse" />
                  <h3 className="text-lg font-bold text-white">
                    {lang === "ar"
                      ? "العقارات المميزة والأكثر طلباً"
                      : lang === "ku"
                        ? "خانووبەرە نایابەکان و زۆرترین داواکراوەکان"
                        : "Featured Premium Properties"}
                  </h3>
                </div>
                <button
                  onClick={() => handleSearchTrigger({})}
                  className="text-xs font-semibold text-[#F27D26] hover:text-[#ff8a3d] transition-all"
                >
                  {lang === "ar"
                    ? "عرض جميع العقارات ↗"
                    : lang === "ku"
                      ? "بینینی هەموو خانووبەرەکان ↗"
                      : "View All Properties ↗"}
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {featuredProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    isFavorite={!!favorites.find((f) => f.id === property.id)}
                    onToggleFavorite={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(property);
                    }}
                    onSelect={() => handleSelectProperty(property)}
                    isComparing={
                      !!compareList.find((c) => c.id === property.id)
                    }
                    onToggleCompare={(e) => {
                      e.stopPropagation();
                      handleToggleCompare(property);
                    }}
                  />
                ))}
              </div>
              {featuredProperties.length === 0 && (
                <div className="rounded-2xl border border-white/5 bg-slate-900/10 p-8 text-center text-sm text-slate-400">
                  {lang === "ar"
                    ? "لا توجد عقارات مميزة منشورة حالياً."
                    : lang === "ku"
                      ? "لە ئێستادا هیچ خانووبەرەیەکی تایبەت بڵاونەکراوەتەوە."
                      : "No featured properties are currently listed."}
                </div>
              )}
            </div>

            {/* Dynamic Market Indicators panel */}
            <MarketIndicators stats={stats} />

            {/* Latest listings (أحدث العقارات) */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#F27D26]"></span>
                  <span>{t.latestListings}</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {latestApprovedProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    isFavorite={!!favorites.find((f) => f.id === property.id)}
                    onToggleFavorite={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(property);
                    }}
                    onSelect={() => handleSelectProperty(property)}
                    isComparing={
                      !!compareList.find((c) => c.id === property.id)
                    }
                    onToggleCompare={(e) => {
                      e.stopPropagation();
                      handleToggleCompare(property);
                    }}
                  />
                ))}
              </div>
              {latestApprovedProperties.length === 0 && (
                <div className="rounded-2xl border border-white/5 bg-slate-900/10 p-8 text-center text-sm text-slate-400">
                  {lang === "ar"
                    ? "لا توجد عقارات منشورة حالياً."
                    : lang === "ku"
                      ? "لە ئێستادا هیچ خانووبەرەیەک بڵاونەکراوەتەوە."
                      : "No properties currently listed."}
                </div>
              )}
            </div>

            {/* Live Completed Deals System widget */}
            <CompletedDealsList deals={deals} />
          </div>
        )}

        {/* VIEW 2: LISTINGS / SEARCH DIRECTORY */}
        {currentView === "listings" && (
          <div className="space-y-6 animate-fade-in">
            <div className="rounded-2xl border border-white/5 bg-slate-900/10 backdrop-blur-md p-6">
              <h2 className="text-xl font-bold text-white mb-1">
                {t.listings}
              </h2>
              <p className="text-xs text-slate-400 font-sans">
                {lang === "ar" ? (
                  <>
                    وجدت المنصة{" "}
                    <span className="text-[#F27D26] font-bold">
                      {properties.length}
                    </span>{" "}
                    عقاراً يطابق معايير تصفيتك الحالية
                  </>
                ) : lang === "ku" ? (
                  <>
                    پلاتفۆرمەکە{" "}
                    <span className="text-[#F27D26] font-bold">
                      {properties.length}
                    </span>{" "}
                    خانووبەرەی دۆزیوەتەوە کە لەگەڵ گەڕانەکەت دەگونجێت
                  </>
                ) : (
                  <>
                    We found{" "}
                    <span className="text-[#F27D26] font-bold">
                      {properties.length}
                    </span>{" "}
                    matching properties for your search
                  </>
                )}
              </p>
            </div>

            {/* Advanced Search box embedded in page */}
            <HeroSearch
              onSearch={(f) => setListingsFilters(f)}
              initialFilters={listingsFilters}
            />

            {/* Listings Grid */}
            {properties.length === 0 ? (
              <div className="py-20 text-center rounded-2xl border border-white/5 bg-slate-900/10 p-10">
                <p className="text-sm text-slate-400">
                  {lang === "ar"
                    ? "لا توجد عقارات منشورة تطابق معايير تصفيتك الحالية. جرب تغيير بعض خيارات البحث أو الأسعار."
                    : lang === "ku"
                      ? "هیچ خانووبەرەیەک نەدۆزرایەوە کە لەگەڵ گەڕانەکەت بگونجێت. تکایە گۆڕانکاری بکە لە هەڵبژاردنەکانت."
                      : "No matching properties found. Try adjusting your search query, location or price bounds."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {properties?.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    isFavorite={!!favorites.find((f) => f.id === property.id)}
                    onToggleFavorite={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(property);
                    }}
                    onSelect={() => handleSelectProperty(property)}
                    isComparing={
                      !!compareList.find((c) => c.id === property.id)
                    }
                    onToggleCompare={(e) => {
                      e.stopPropagation();
                      handleToggleCompare(property);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2.5: MAP SEARCH */}
        {currentView === "map-search" && (
          <div className="animate-fade-in space-y-6">
            <div className="rounded-2xl border border-white/5 bg-slate-900/10 backdrop-blur-md p-6">
              <h2 className="text-xl font-bold text-white mb-1">
                {lang === "ar" ? "البحث عبر الخريطة" : "Map Search"}
              </h2>
              <p className="text-xs text-slate-400 font-sans">
                {lang === "ar"
                  ? "اكتشف العقارات القريبة منك وتصفح الخريطة التفاعلية."
                  : "Discover nearby properties on the interactive map."}
              </p>
            </div>
            <MapSearch
              properties={properties}
              onSelectProperty={handleSelectProperty}
            />
          </div>
        )}

        {/* VIEW 3: PROPERTY DETAILS PAGE */}
        {currentView === "details" && selectedProperty && (
          <PropertyDetails
            property={selectedProperty}
            onBack={() => {
              setView("listings");
              loadData();
            }}
            isFavorite={!!favorites.find((f) => f.id === selectedProperty.id)}
            onToggleFavorite={() => handleToggleFavorite(selectedProperty)}
            onSelectProperty={(id) => {
              const matched = properties.find((p) => p.id === id);
              if (matched) handleSelectProperty(matched);
            }}
            allProperties={properties}
            onViewProfile={(identity) => {
              setProfileIdentity(identity);
              setView("profile");
            }}
            onCreateAgreement={() => {
              setView("electronic-agreement-form");
            }}
            user={user}
            lang={lang}
          />
        )}

        {/* VIEW 4: COMPLEX MULTI-COMPARE */}
        {currentView === "compare" && (
          <CompareView
            properties={compareList}
            onRemove={(id) =>
              setCompareList(compareList.filter((c) => c.id !== id))
            }
            onClear={() => setCompareList([])}
            onSelectProperty={(id) => {
              const matched = properties.find((p) => p.id === id);
              if (matched) handleSelectProperty(matched);
            }}
          />
        )}

        {/* VIEW 5: CONTACT PAGE (اتصل بنا) */}
        {currentView === "contact" && (
          <div className="mx-auto max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
            {/* Contact Details side card */}
            <div className="md:col-span-1 rounded-2xl border border-white/5 bg-slate-900/10 backdrop-blur-md p-6 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {t.sloganTitle}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {lang === "ar"
                    ? "المكتب العقاري المتكامل والأرقى بالعراق"
                    : "The Most Exclusive Premium Real Estate Office"}
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-3 bg-white/5 rounded-lg border border-white/5 space-y-1">
                  <span className="text-slate-400 font-bold block">
                    {lang === "ar"
                      ? "إشراف وإدارة عامة:"
                      : "Under Management Of:"}
                  </span>
                  <span className="text-white font-extrabold text-sm block">
                    عبدالله الدعاس
                  </span>
                </div>
                <div className="p-3 bg-white/5 rounded-lg border border-white/5 space-y-1">
                  <span className="text-slate-400 font-bold block">
                    {lang === "ar"
                      ? "رقم الاتصال المباشر:"
                      : "Direct Phone Line:"}
                  </span>
                  <a
                    href="tel:07810060292"
                    className="text-[#F27D26] font-black text-sm block"
                  >
                    07810060292
                  </a>
                </div>
                <div className="p-3 bg-white/5 rounded-lg border border-white/5 space-y-1 font-sans">
                  <span className="text-slate-400 font-bold block">
                    {lang === "ar" ? "أوقات العمل المعتمدة:" : "Office Hours:"}
                  </span>
                  <span className="text-slate-200">
                    {lang === "ar"
                      ? "السبت - الخميس: 9:00 ص - 9:00 م"
                      : "Sat - Thu: 9:00 AM - 9:00 PM"}
                  </span>
                </div>
              </div>

              <div className="rounded-xl bg-[#F27D26]/10 p-4 border border-[#F27D26]/20 text-[10.5px] leading-relaxed text-slate-300 font-sans">
                <Info className="h-4 w-4 text-[#F27D26] mb-2" />
                <span>
                  {lang === "ar"
                    ? "يمكنكم تقديم بلاغ أو شكوى، أو تقديم طلب شراكة كمكتب عقاري في أي محافظة عراقية وسيقوم عبدالله الدعاس بالتواصل معكم مباشرة."
                    : "You can file a report, general complaint, or register your local real estate branch to coordinate directly with admin."}
                </span>
              </div>
            </div>

            {/* Message Form card */}
            <div className="md:col-span-2 rounded-2xl border border-white/5 bg-slate-900/10 backdrop-blur-md p-6">
              <h2 className="text-lg font-bold text-white mb-1">
                {t.contactFormTitle}
              </h2>
              <p className="text-xs text-slate-400 font-sans mb-6">
                {lang === "ar"
                  ? "أرسل استفسارك أو طلبك مباشرة للمشرفين أو عبر الإيميل adenofice@gmail.com"
                  : "Submit your query instantly to our advisors or via email at adenofice@gmail.com"}
              </p>

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      {lang === "ar" ? "الاسم الكريم" : "Full Name"}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={t.contactNamePlaceholder}
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full rounded-xl border border-white/5 bg-slate-950 px-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-[#F27D26]/40"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      {lang === "ar" ? "رقم الهاتف" : "Phone Number"}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={t.contactPhonePlaceholder}
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full rounded-xl border border-white/5 bg-slate-950 px-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-[#F27D26]/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    {t.contactTypeLabel}
                  </label>
                  <select
                    value={contactType}
                    onChange={(e: any) => setContactType(e.target.value)}
                    className="w-full rounded-xl border border-white/5 bg-slate-950 px-4 py-2.5 text-xs text-white outline-none cursor-pointer"
                  >
                    <option value="general">{t.generalInquiry}</option>
                    <option value="office_request">{t.officeRegRequest}</option>
                    <option value="complaint">{t.complaintReport}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    {lang === "ar"
                      ? "تفاصيل الرسالة والطلب"
                      : "Message details"}
                  </label>
                  <textarea
                    rows={5}
                    required
                    placeholder={t.contactMsgPlaceholder}
                    value={contactMsg}
                    onChange={(e) => setContactMsg(e.target.value)}
                    className="w-full rounded-xl border border-white/5 bg-slate-950 px-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none font-sans"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    id="btn-submit-contact-msg"
                    type="submit"
                    disabled={contactSubmitting}
                    className="rounded-xl bg-[#F27D26] hover:bg-[#ff8a3d] px-6 py-3 text-xs font-bold text-[#ffffff] transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
                  >
                    <Send className="h-4 w-4" />
                    <span>
                      {contactSubmitting
                        ? lang === "ar"
                          ? "جاري الإرسال..."
                          : "Sending..."
                        : lang === "ar"
                          ? "إرسال الرسالة للإدارة"
                          : "Send message"}
                    </span>
                  </button>
                </div>

                {contactSuccess && (
                  <div className="rounded-xl bg-emerald-500/10 p-4 border border-emerald-500/20 text-xs text-emerald-400 text-center font-sans">
                    {t.contactSuccessMsg}
                  </div>
                )}
              </form>
            </div>
          </div>
        )}

        {/* VIEW 6: SECURED ADMIN PORTAL */}
        {currentView === "admin" && (
          <AdminPortal
            onLogout={() => setView("home")}
            onRefreshProperties={() => {
              loadData();
            }}
          />
        )}

        {/* VIEW 7: CITIZEN PROPERTIES DASHBOARD */}
        {currentView === "my-properties" && user?.role === "citizen" && (
          <CitizenProperties
            user={user as any}
            lang={lang}
            onViewPropertyDetails={handleSelectProperty}
          />
        )}

        {/* VIEW 8: USER PROFILE VIEW PAGE */}
        {currentView === "profile" && profileIdentity && (
          <UserProfileView
            profileIdentity={profileIdentity}
            lang={lang}
            onBack={() => {
              setView("home");
              loadData();
            }}
            onViewPropertyDetails={handleSelectProperty}
          />
        )}

        {/* VIEW 9: SERVICE PROVIDERS LIST */}
        {currentView === "service-providers" && (
          <ServiceProvidersList
            lang={lang}
            onSelectProvider={(provider: any) => {
              setSelectedServiceProvider(provider);
              setView("service-provider-profile");
            }}
          />
        )}

        {/* VIEW 10: SERVICE PROVIDER PROFILE */}
        {currentView === "service-provider-profile" &&
          selectedServiceProvider && (
            <ServiceProviderProfile
              provider={selectedServiceProvider}
              lang={lang}
              onBack={() => setView("service-providers")}
            />
          )}

        {/* VIEW 11: VERIFY AGREEMENT */}
        {currentView === "verify-agreement" && <VerifyAgreement lang={lang} initialSerialNumber={verifySerialNumber} />}

        {/* VIEW 12: ELECTRONIC AGREEMENT FORM */}
        {currentView === "electronic-agreement-form" && (
          <ElectronicAgreementForm
            property={selectedProperty || undefined}
            user={user}
            lang={lang}
            onBack={() => {
              if (selectedProperty) setView("details");
              else setView("home");
            }}
            onSuccess={(id) => {
              setSelectedAgreementId(id);
              setView("electronic-agreement-view");
            }}
          />
        )}

        {/* VIEW 13: ELECTRONIC AGREEMENT VIEW */}
        {currentView === "electronic-agreement-view" && selectedAgreementId && (
          <ElectronicAgreementView
            agreementId={selectedAgreementId}
            lang={lang}
            onBack={() => setView(user ? "my-agreements" : "home")}
          />
        )}

        {/* VIEW 14: MY AGREEMENTS LIST */}
        {currentView === "my-agreements" && user && (
          <MyAgreementsList
            user={user}
            lang={lang}
            onBack={() => setView("home")}
            onViewAgreement={(id) => {
              setSelectedAgreementId(id);
              setView("electronic-agreement-view");
            }}
          />
        )}
      </main>

      {/* FOOTER */}
      <footer
        id="app-footer"
        className="border-t border-white/5 bg-royal-dark py-10 text-center relative z-10 select-none"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col items-center justify-center gap-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <AdenLogo size={48} />
            <span className="hidden md:block h-12 w-px bg-white/10"></span>
            <div className="flex flex-col items-center justify-center gap-2">
              <img src="/tqm-logo.svg" alt="TQM Team Logo" className="h-10 w-auto object-contain drop-shadow-md" />
              <p className="font-sans text-[10px] text-white/40 font-light tracking-wide uppercase">
                {lang === "ar"
                  ? "تم تطوير المنصة من قبل فريق tqm"
                  : lang === "ku"
                    ? "پلاتفۆرمەکە لەلایەن تیمی tqm پەرەپێدراوە"
                    : "Developed by tqm team"}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-8 mt-2 pt-6 border-t border-white/5 w-full max-w-lg">
            <a href="tel:07810060292" className="text-slate-400 hover:text-[#F27D26] transition-colors flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span className="font-sans font-medium text-sm" dir="ltr">07810060292</span>
            </a>
            <a href="mailto:adenofice@gmail.com" className="text-slate-400 hover:text-[#F27D26] transition-colors flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span className="font-sans font-medium text-sm">adenofice@gmail.com</span>
            </a>
          </div>
        </div>
      </footer>

      {/* MODAL 1: UNIFIED ROLE-BASED LOGIN DIALOG (تسجيل دخول عامة الناس والمسؤول) */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 shadow-2xl">
            <button
              onClick={() => setIsLoginOpen(false)}
              className="absolute top-4 left-4 rounded-lg bg-white/5 border border-white/5 p-1 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="text-center mb-6">
              <span className="inline-block p-3 rounded-full bg-[#F27D26]/10 text-[#F27D26] mb-3">
                <ShieldCheck className="h-6 w-6" />
              </span>
              <h3 className="text-lg font-bold text-white">{t.userLogin}</h3>
              <p className="text-xs text-slate-400 mt-1 font-sans">
                {lang === "ar"
                  ? "اختر دورك وسجل دخولك للتمتع بكافة المزايا"
                  : lang === "ku"
                    ? "ڕۆڵەکەت هەڵبژێرە و بچۆ ژوورەوە بۆ سوودمەندبوون لە هەموو تایبەتمەندییەکان"
                    : "Select your identity to access full spatial permissions"}
              </p>
            </div>

            {/* Toggle Roles Tabs */}
            <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1.5 rounded-xl border border-white/5 mb-6">
              <button
                onClick={() => {
                  setLoginRole("citizen");
                  setLoginError("");
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  loginRole === "citizen"
                    ? "bg-[#F27D26] text-[#ffffff] shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {t.generalUserRole}
              </button>
              <button
                onClick={() => {
                  setLoginRole("admin");
                  setLoginError("");
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  loginRole === "admin"
                    ? "bg-red-500 text-[#ffffff] shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {t.platformManagerRole}
              </button>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {loginRole === "citizen" ? (
                <div className="space-y-4">
                  {/* Auth Mode Toggle */}
                  <div className="flex rounded-xl bg-slate-900 p-1 mb-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("login");
                        setLoginError("");
                      }}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                        authMode === "login"
                          ? "bg-[#F27D26] text-[#ffffff] shadow-md"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {lang === "ar" ? "تسجيل الدخول" : (lang === "ku" ? "چوونە ژوورەوە" : "Login")}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("register");
                        setLoginError("");
                      }}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                        authMode === "register"
                          ? "bg-[#F27D26] text-[#ffffff] shadow-md"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {lang === "ar" ? "حساب جديد" : (lang === "ku" ? "هەژماری نوێ" : "New Account")}
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">
                      {lang === "ar"
                        ? "البريد الإلكتروني أو رقم الهاتف"
                        : lang === "ku"
                          ? "ئیمەیڵ یان ژمارەی تەلەفۆن"
                          : "Email or Phone Number"}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={
                        lang === "ar"
                          ? "مثال: ahmed@mail.com أو 07801234567..."
                          : lang === "ku"
                            ? "بۆ نموونە: name@mail.com یان 07801234567..."
                            : "e.g. name@mail.com or 07801234567..."
                      }
                      value={citizenEmailOrPhone}
                      onChange={(e) => setCitizenEmailOrPhone(e.target.value)}
                      className="w-full rounded-xl border border-white/5 bg-slate-950 px-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-[#F27D26]/40 text-left font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">
                      {t.password}
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••"
                      maxLength={4}
                      minLength={4}
                      value={citizenPassword}
                      onChange={(e) => setCitizenPassword(e.target.value)}
                      className="w-full rounded-xl border border-white/5 bg-slate-950 px-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-[#F27D26]/40 text-left font-mono"
                    />
                  </div>
                  {authMode === "register" && (
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">
                        <span>
                          {lang === "ar"
                            ? "الاسم الكريم بالكامل"
                            : lang === "ku"
                              ? "ناوی تەواو"
                              : "Your Full Name"}
                        </span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={
                          lang === "ar"
                            ? "أدخل اسمك الكريم..."
                            : lang === "ku"
                              ? "ناوی خۆت بنووسە..."
                              : "Enter your name..."
                        }
                        value={citizenName}
                        onChange={(e) => setCitizenName(e.target.value)}
                        className="w-full rounded-xl border border-white/5 bg-slate-950 px-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-[#F27D26]/40"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">
                      {t.username}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="admin"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      className="w-full rounded-xl border border-white/5 bg-slate-950 px-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-red-500/40"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">
                      {t.password}
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full rounded-xl border border-white/5 bg-slate-950 px-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-red-500/40"
                    />
                  </div>
                </>
              )}

              {loginError && (
                <p className="text-xs text-red-400 text-center bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                  {loginError}
                </p>
              )}

              <button
                type="submit"
                className={`w-full py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-md cursor-pointer ${
                  loginRole === "citizen"
                    ? "bg-[#F27D26] hover:bg-[#ff8a3d]"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {loginRole === "citizen" && authMode === "register" ? (lang === "ar" ? "إنشاء الحساب" : (lang === "ku" ? "دروستکردنی هەژمار" : "Create Account")) : t.login}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CITIZEN / USER "ADD PROPERTY" SUBMISSION FORM */}
      {isAddPropertyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 shadow-2xl my-8">
            {/* Close trigger */}
            <button
              onClick={() => setIsAddPropertyOpen(false)}
              className="absolute top-4 left-4 rounded-lg bg-white/5 border border-white/5 p-1.5 text-slate-400 hover:text-white transition-all cursor-pointer z-10"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <div className="border-b border-white/5 pb-4 mb-5">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <PlusCircle className="h-5.5 w-5.5 text-[#F27D26]" />
                <span>{t.addPropertyTitle}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-sans">
                {lang === "ar"
                  ? "أضف عقارك مجاناً. بعد تعبئة الحقول، سيتم مراجعة طلبك والموافقة الفورية عليه من قبل عبدالله الدعاس."
                  : "Register your building details. Our managers will audit and authorize the listing shortly."}
              </p>
            </div>

            {addSuccess ? (
              <div className="py-10 text-center space-y-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                  <BadgeCheck className="h-8 w-8" />
                </div>
                <h4 className="text-lg font-bold text-white">
                  {lang === "ar"
                    ? "تم استلام طلبك بنجاح!"
                    : "Submission Successful!"}
                </h4>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed font-sans">
                  {t.submitPropertySuccess}
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => setIsAddPropertyOpen(false)}
                    className="rounded-xl bg-[#F27D26] hover:bg-[#ff8a3d] px-6 py-2.5 text-xs font-bold text-[#ffffff] transition-all cursor-pointer"
                  >
                    {t.close}
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleAddPropertySubmit}
                className="space-y-4 max-h-[70vh] overflow-y-auto pr-1"
              >
                {/* 1. Main Attributes */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      {t.propertyTitleLabel}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={
                        lang === "ar"
                          ? "مثال: منزل مبني حديث طابقين في الرمادي الصوفية"
                          : "e.g. Elegant Brand New Villa for Sale in Ramadi"
                      }
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full rounded-xl border border-white/5 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-[#F27D26]/40"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      {t.buildingTypeLabel}
                    </label>
                    <select
                      value={newBuildingType}
                      onChange={(e) => setNewBuildingType(e.target.value)}
                      className="w-full rounded-xl border border-white/5 bg-slate-950 px-3.5 py-2 text-xs text-white outline-none cursor-pointer"
                    >
                      <option value="منزل">
                        {lang === "ar"
                          ? "منزل سكني (بيت)"
                          : "Residential House"}
                      </option>
                      <option value="شقة">
                        {lang === "ar" ? "شقة سكنية" : "Apartment"}
                      </option>
                      <option value="فيلا">
                        {lang === "ar" ? "فيلا فاخرة" : "Luxury Villa"}
                      </option>
                      <option value="أرض">
                        {lang === "ar"
                          ? "أرض سكنية أو زراعية"
                          : "Land / Parcel"}
                      </option>
                      <option value="مجمع تجاري">
                        {lang === "ar"
                          ? "مجمع أو محل تجاري"
                          : "Commercial Block"}
                      </option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    {t.propertyDescLabel}
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder={
                      lang === "ar"
                        ? "اكتب بالتفصيل حالة الخدمات والكهرباء والتشطيبات والموقع والمميزات الفريدة..."
                        : "Write detailed construction status, energy systems, amenities, surrounding landmarks..."
                    }
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full rounded-xl border border-white/5 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-600 outline-none font-sans"
                  />
                </div>

                {/* 2. Price, Space, Status */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      {t.priceIqd}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 150000000"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      className="w-full rounded-xl border border-white/5 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-[#F27D26]/40"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      {t.spaceM2}
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 200"
                      value={newSpace}
                      onChange={(e) => setNewSpace(e.target.value)}
                      className="w-full rounded-xl border border-white/5 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-[#F27D26]/40"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      {t.statusLabel}
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full rounded-xl border border-white/5 bg-slate-950 px-3.5 py-2 text-xs text-white outline-none cursor-pointer"
                    >
                      <option value="للبيع">{t.forSale}</option>
                      <option value="للإيجار">{t.forRent}</option>
                      <option value="استثمار">
                        {lang === "ar" ? "استثمار" : "Investment"}
                      </option>
                      <option value="مزاد عقاري">
                        {lang === "ar" ? "مزاد عقاري" : "Auction"}
                      </option>
                    </select>
                  </div>
                </div>

                {/* Auction Fields */}
                {newStatus === "مزاد عقاري" && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 space-y-4">
                    <h4 className="text-xs font-bold text-amber-500">
                      {lang === "ar"
                        ? "تفاصيل المزاد العقاري"
                        : "Auction Details"}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">
                          {lang === "ar"
                            ? "السعر الابتدائي (دينار)"
                            : "Starting Price (IQD)"}
                        </label>
                        <input
                          type="number"
                          required
                          value={newStartingPrice}
                          onChange={(e) => setNewStartingPrice(e.target.value)}
                          className="w-full rounded-lg border border-white/5 bg-slate-900 px-3 py-1.5 text-xs text-white outline-none focus:border-amber-500/40"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">
                            {lang === "ar" ? "تاريخ البدء" : "Start Date"}
                          </label>
                          <input
                            type="datetime-local"
                            required
                            value={newAuctionStart}
                            onChange={(e) => setNewAuctionStart(e.target.value)}
                            className="w-full rounded-lg border border-white/5 bg-slate-900 px-3 py-1.5 text-xs text-white outline-none focus:border-amber-500/40"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">
                            {lang === "ar" ? "تاريخ الانتهاء" : "End Date"}
                          </label>
                          <input
                            type="datetime-local"
                            required
                            value={newAuctionEnd}
                            onChange={(e) => setNewAuctionEnd(e.target.value)}
                            className="w-full rounded-lg border border-white/5 bg-slate-900 px-3 py-1.5 text-xs text-white outline-none focus:border-amber-500/40"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. DYNAMIC LOCATION MATRICES FOR ALL 19 IRAQI GOVERNORATES */}
                <div className="bg-slate-950/60 rounded-xl p-4 border border-white/5 space-y-3">
                  <h4 className="text-xs font-bold text-[#F27D26] flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {lang === "ar"
                        ? "تحديد الموقع الجغرافي الدقيق (المحافظة والأقضية)"
                        : "Exact Geographical Location Coordinates"}
                    </span>
                  </h4>

                  <SmartLocationPicker onChange={(loc, isValid) => { setNewLocationData(loc); setIsLocationValid(isValid); }} lang={lang} />
                </div>
                
                {/* Specs Grid */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-5 bg-slate-900/40 rounded-xl p-4 border border-white/5">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      {t.bedroomsLabel}
                    </label>
                    <input
                      type="number"
                      required
                      value={newBedrooms}
                      onChange={(e) => setNewBedrooms(e.target.value)}
                      className="w-full rounded-lg border border-white/5 bg-slate-950 px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      {t.bathroomsLabel}
                    </label>
                    <input
                      type="number"
                      required
                      value={newBathrooms}
                      onChange={(e) => setNewBathrooms(e.target.value)}
                      className="w-full rounded-lg border border-white/5 bg-slate-950 px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      {lang === "ar" ? "عدد الصالات" : "Living Rooms"}
                    </label>
                    <input
                      type="number"
                      required
                      value={newLivingRooms}
                      onChange={(e) => setNewLivingRooms(e.target.value)}
                      className="w-full rounded-lg border border-white/5 bg-slate-950 px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      {lang === "ar" ? "عدد الطوابق" : "Floors"}
                    </label>
                    <input
                      type="number"
                      required
                      value={newFloors}
                      onChange={(e) => setNewFloors(e.target.value)}
                      className="w-full rounded-lg border border-white/5 bg-slate-950 px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      {t.constructionYearLabel}
                    </label>
                    <input
                      type="number"
                      required
                      value={newConstructionYear}
                      onChange={(e) => setNewConstructionYear(e.target.value)}
                      className="w-full rounded-lg border border-white/5 bg-slate-950 px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>

                {/* Interactive Checkbox amenities */}
                <div className="space-y-2 bg-slate-900/20 p-4 rounded-xl border border-white/5">
                  <span className="block text-xs font-bold text-slate-300 mb-1">
                    {lang === "ar"
                      ? "التجهيزات الفنية الإضافية المتوفرة بالعقار:"
                      : "Supplemental structural features:"}
                  </span>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 text-xs">
                    <label className="flex flex-wrap items-center gap-2 cursor-pointer text-slate-300 select-none">
                      <input
                        type="checkbox"
                        checked={newIsFurnished}
                        onChange={(e) => setNewIsFurnished(e.target.checked)}
                        className="rounded border-white/10 text-[#F27D26] focus:ring-[#F27D26]"
                      />
                      <span>{t.isFurnished}</span>
                    </label>
                    <label className="flex flex-wrap items-center gap-2 cursor-pointer text-slate-300 select-none">
                      <input
                        type="checkbox"
                        checked={hasGarage}
                        onChange={(e) => setHasGarage(e.target.checked)}
                        className="rounded border-white/10 text-[#F27D26] focus:ring-[#F27D26]"
                      />
                      <span>{t.hasGarage}</span>
                    </label>
                    <label className="flex flex-wrap items-center gap-2 cursor-pointer text-slate-300 select-none">
                      <input
                        type="checkbox"
                        checked={hasGarden}
                        onChange={(e) => setHasGarden(e.target.checked)}
                        className="rounded border-white/10 text-[#F27D26] focus:ring-[#F27D26]"
                      />
                      <span>{t.hasGarden}</span>
                    </label>
                    <label className="flex flex-wrap items-center gap-2 cursor-pointer text-slate-300 select-none">
                      <input
                        type="checkbox"
                        checked={hasElevator}
                        onChange={(e) => setHasElevator(e.target.checked)}
                        className="rounded border-white/10 text-[#F27D26] focus:ring-[#F27D26]"
                      />
                      <span>{t.hasElevator}</span>
                    </label>
                    <label className="flex flex-wrap items-center gap-2 cursor-pointer text-slate-300 select-none">
                      <input
                        type="checkbox"
                        checked={hasGenerator}
                        onChange={(e) => setHasGenerator(e.target.checked)}
                        className="rounded border-white/10 text-[#F27D26] focus:ring-[#F27D26]"
                      />
                      <span>{t.hasGenerator}</span>
                    </label>
                    <label className="flex flex-wrap items-center gap-2 cursor-pointer text-slate-300 select-none">
                      <input
                        type="checkbox"
                        checked={hasSolarPower}
                        onChange={(e) => setHasSolarPower(e.target.checked)}
                        className="rounded border-white/10 text-[#F27D26] focus:ring-[#F27D26]"
                      />
                      <span>{t.hasSolarPower}</span>
                    </label>
                  </div>
                </div>

                {/* Image and Media Upload (Drag & Drop or Click) */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-white tracking-wide border-b border-white/5 pb-1.5">
                    الوسائط وملفات العرض (Media Uploads)
                  </h4>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Images Upload */}
                    <div className="space-y-2">
                      <label className="block text-xs text-slate-400">
                        {t.uploadImagesLabel}
                      </label>
                      {isUploadingImage && (
                        <div className="mb-2 p-3 rounded-xl border border-[#F27D26]/20 bg-[#F27D26]/5 text-center">
                          <span className="text-xs text-[#F27D26] font-bold block mb-1">
                            {lang === 'ar' ? 'جاري ضغط ورفع الصور...' : 'Compressing & Uploading...'} {uploadProgress}%
                          </span>
                          <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden">
                            <div className="h-full bg-[#F27D26] transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                          </div>
                        </div>
                      )}
                      {uploadError && (
                        <div className="mb-2 p-2 rounded-xl border border-red-500/20 bg-red-500/10 text-xs text-red-400 text-center">
                          {uploadError}
                        </div>
                      )}
                      <div className="relative group flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-white/10 bg-slate-950 hover:bg-slate-900/40 hover:border-[#F27D26]/40 transition-all cursor-pointer">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <span className="text-xl">📸</span>
                        <span className="text-xs text-slate-400 mt-1">
                          اضغط للتحديد أو اسحب الصور هنا
                        </span>
                        <span className="text-[9px] text-[#F27D26]/60 mt-0.5">
                          يمكنك اختيار صور متعددة
                        </span>
                      </div>

                      {/* Fallback Image URL */}
                      <div>
                        <span className="text-[9px] text-slate-500 block text-center my-1">
                          ـ أو يمكنك كتابة رابط صورة مباشر ـ
                        </span>
                        <input
                          type="url"
                          placeholder="https://images.unsplash.com/photo-..."
                          value={newImageUrl}
                          onChange={(e) => setNewImageUrl(e.target.value)}
                          className="w-full rounded-xl border border-white/5 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-600 outline-none font-mono"
                        />
                      </div>

                      {/* Previews Grid */}
                      {uploadedImages.length > 0 && (
                        <div className="grid grid-cols-4 gap-2 mt-2">
                          {uploadedImages?.map((img, idx) => (
                            <div
                              key={idx}
                              className="relative group aspect-square rounded-lg overflow-hidden border border-white/10 bg-black"
                            >
                              <img loading="lazy"
                                src={img}
                                alt="preview"
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setUploadedImages(
                                    uploadedImages.filter((_, i) => i !== idx),
                                  )
                                }
                                className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-xs font-bold"
                              >
                                حذف
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Video Upload */}
                    <div className="space-y-2">
                      <label className="block text-xs text-slate-400">
                        {t.uploadVideoLabel}
                      </label>
                      <div className="relative group flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-white/10 bg-slate-950 hover:bg-slate-900/40 hover:border-[#F27D26]/40 transition-all cursor-pointer">
                        <input
                          type="file"
                          accept="video/*"
                          onChange={handleVideoUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <span className="text-xl">🎥</span>
                        <span className="text-xs text-slate-400 mt-1">
                          اضغط لتحديد فيديو جولة عقارية أو اسحبه هنا
                        </span>
                        <span className="text-[9px] text-[#F27D26]/60 mt-0.5">
                          صيغ مدعومة: MP4, MOV, WebM
                        </span>
                      </div>

                      {/* Fallback Video URL */}
                      <div>
                        <span className="text-[9px] text-slate-500 block text-center my-1">
                          ـ أو يمكنك كتابة رابط فيديو يوتيوب ـ
                        </span>
                        <input
                          type="url"
                          placeholder="https://youtube.com/watch?v=..."
                          value={newVideoUrl}
                          onChange={(e) => setNewVideoUrl(e.target.value)}
                          className="w-full rounded-xl border border-white/5 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-600 outline-none font-mono"
                        />
                      </div>

                      {/* Video Preview */}
                      {uploadedVideo && (
                        <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-black mt-2">
                          <video
                            src={uploadedVideo}
                            className="w-full h-full object-cover"
                            controls
                          />
                          <button
                            type="button"
                            onClick={() => setUploadedVideo("")}
                            className="absolute top-2 right-2 bg-red-600 hover:bg-red-500 text-[#ffffff] text-xs font-bold px-2 py-1 rounded"
                          >
                            حذف الفيديو
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Optional Documents Upload */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-white tracking-wide border-b border-white/5 pb-1.5">
                    {lang === "ar"
                      ? "مستندات العقار (اختياري)"
                      : "Property Documents (Optional)"}
                  </h4>
                  <div className="bg-slate-900/40 border border-white/5 rounded-xl p-4">
                    <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                      {lang === "ar"
                        ? "يمكنك رفع سند الملكية، خارطة العقار، إجازة البناء، أو أي مستندات أخرى (لا يظهر للعامة إلا بموافقتك)."
                        : "Upload property deeds, maps, or building permits. Hidden from public by default."}
                    </p>

                    <div className="space-y-3">
                      {newDocuments?.map((doc, idx) => (
                        <div
                          key={idx}
                          className="flex gap-2 items-center bg-slate-950 p-2 rounded-lg border border-white/10"
                        >
                          <input
                            type="text"
                            placeholder={
                              lang === "ar" ? "اسم المستند" : "Title"
                            }
                            value={doc.title}
                            onChange={(e) => {
                              const newDocs = [...newDocuments];
                              newDocs[idx].title = e.target.value;
                              setNewDocuments(newDocs);
                            }}
                            className="flex-1 rounded border border-white/5 bg-slate-900 px-2 py-1 text-xs text-white outline-none"
                          />
                          <input
                            type="text"
                            placeholder={lang === "ar" ? "رابط المستند" : "URL"}
                            value={doc.url}
                            onChange={(e) => {
                              const newDocs = [...newDocuments];
                              newDocs[idx].url = e.target.value;
                              setNewDocuments(newDocs);
                            }}
                            className="flex-1 rounded border border-white/5 bg-slate-900 px-2 py-1 text-xs text-white outline-none font-mono"
                          />
                          <label className="flex items-center gap-1 text-[9px] text-slate-400 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={doc.isPublic}
                              onChange={(e) => {
                                const newDocs = [...newDocuments];
                                newDocs[idx].isPublic = e.target.checked;
                                setNewDocuments(newDocs);
                              }}
                            />
                            {lang === "ar" ? "عام" : "Public"}
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              setNewDocuments(
                                newDocuments.filter((_, i) => i !== idx),
                              )
                            }
                            className="text-red-500 hover:text-red-400 p-1"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() =>
                          setNewDocuments([
                            ...newDocuments,
                            { title: "", url: "", isPublic: false },
                          ])
                        }
                        className="text-xs text-gold-prestige font-bold hover:underline flex items-center gap-1"
                      >
                        + {lang === "ar" ? "إضافة مستند جديد" : "Add Document"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Direct Advertiser Contact Fields */}
                <div className="space-y-3.5 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                  <h4 className="text-xs font-bold text-white tracking-wide border-b border-white/5 pb-1.5 flex justify-between items-center">
                    <span>📞 {t.directContactAdvertiser}</span>
                    <span className="text-[9px] text-[#F27D26] font-normal font-sans">
                      (اختياري للعموم، إلزامي للمواطنين)
                    </span>
                  </h4>

                  <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        {t.advertiserNameLabel}
                      </label>
                      <input
                        type="text"
                        placeholder="مثال: أبو محمد الكربولي"
                        value={advertiserName}
                        onChange={(e) => setAdvertiserName(e.target.value)}
                        className="w-full rounded-xl border border-white/5 bg-slate-950 px-3.5 py-2 text-xs text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        {t.advertiserPhoneLabel}
                      </label>
                      <input
                        type="tel"
                        placeholder="مثال: 07801234567"
                        value={advertiserPhone}
                        onChange={(e) => setAdvertiserPhone(e.target.value)}
                        className="w-full rounded-xl border border-white/5 bg-slate-950 px-3.5 py-2 text-xs text-white outline-none font-mono text-left"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs text-slate-400">
                          {t.advertiserWhatsappLabel}
                        </label>
                        {advertiserPhone && (
                          <button
                            type="button"
                            onClick={() =>
                              setAdvertiserWhatsapp(advertiserPhone)
                            }
                            className="text-[9px] text-[#F27D26] hover:underline"
                          >
                            نسخ رقم الهاتف
                          </button>
                        )}
                      </div>
                      <input
                        type="tel"
                        placeholder="مثال: 9647801234567"
                        value={advertiserWhatsapp}
                        onChange={(e) => setAdvertiserWhatsapp(e.target.value)}
                        className="w-full rounded-xl border border-white/5 bg-slate-950 px-3.5 py-2 text-xs text-white outline-none font-mono text-left"
                      />
                    </div>
                  </div>
                </div>

                {/* Responsible Advisor / Agent Picker */}
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    {t.chooseAgent}
                  </label>
                  <select
                    value={newAgentId}
                    onChange={(e) => setNewAgentId(e.target.value)}
                    className="w-full rounded-xl border border-white/5 bg-slate-950 px-3.5 py-2 text-xs text-white outline-none cursor-pointer"
                  >
                    <option value="abdullah_daas">
                      عبدالله الدعاس (المدير العام لشركة عدن)
                    </option>
                  </select>
                </div>

                {addError && (
                  <p className="text-xs text-red-400 bg-red-500/10 p-2 rounded-lg text-center border border-red-500/20">
                    {addError}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#F27D26] to-[#ff8a3d] text-xs font-bold text-white shadow-lg transition-all cursor-pointer"
                >
                  {t.submitPropertyBtn}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* SIDE DRAWER: SAVED FAVORITES LIST (المفضلة) */}
      {showFavoritesDrawer && (
        <div
          id="favorites-drawer"
          className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-fade-in"
        >
          {/* Backdrop dismiss */}
          <div
            className="absolute inset-0 cursor-pointer"
            onClick={() => setShowFavoritesDrawer(false)}
          ></div>

          {/* Drawer content body */}
          <div className="relative w-full max-w-md h-full bg-royal-dark border-r border-white/10 p-6 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <div className="flex flex-wrap items-center gap-2">
                  <Heart className="h-5.5 w-5.5 fill-[#F27D26] text-[#F27D26]" />
                  <h3 className="text-base font-bold text-white">
                    {t.favoriteProperties}
                  </h3>
                </div>
                <button
                  id="btn-close-favorites-drawer"
                  onClick={() => setShowFavoritesDrawer(false)}
                  className="rounded-lg bg-white/5 border border-white/5 p-1.5 text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Items list */}
              <div className="space-y-4 overflow-y-auto max-h-[70vh] pr-1">
                {favorites?.map((prop) => (
                  <div
                    key={prop.id}
                    onClick={() => {
                      handleSelectProperty(prop);
                      setShowFavoritesDrawer(false);
                    }}
                    className="flex gap-3 items-center p-2.5 rounded-xl bg-slate-900/40 border border-white/5 hover:border-[#F27D26]/30 transition-all cursor-pointer group"
                  >
                    <img loading="lazy"
                      src={prop.images?.[0]}
                      alt={prop.title}
                      referrerPolicy="no-referrer"
                      className="h-12 w-16 object-cover rounded-lg shrink-0 border border-white/10"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-white truncate group-hover:text-[#F27D26] transition-colors">
                        {prop.title}
                      </h4>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        📍 {prop.governorate} • {prop.district}
                      </p>
                      <span className="text-xs text-[#F27D26] font-bold block font-sans mt-0.5">
                        {formatPrice(prop.price, prop.status)}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(prop);
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition-all"
                      title="إزالة"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {favorites.length === 0 && (
                  <div className="py-20 text-center text-slate-500 text-xs font-sans">
                    {t.noFavoritesYet}
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons inside drawer */}
            {favorites.length > 0 && (
              <div className="border-t border-white/10 pt-4 space-y-3">
                <button
                  onClick={() => {
                    setView("listings");
                    setShowFavoritesDrawer(false);
                  }}
                  className="w-full text-center rounded-xl bg-[#F27D26] py-3 text-xs font-bold text-[#ffffff] hover:bg-[#ff8a3d] transition-all cursor-pointer"
                >
                  {t.listings}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
