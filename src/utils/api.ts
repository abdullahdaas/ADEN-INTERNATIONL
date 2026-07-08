import { Property, Agent, CompletedDeal, ContactMessage, PaymentProof, MarketIndicator, Supervisor, CitizenProfile, UserNotification } from '../types';
import { getSupabase } from '../data/supabaseStorage';

const API_BASE = '/api';

const DEFAULT_STATS = {
  activeCount: 0,
  pendingCount: 0,
  soldCount: 0,
  rentedCount: 0,
  avgDaysToSell: 0,
  avgDaysToRent: 0,
  highestSale: 0,
  highestRent: 0,
  activeRegions: [] as { name: string; count: number }[],
  governorateStats: [] as MarketIndicator[],
};

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function toBoolean(value: unknown, fallback = false): boolean {
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

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((entry): entry is string => typeof entry === 'string' && entry.length > 0);
  }
  if (typeof value === 'string' && value.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed)
        ? parsed.filter((entry): entry is string => typeof entry === 'string' && entry.length > 0)
        : [];
    } catch {
      return [];
    }
  }
  return [];
}

function toDocuments(value: unknown): { title: string; url: string; isPublic: boolean }[] {
  if (Array.isArray(value)) {
    return value
      .map((entry) => {
        if (!entry || typeof entry !== 'object') return null;
        const doc = entry as Record<string, unknown>;
        return {
          title: toStringValue(doc.title),
          url: toStringValue(doc.url),
          isPublic: toBoolean(doc.isPublic),
        };
      })
      .filter((entry): entry is { title: string; url: string; isPublic: boolean } => !!entry && !!entry.url);
  }
  if (typeof value === 'string' && value.trim().startsWith('[')) {
    try {
      return toDocuments(JSON.parse(value));
    } catch {
      return [];
    }
  }
  return [];
}

function toCoordinates(row: Record<string, unknown>): { lat: number; lng: number } {
  const coordinates = row.coordinates as Record<string, unknown> | undefined;
  const lat = toNumber(coordinates?.lat ?? row.lat ?? row.latitude);
  const lng = toNumber(coordinates?.lng ?? row.lng ?? row.longitude);
  return { lat, lng };
}

function daysSince(dateValue: string): number {
  if (!dateValue) return 0;
  const timestamp = new Date(dateValue).getTime();
  if (Number.isNaN(timestamp)) return 0;
  return Math.max(0, Math.floor((Date.now() - timestamp) / 86400000));
}

