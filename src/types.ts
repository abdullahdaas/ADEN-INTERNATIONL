export interface PlatformSettings {
  mastercard: string;
  zainCash: string;
  isOtpEnabled: boolean;
  smsProvider: 'mock' | 'twilio' | 'generic';
  smsApiKey?: string;
  smsApiSecret?: string;
  smsSenderId?: string;
}

export interface OTPLog {
  id: string;
  phone: string;
  status: 'success' | 'failed' | 'expired';
  attempts: number;
  createdAt: string;
}

export interface LocationHierarchy {
  governorate: string;
  districts: {
    name: string;
    subDistricts: {
      name: string;
      neighborhoods: string[];
    }[];
  }[];
}

export type PropertyStatus = 'للبيع' | 'للإيجار' | 'محجوز' | 'تم البيع' | 'تم التأجير' | 'مميز' | 'مزاد عقاري' | 'مرفوض';

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number; // in Iraqi Dinars (IQD)
  space: number; // in square meters (m²)
  status: PropertyStatus;
  isFeatured: boolean;
  isSuspended?: boolean;
  featuredPackage?: string; // 'basic' | 'medium' | 'premium' | 'unlimited'
  
  // Location
  country?: string; // 'Iraq'
  governorate: string;
  district: string;
  subDistrict: string;
  city?: string;
  neighborhood: string;
  village?: string;
  street?: string;
  nearestLandmark?: string;
  postalCode?: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  googleMapsUrl?: string;
  locationTimestamp?: string;

  // Specs
  bedrooms: number;
  bathrooms: number;
  livingRooms: number;
  floors: number;
  isFurnished: boolean;
  hasGarage: boolean;
  hasGarden: boolean;
  hasElevator: boolean;
  hasGenerator: boolean;
  hasSolarPower: boolean;
  hasPool: boolean;
  buildingType: string; // 'منزل' | 'شقة' | 'أرض' | 'فيلا' | 'مجمع تجاري'
  constructionYear: number;

  // Media
  images: string[];
  videoUrl?: string;

  // Owner/Agent
  agentId: string;
  advertiserName?: string;
  advertiserPhone?: string;
  advertiserWhatsapp?: string;
  ownerEmailOrPhone?: string;
  
  // Stats
  views: number;
  favoritesCount: number;
  createdAt: string;
  updatedAt: string;
  daysOnPlatform: number;

  // Approval
  isApproved: boolean;
  isVerified?: boolean;
  phoneViews?: number;

  // Documents (Optional)
  documents?: { title: string; url: string; isPublic: boolean }[];

  // Auction System
  isAuction?: boolean;
  auctionStart?: string;
  auctionEnd?: string;
  startingPrice?: number;
  highestBid?: number;
  highestBidderId?: string;
  isAuctionActive?: boolean;
}

export interface PropertyVisit {
  id: string;
  propertyId: string;
  propertyTitle: string;
  requesterId: string;
  requesterName: string;
  requesterPhone: string;
  ownerId: string;
  date: string;
  time: string;
  status: 'pending' | 'accepted' | 'rejected' | 'proposed';
  proposedDate?: string;
  proposedTime?: string;
  createdAt: string;
}

export interface AuctionParticipant {
  id: string;
  propertyId: string;
  userId: string;
  paidAmount: number;
  paymentMethod: string;
  status: 'approved' | 'pending' | 'rejected';
  createdAt: string;
}

export interface Bid {
  id: string;
  propertyId: string;
  userId: string;
  userName: string;
  amount: number;
  createdAt: string;
}

export interface Agent {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  whatsapp: string;
  telegram?: string;
  email: string;
  dealsCompleted: number;
  rating: number;
  propertyCount: number;
  bio?: string;
}

export interface CompletedDeal {
  id: string;
  propertyTitle: string;
  propertyType: string;
  governorate: string;
  district: string;
  neighborhood: string;
  price: number;
  type: 'بيع' | 'تأجير';
  daysToComplete: number;
  date: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  email?: string;
  subject: string;
  message: string;
  propertyId?: string;
  createdAt: string;
  isRead: boolean;
  type: 'general' | 'request' | 'office_request' | 'complaint';
}

export interface Review {
  id: string;
  agentId: string;
  reviewerName: string;
  rating: number;
  comment: string;
  createdAt: string;
  isApproved: boolean;
}

export interface PaymentProof {
  id: string;
  propertyId: string;
  packageName: string;
  paymentType?: 'featured_ad' | 'auction' | 'electronic_agreement';
  amount: number;
  paymentMethod: 'zain_cash' | 'qi_card';
  proofImage: string;
  senderName: string;
  senderPhone: string;
  transactionId?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
}