function normalizeProperty(row: any): Property {
  const createdAt = toStringValue(row.createdAt ?? row.created_at, new Date().toISOString());
  const updatedAt = toStringValue(row.updatedAt ?? row.updated_at, createdAt);
  return {
    id: toStringValue(row.id, crypto.randomUUID()),
    title: toStringValue(row.title),
    description: toStringValue(row.description),
    price: toNumber(row.price),
    space: toNumber(row.space),
    status: (row.status ?? 'للبيع') as Property['status'],
    isFeatured: toBoolean(row.isFeatured ?? row.is_featured),
    isSuspended: toBoolean(row.isSuspended ?? row.is_suspended),
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
    coordinates: toCoordinates(row),
    googleMapsUrl: toStringValue(row.googleMapsUrl ?? row.google_maps_url) || undefined,
    locationTimestamp: toStringValue(row.locationTimestamp ?? row.location_timestamp) || undefined,
    bedrooms: toNumber(row.bedrooms),
    bathrooms: toNumber(row.bathrooms),
    livingRooms: toNumber(row.livingRooms ?? row.living_rooms),
    floors: toNumber(row.floors),
    isFurnished: toBoolean(row.isFurnished ?? row.is_furnished),
    hasGarage: toBoolean(row.hasGarage ?? row.has_garage),
    hasGarden: toBoolean(row.hasGarden ?? row.has_garden),
    hasElevator: toBoolean(row.hasElevator ?? row.has_elevator),
    hasGenerator: toBoolean(row.hasGenerator ?? row.has_generator),
    hasSolarPower: toBoolean(row.hasSolarPower ?? row.has_solar_power),
    hasPool: toBoolean(row.hasPool ?? row.has_pool),
    buildingType: toStringValue(row.buildingType ?? row.building_type),
    constructionYear: toNumber(row.constructionYear ?? row.construction_year),
    images: toStringArray(row.images),
    videoUrl: toStringValue(row.videoUrl ?? row.video_url) || undefined,
    agentId: toStringValue(row.agentId ?? row.agent_id),
    advertiserName: toStringValue(row.advertiserName ?? row.advertiser_name) || undefined,
    advertiserPhone: toStringValue(row.advertiserPhone ?? row.advertiser_phone) || undefined,
    advertiserWhatsapp: toStringValue(row.advertiserWhatsapp ?? row.advertiser_whatsapp) || undefined,
    ownerEmailOrPhone: toStringValue(row.ownerEmailOrPhone ?? row.owner_email_or_phone) || undefined,
    views: toNumber(row.views),
    favoritesCount: toNumber(row.favoritesCount ?? row.favorites_count),
    createdAt,
    updatedAt,
    daysOnPlatform: toNumber(row.daysOnPlatform ?? row.days_on_platform, daysSince(createdAt)),
    isApproved: toBoolean(row.isApproved ?? row.is_approved),
    isVerified: toBoolean(row.isVerified ?? row.is_verified),
    phoneViews: toNumber(row.phoneViews ?? row.phone_views),
    pendingDeletion: toBoolean(row.pendingDeletion ?? row.pending_deletion),
    documents: toDocuments(row.documents),
    isAuction: toBoolean(row.isAuction ?? row.is_auction),
    auctionStart: toStringValue(row.auctionStart ?? row.auction_start) || undefined,
    auctionEnd: toStringValue(row.auctionEnd ?? row.auction_end) || undefined,
    startingPrice: toNumber(row.startingPrice ?? row.starting_price),
    highestBid: toNumber(row.highestBid ?? row.highest_bid),
    highestBidderId: toStringValue(row.highestBidderId ?? row.highest_bidder_id) || undefined,
    isAuctionActive: toBoolean(row.isAuctionActive ?? row.is_auction_active),
  };
}

function normalizeDeal(row: any): CompletedDeal {
  return {
    id: toStringValue(row.id, crypto.randomUUID()),
    propertyTitle: toStringValue(row.propertyTitle ?? row.property_title),
    propertyType: toStringValue(row.propertyType ?? row.property_type),
    governorate: toStringValue(row.governorate),
    district: toStringValue(row.district),
    neighborhood: toStringValue(row.neighborhood),
    price: toNumber(row.price),
    type: (row.type ?? 'بيع') as CompletedDeal['type'],
    daysToComplete: toNumber(row.daysToComplete ?? row.days_to_complete),
    date: toStringValue(row.date, toStringValue(row.createdAt ?? row.created_at)),
  };
}

function getDealTimestamp(deal: CompletedDeal): number {
  const raw = deal.date;
  if (!raw) return 0;
  const ts = new Date(raw).getTime();
  return Number.isNaN(ts) ? 0 : ts;
}

function applyPropertyFilters(query: any, filters: Record<string, any>) {
  let nextQuery = query;
  const equalityKeys = [
    'status',
    'governorate',
    'district',
    'subDistrict',
    'neighborhood',
    'buildingType',
    'bedrooms',
    'bathrooms',
    'isFurnished',
    'hasGarage',
    'hasGarden',
    'hasElevator',
    'hasGenerator',
    'hasSolarPower',
    'hasPool',
    'ownerEmailOrPhone',
  ];

  for (const key of equalityKeys) {
    const value = filters[key];
    if (value !== undefined && value !== null && value !== '') {
      nextQuery = nextQuery.eq(key, value);
    }
  }

  if (filters.isApproved !== 'all') {
    if (filters.isApproved === true || filters.isApproved === 'true') {
      nextQuery = nextQuery.eq('isApproved', true);
    } else if (filters.isApproved === false || filters.isApproved === 'false') {
      nextQuery = nextQuery.eq('isApproved', false);
    }
  }

  if (filters.minPrice !== undefined && filters.minPrice !== '') {
    nextQuery = nextQuery.gte('price', Number(filters.minPrice));
  }
  if (filters.maxPrice !== undefined && filters.maxPrice !== '') {
    nextQuery = nextQuery.lte('price', Number(filters.maxPrice));
  }
  if (filters.minSpace !== undefined && filters.minSpace !== '') {
    nextQuery = nextQuery.gte('space', Number(filters.minSpace));
  }
  if (filters.maxSpace !== undefined && filters.maxSpace !== '') {
    nextQuery = nextQuery.lte('space', Number(filters.maxSpace));
  }
  if (filters.searchQuery) {
    const term = String(filters.searchQuery).trim();
    if (term) {
      nextQuery = nextQuery.or([
        `title.ilike.%${term}%`,
        `description.ilike.%${term}%`,
        `address.ilike.%${term}%`,
        `district.ilike.%${term}%`,
        `neighborhood.ilike.%${term}%`,
      ].join(','));
    }
  }

  return nextQuery;
}

function preparePropertyForWrite(property: Partial<Property>): Record<string, any> {
  const next: Record<string, any> = { ...property };
  if (property.coordinates) {
    next.coordinates = {
      lat: toNumber(property.coordinates.lat),
      lng: toNumber(property.coordinates.lng),
    };
  }
  if (property.images) {
    next.images = property.images.filter((image) => typeof image === 'string' && image.length > 0);
  }
  if (property.documents) {
    next.documents = property.documents;
  }
  return next;
}