export interface MarketIndicator {
  governorate: string;
  avgSalePrice: number;
  avgRentPrice: number;
  totalSold: number;
  totalRented: number;
  avgDaysToSell: number;
  avgDaysToRent: number;
}

export interface Supervisor {
  id: string;
  name: string;
  username: string;
  secretCode: string;
  isSuperAdmin?: boolean;
  permissions: {
    approveProperties: boolean;
    manageLocations: boolean;
    manageInbox: boolean;
    managePayments: boolean;
  };
}

export interface CitizenProfile {
  id?: string;
  emailOrPhone: string;
  name: string;
  whatsapp: string;
  phone: string;
  avatar: string;
  coverImage: string;
  bio: string;
  customSlug: string; // unique personal URL slug e.g. 'abu-ali'
  isVerified: boolean;
  password?: string;
  createdAt: string;
  status?: 'active' | 'banned' | 'suspended';
  banReason?: string;
  role?: 'citizen' | 'moderator' | 'admin';
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName?: string;
  action: string;
  details: string;
  ip?: string;
  userAgent?: string;
  status?: 'success' | 'failed';
  timestamp: string;
}

export interface UserNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  timestamp: string;
}



export interface PurchaseOffer {
  id: string;
  propertyId: string;
  propertyTitle: string;
  buyerId: string;
  buyerName: string;
  ownerId: string;
  amount: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'counter';
  counterAmount?: number;
  createdAt: string;
}

export interface Complaint {
  id: string;
  reporterId: string;
  reporterName: string;
  targetId?: string; // Property ID or User ID
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'closed';
  resolution?: string;
  createdAt: string;
}

// Financial System
export interface FinancialTransaction {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  type: 'featured_ad' | 'auction_subscription' | 'messaging_fee' | 'office_subscription' | 'service_provider_subscription' | 'other';
  paymentMethod: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  transactionId?: string;
  date: string;
  notes?: string;
}

// CMS System
export interface CmsPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  lastUpdated: string;
}

export interface CmsArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  imageUrl?: string;
  category: string;
  status: 'published' | 'draft' | 'scheduled';
  publishDate: string;
  seoTitle?: string;
  seoDescription?: string;
}

// Ads System
export interface AdCampaign {
  id: string;
  title: string;
  location: 'homepage_top' | 'search_results' | 'sidebar' | 'property_details';
  imageUrl: string;
  targetUrl: string;
  startDate: string;
  endDate: string;
  price: number;
  status: 'active' | 'paused' | 'completed';
  clicks: number;
  impressions: number;
}

// Service Providers System
export interface ServiceProvider {
  id: string;
  name: string;
  ownerName?: string;
  whatsapp?: string;
  category: string;
  logo: string;
  coverImage: string;
  description: string;
  yearsOfExperience: number;
  governorate: string;
  district?: string;
  neighborhood?: string;
  city: string;
  address: string;
  coordinates: { lat: number; lng: number };
  contactNumbers: string[];
  email: string;
  website?: string;
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  workingHours: string;
  portfolio: string[];
  hasDelivery?: boolean;
  materialsOffered?: string[];
  promoVideo?: string;
  rating: number;
  reviewCount: number;
  clientCount: number;
  views: number;
  subscriptionPlan: 'free' | 'pro' | 'business';
  isVerified: boolean;
  isPromoted: boolean;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
  userId: string;
}

export interface ServiceReview {
  id: string;
  providerId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  images?: string[];
  createdAt: string;
}

export interface ElectronicAgreement {
  id: string;
  serialNumber: string; // Unique serial number for verification
  propertyId?: string; // Optional if they want to link to a property on the platform
  propertyDetails: string;
  propertyAddress: string;
  sellerName: string;
  sellerPhone: string;
  buyerName: string;
  buyerPhone: string;
  agreedPrice: number;
  depositAmount: number;
  conditions: string;
  validityDays: number;
  initiatorId: string; // User ID who created it
  counterpartyPhone: string; // To notify/link the other party
  status: 'pending_approval' | 'pending_payment' | 'active' | 'completed' | 'cancelled' | 'rejected' | 'archived' | 'deleted' | 'expired';
  cancellationReason?: string;
  paymentMethod?: string;
  payerName?: string;
  payerPhone?: string;
  paymentAmount?: string;
  paymentProofUrl?: string;
  qrCodeUrl?: string;
  referenceNumber?: string;
  createdAt: string;
  approvedAt?: string;
  expiresAt?: string;
  buyerPaid: boolean;
  sellerPaid: boolean;
}