async function fetchPropertiesFromSupabase(filters: Record<string, any> = {}): Promise<Property[]> {
  let query = getSupabase().from('properties').select('*');
  query = applyPropertyFilters(query, filters);
  const { data, error } = await query.order('createdAt', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(normalizeProperty);
}

async function fetchDealsFromSupabase(): Promise<CompletedDeal[]> {
  const { data, error } = await getSupabase()
    .from('deals')
    .select('*')
    .order('date', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(normalizeDeal);
}

export async function fetchLatestDeals(limit = 5): Promise<CompletedDeal[]> {
  const safeLimit = Math.max(1, Math.min(50, limit));
  const deals = await fetchDealsFromSupabase();
  return deals
    .sort((left, right) => getDealTimestamp(right) - getDealTimestamp(left))
    .slice(0, safeLimit);
}

export function buildIraqiMarketIndicators(
  properties: Property[] = [],
  deals: CompletedDeal[] = [],
): {
  totalListings: number;
  totalDeals: number;
  totalDealsVolume: number;
  averageListingPrice: number;
  averageDealPrice: number;
  saleDealsVolume: number;
  rentDealsVolume: number;
} {
  const totalListings = properties.length;
  const totalDeals = deals.length;
  const totalDealsVolume = deals.reduce((sum, deal) => sum + (deal.price || 0), 0);
  const averageListingPrice =
    totalListings > 0
      ? Math.round(properties.reduce((sum, property) => sum + (property.price || 0), 0) / totalListings)
      : 0;
  const averageDealPrice = totalDeals > 0 ? Math.round(totalDealsVolume / totalDeals) : 0;
  const saleDealsVolume = deals
    .filter((deal) => deal.type === 'بيع')
    .reduce((sum, deal) => sum + (deal.price || 0), 0);
  const rentDealsVolume = deals
    .filter((deal) => deal.type === 'تأجير')
    .reduce((sum, deal) => sum + (deal.price || 0), 0);

  return {
    totalListings,
    totalDeals,
    totalDealsVolume,
    averageListingPrice,
    averageDealPrice,
    saleDealsVolume,
    rentDealsVolume,
  };
}

export function buildMostActiveAreas(
  properties: Property[] = [],
  limit = 5,
): { area: string; listingsCount: number }[] {
  const safeLimit = Math.max(1, Math.min(20, limit));
  const counter = new Map<string, number>();

  for (const property of properties) {
    const area = [property.governorate, property.district]
      .filter(Boolean)
      .join(' • ')
      .trim();
    const key = area || 'Unknown Area';
    counter.set(key, (counter.get(key) ?? 0) + 1);
  }

  return Array.from(counter.entries())
    .map(([area, listingsCount]) => ({ area, listingsCount }))
    .sort((left, right) => right.listingsCount - left.listingsCount)
    .slice(0, safeLimit);
}

export function buildMarketStats(
  properties: Property[] = [],
  deals: CompletedDeal[] = [],
): {
  activeCount: number;
  pendingCount: number;
  soldCount: number;
  rentedCount: number;
  avgDaysToSell: number;
  avgDaysToRent: number;
  highestSale: number;
  highestRent: number;
  activeRegions: { name: string; count: number }[];
  governorateStats: MarketIndicator[];
} {
  if (properties.length === 0 && deals.length === 0) {
    return { ...DEFAULT_STATS };
  }

  const soldDeals = deals.filter((deal) => deal.type === 'بيع');
  const rentedDeals = deals.filter((deal) => deal.type === 'تأجير');

  const governorateMap = new Map<string, {
    salePrices: number[];
    rentPrices: number[];
    soldDays: number[];
    rentedDays: number[];
  }>();

  for (const deal of deals) {
    const bucket = governorateMap.get(deal.governorate) ?? {
      salePrices: [],
      rentPrices: [],
      soldDays: [],
      rentedDays: [],
    };
    if (deal.type === 'بيع') {
      bucket.salePrices.push(deal.price);
      bucket.soldDays.push(deal.daysToComplete);
    } else {
      bucket.rentPrices.push(deal.price);
      bucket.rentedDays.push(deal.daysToComplete);
    }
    governorateMap.set(deal.governorate, bucket);
  }

  const activeRegionsMap = new Map<string, number>();
  for (const deal of deals) {
    const regionName = [deal.governorate, deal.district, deal.neighborhood].filter(Boolean).join(' • ');
    activeRegionsMap.set(regionName, (activeRegionsMap.get(regionName) ?? 0) + 1);
  }

  const governorateStats: MarketIndicator[] = Array.from(governorateMap.entries()).map(([governorate, value]) => ({
    governorate,
    avgSalePrice: value.salePrices.length ? Math.round(value.salePrices.reduce((sum, price) => sum + price, 0) / value.salePrices.length) : 0,
    avgRentPrice: value.rentPrices.length ? Math.round(value.rentPrices.reduce((sum, price) => sum + price, 0) / value.rentPrices.length) : 0,
    totalSold: value.salePrices.length,
    totalRented: value.rentPrices.length,
    avgDaysToSell: value.soldDays.length ? Math.round(value.soldDays.reduce((sum, days) => sum + days, 0) / value.soldDays.length) : 0,
    avgDaysToRent: value.rentedDays.length ? Math.round(value.rentedDays.reduce((sum, days) => sum + days, 0) / value.rentedDays.length) : 0,
  }));

  return {
    activeCount: properties.filter((property) => property.isApproved && !property.pendingDeletion).length,
    pendingCount: properties.filter((property) => !property.isApproved || property.pendingDeletion).length,
    soldCount: soldDeals.length,
    rentedCount: rentedDeals.length,
    avgDaysToSell: soldDeals.length ? Math.round(soldDeals.reduce((sum, deal) => sum + deal.daysToComplete, 0) / soldDeals.length) : 0,
    avgDaysToRent: rentedDeals.length ? Math.round(rentedDeals.reduce((sum, deal) => sum + deal.daysToComplete, 0) / rentedDeals.length) : 0,
    highestSale: soldDeals.length ? Math.max(...soldDeals.map((deal) => deal.price)) : 0,
    highestRent: rentedDeals.length ? Math.max(...rentedDeals.map((deal) => deal.price)) : 0,
    activeRegions: Array.from(activeRegionsMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((left, right) => right.count - left.count)
      .slice(0, 5),
    governorateStats: governorateStats.sort((left, right) => (right.totalSold + right.totalRented) - (left.totalSold + left.totalRented)),
  };
}

export function subscribeToSupabaseTables(
  tables: string[],
  onChange: () => void,
): () => void {
  const supabase = getSupabase();
  const channels = tables.map((table, index) =>
    supabase
      .channel(`realtime:${table}:${index}:${Date.now()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, () => onChange())
      .subscribe(),
  );

  return () => {
    for (const channel of channels) {
      void supabase.removeChannel(channel);
    }
  };
}

export async function loginAdmin(username: string, password: string) {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ username, password })
  });
  return res.json();
}


function getAuthHeaders(): HeadersInit {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  try {
    let token = localStorage.getItem('aden-admin-token');
    if (!token || token === 'undefined' || token === 'null') {
      token = localStorage.getItem('aden_token');
    }
    if (token === 'undefined' || token === 'null') token = null;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Legacy support
    const user = localStorage.getItem('aden-user');
    if (user && user !== 'undefined') {
      const parsed = JSON.parse(user);
      if (parsed.emailOrPhone) {
        headers['x-user-id'] = parsed.emailOrPhone;
      }
    }
    const admin = localStorage.getItem('aden-admin-auth');
    if (admin) {
      headers['x-admin'] = 'true';
    }
  } catch (e) {}
  return headers;
}

function getAuthHeadersGET(): HeadersInit {
  const headers: Record<string, string> = {};
  try {
    let token = localStorage.getItem('aden-admin-token');
    if (!token || token === 'undefined' || token === 'null') {
      token = localStorage.getItem('aden_token');
    }
    if (token === 'undefined' || token === 'null') token = null;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Legacy support
    const user = localStorage.getItem('aden-user');
    if (user && user !== 'undefined') {
      const parsed = JSON.parse(user);
      if (parsed.emailOrPhone) {
        headers['x-user-id'] = parsed.emailOrPhone;
      }
    }
    const admin = localStorage.getItem('aden-admin-auth');
    if (admin) {
      headers['x-admin'] = 'true';
    }
  } catch (e) {}
  return headers;
}

async function readJsonOrThrow<T = any>(res: Response, fallbackMessage: string): Promise<T> {
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      (data && typeof data === 'object' && (data.message || data.error)) ||
      fallbackMessage;
    throw new Error(String(message));
  }
  return (data ?? {}) as T;
}

export async function fetchProperties(filters: Record<string, any> = {}): Promise<Property[]> {
  return fetchPropertiesFromSupabase(filters);
}

export async function fetchPropertyById(id: string): Promise<Property> {
  const { data, error } = await getSupabase().from('properties').select('*').eq('id', id).single();
  if (error || !data) throw new Error('Failed to fetch property details');
  return normalizeProperty(data);
}

export async function createProperty(property: Omit<Property, 'id' | 'views' | 'favoritesCount' | 'createdAt' | 'updatedAt' | 'daysOnPlatform'>): Promise<Property> {
  const now = new Date().toISOString();
  const payload = preparePropertyForWrite({
    ...property,
    id: crypto.randomUUID(),
    views: 0,
    favoritesCount: 0,
    createdAt: now,
    updatedAt: now,
    daysOnPlatform: 0,
  });
  const { data, error } = await getSupabase().from('properties').insert(payload).select('*').single();
  if (error || !data) throw new Error(error?.message || 'Failed to create property');
  return normalizeProperty(data);
}

export async function updateProperty(id: string, property: Partial<Property>): Promise<Property> {
  const payload = preparePropertyForWrite({ ...property, updatedAt: new Date().toISOString() });
  const { data, error } = await getSupabase().from('properties').update(payload).eq('id', id).select('*').single();
  if (error || !data) throw new Error(error?.message || 'Failed to update property');
  return normalizeProperty(data);
}

export async function deleteProperty(id: string, hard = true): Promise<boolean> {
  if (!hard) {
    const { error } = await getSupabase().from('properties').update({ pendingDeletion: true, isApproved: false, updatedAt: new Date().toISOString() }).eq('id', id);
    if (error) throw new Error(error.message || 'Failed to mark property for deletion');
    return true;
  }

  const { error } = await getSupabase().from('properties').delete().eq('id', id);
  if (error) throw new Error(error.message || 'Failed to delete property');
  return true;
}

export async function fetchAgents(): Promise<Agent[]> {
  const res = await fetch(`${API_BASE}/agents`, { headers: getAuthHeadersGET(), cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch agents');
  return res.json();
}

export async function fetchAgentById(id: string): Promise<Agent & { properties: Property[] }> {
  const res = await fetch(`${API_BASE}/agents/${id}`, { headers: getAuthHeadersGET(), cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch agent details');
  return res.json();
}

export async function fetchDeals(): Promise<CompletedDeal[]> {
  return fetchDealsFromSupabase();
}

export async function fetchMessages(): Promise<ContactMessage[]> {
  const res = await fetch(`${API_BASE}/messages`, { headers: getAuthHeadersGET(), cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch messages');
  return res.json();
}

export async function sendMessage(msg: Omit<ContactMessage, 'id' | 'createdAt' | 'isRead'>): Promise<ContactMessage> {
  const res = await fetch(`${API_BASE}/messages`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(msg)
  });
  if (!res.ok) throw new Error('Failed to send message');
  return res.json();
}

export async function markMessageRead(id: string): Promise<ContactMessage> {
  const res = await fetch(`${API_BASE}/messages/${id}/read`, {
    method: 'PUT',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to mark message as read');
  return res.json();
}

export async function fetchPayments(): Promise<PaymentProof[]> {
  const res = await fetch(`${API_BASE}/payments`, { headers: getAuthHeadersGET(), cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch payments');
  return res.json();
}

export async function submitPaymentProof(payment: Omit<PaymentProof, 'id' | 'status' | 'createdAt'>): Promise<PaymentProof> {
  const res = await fetch(`${API_BASE}/payments`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payment)
  });
  if (!res.ok) throw new Error('Failed to submit payment proof');
  return res.json();
}

export async function updatePaymentStatus(id: string, status: 'approved' | 'rejected', propertyId: string, packageName: string, rejectionReason?: string): Promise<PaymentProof> {
  const res = await fetch(`${API_BASE}/payments/${id}/status`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status, propertyId, packageName, rejectionReason })
  });
  if (!res.ok) throw new Error('Failed to update payment status');
  return res.json();
}

export async function fetchStats(): Promise<{
  activeCount: number;
  pendingCount: number;
  soldCount: number;
  rentedCount: number;
  avgDaysToSell: number;
  avgDaysToRent: number;
  highestSale: number;
  highestRent: number;
  activeRegions: { name: string; count: number }[];
  governorateStats: MarketIndicator[];
}> {
  const [properties, deals] = await Promise.all([
    fetchPropertiesFromSupabase({ isApproved: 'all' }),
    fetchDealsFromSupabase(),
  ]);
  return buildMarketStats(properties, deals);
}

export async function fetchSupervisors(): Promise<Supervisor[]> {
  const res = await fetch(`${API_BASE}/supervisors`, { headers: getAuthHeadersGET(), cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch supervisors');
  return res.json();
}

export async function createSupervisor(supervisor: Omit<Supervisor, 'id'>): Promise<Supervisor> {
  const res = await fetch(`${API_BASE}/supervisors`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(supervisor)
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to create supervisor');
  }
  return res.json();
}

export async function updateSupervisor(id: string, supervisor: Partial<Supervisor>): Promise<Supervisor> {
  const res = await fetch(`${API_BASE}/supervisors/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(supervisor)
  });
  if (!res.ok) throw new Error('Failed to update supervisor');
  return res.json();
}

export async function deleteSupervisor(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/supervisors/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to delete supervisor');
  const data = await res.json();
  return data.success;
}

export async function fetchProfileByIdentity(identity: string): Promise<{ profile: CitizenProfile | null; properties: Property[] }> {
  const res = await fetch(`${API_BASE}/profiles/${encodeURIComponent(identity)}`, { headers: getAuthHeadersGET(), cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch profile');
  return res.json();
}

export async function saveProfile(profile: Partial<CitizenProfile> & { emailOrPhone: string; name: string }): Promise<CitizenProfile> {
  const res = await fetch(`${API_BASE}/profiles`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(profile)
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to save profile');
  }
  return res.json();
}

export async function fetchAllProfiles(): Promise<CitizenProfile[]> {
  const res = await fetch(`${API_BASE}/profiles`, { headers: getAuthHeadersGET(), cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch profiles');
  return res.json();
}

export async function fetchSettings(): Promise<any> {
  const res = await fetch(`${API_BASE}/settings`, { headers: getAuthHeadersGET(), cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch settings');
  return res.json();
}

export async function updateSettings(settings: any): Promise<any> {
  const res = await fetch(`${API_BASE}/settings`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(settings),
  });
  if (!res.ok) throw new Error('Failed to update settings');
  return res.json();
}

export async function sendOtp(phone: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/otp/send`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ phone }),
  });
  return res.json();
}

export async function verifyOtp(phone: string, code: string, name?: string): Promise<{ success: boolean; profile?: any; message?: string }> {
  const res = await fetch(`${API_BASE}/otp/verify`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ phone, code, name }),
  });
  return res.json();
}

export async function fetchOtpLogs(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/otp/logs`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to fetch OTP logs');
  return res.json();
}

export async function fetchVisits(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/visits`, { headers: getAuthHeaders() });
  return readJsonOrThrow<any[]>(res, 'Failed to fetch visits');
}

export async function createVisit(visit: any): Promise<any> {
  const res = await fetch(`${API_BASE}/visits`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(visit)
  });
  return readJsonOrThrow<any>(res, 'Failed to create visit request');
}

export async function updateVisitStatus(id: string, updates: any): Promise<any> {
  const res = await fetch(`${API_BASE}/visits/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates)
  });
  return readJsonOrThrow<any>(res, 'Failed to update visit status');
}

export async function fetchAuctionParticipants(propertyId: string): Promise<any[]> {
  const res = await fetch(`${API_BASE}/auctions/${propertyId}/participants`, { headers: getAuthHeaders() });
  return res.json();
}

export async function submitBid(propertyId: string, bid: any): Promise<any> {
  const res = await fetch(`${API_BASE}/auctions/${propertyId}/bids`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(bid)
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to submit bid');
  }
  return res.json();
}

export async function fetchBids(propertyId: string): Promise<any[]> {
  const res = await fetch(`${API_BASE}/auctions/${propertyId}/bids`, { headers: getAuthHeaders() });
  return res.json();
}

export async function fetchLogs(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/logs`, { headers: getAuthHeaders() });
  return res.json();
}

export async function logActivity(log: any): Promise<void> {
  await fetch(`${API_BASE}/logs`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(log)
  });
}




export async function fetchOffers(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/offers`, { headers: getAuthHeaders() });
  return readJsonOrThrow<any[]>(res, 'Failed to fetch offers');
}

export async function createOffer(offer: any): Promise<any> {
  const res = await fetch(`${API_BASE}/offers`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(offer)
  });
  return readJsonOrThrow<any>(res, 'Failed to submit offer');
}

export async function updateOffer(id: string, updates: any): Promise<any> {
  const res = await fetch(`${API_BASE}/offers/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates)
  });
  return readJsonOrThrow<any>(res, 'Failed to update offer');
}

export async function createComplaint(complaint: any): Promise<any> {
  const res = await fetch(`${API_BASE}/complaints`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(complaint)
  });
  return readJsonOrThrow<any>(res, 'Failed to submit complaint');
}

export async function fetchComplaints(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/complaints`, { headers: getAuthHeaders() });
  return readJsonOrThrow<any[]>(res, 'Failed to fetch complaints');
}

export async function updateComplaint(id: string, updates: any): Promise<any> {
  const res = await fetch(`${API_BASE}/complaints/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates)
  });
  return readJsonOrThrow<any>(res, 'Failed to update complaint');
}

export async function incrementPhoneViews(id: string): Promise<void> {
  await fetch(`${API_BASE}/properties/${id}/phone-view`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
}


export const fetchAgreements = async (): Promise<any[]> => {
  const res = await fetch('/api/agreements', { headers: getAuthHeadersGET(), cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch agreements');
  return res.json();
};

export const updateAgreementStatus = async (id: string, status: string): Promise<any> => {
  const res = await fetch('/api/agreements/' + id, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Failed to update agreement');
  return res.json();
};

export const fetchServiceProviders = async (): Promise<any[]> => {
  const res = await fetch('/api/service-providers', { headers: getAuthHeadersGET(), cache: 'no-store' });
  return readJsonOrThrow<any[]>(res, 'Failed to fetch service providers');
};
export const addServiceProvider = async (provider: any): Promise<any> => {
  const res = await fetch('/api/service-providers', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(provider)
  });
  return readJsonOrThrow<any>(res, 'Failed to add service provider');
};
export const updateServiceProvider = async (id: string, provider: any): Promise<any> => {
  const res = await fetch('/api/service-providers/' + id, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(provider)
  });
  return readJsonOrThrow<any>(res, 'Failed to update service provider');
};
export const deleteServiceProvider = async (id: string): Promise<any> => {
  const res = await fetch('/api/service-providers/' + id, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return readJsonOrThrow<any>(res, 'Failed to delete service provider');
};

export const fetchProviderApplications = async (): Promise<any[]> => {
  const res = await fetch('/api/provider-applications', { headers: getAuthHeadersGET(), cache: 'no-store' });
  return readJsonOrThrow<any[]>(res, 'Failed to fetch provider applications');
};
export const submitProviderApplication = async (app: any): Promise<any> => {
  const res = await fetch('/api/provider-applications', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(app)
  });
  return readJsonOrThrow<any>(res, 'Failed to submit provider application');
};
export const updateProviderApplication = async (id: string, updates: any): Promise<any> => {
  const res = await fetch('/api/provider-applications/' + id, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates)
  });
  return readJsonOrThrow<any>(res, 'Failed to update provider application');
};

// GIS Data Management
export async function getGisCollection(collection: string) {
  const res = await fetch(`${API_BASE}/gis/${collection}`);
  return res.json();
}
export async function addGisItem(collection: string, data: any) {
  const res = await fetch(`${API_BASE}/gis/${collection}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
}
export async function updateGisItem(collection: string, id: string, data: any) {
  const res = await fetch(`${API_BASE}/gis/${collection}/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
}
export async function deleteGisItem(collection: string, id: string) {
  const res = await fetch(`${API_BASE}/gis/${collection}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return res.json();
}

export async function fetchNotifications(): Promise<UserNotification[]> {
  const res = await fetch(`${API_BASE}/notifications`, { headers: getAuthHeadersGET(), cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

export async function markNotificationRead(id: string): Promise<void> {
  await fetch(`${API_BASE}/notifications/${id}/read`, {
    method: 'PUT',
    headers: getAuthHeaders()
  });
}

export const fetchReviews = async (propertyId: string): Promise<any[]> => {
  const res = await fetch('/api/reviews/' + propertyId, { headers: getAuthHeadersGET(), cache: 'no-store' });
  return readJsonOrThrow<any[]>(res, 'Failed to fetch reviews');
};

export const submitReview = async (review: any): Promise<any> => {
  const res = await fetch('/api/reviews', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(review)
  });
  return readJsonOrThrow<any>(res, 'Failed to submit review');
};
