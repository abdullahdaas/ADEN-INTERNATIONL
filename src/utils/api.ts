import { Property, Agent, CompletedDeal, ContactMessage, PaymentProof, MarketIndicator, Supervisor, CitizenProfile, UserNotification } from '../types';

const API_BASE = '/api';

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
    const token = localStorage.getItem('aden-admin-token') || localStorage.getItem('aden_token');
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
    const token = localStorage.getItem('aden-admin-token') || localStorage.getItem('aden_token');
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

export async function fetchProperties(filters: Record<string, any> = {}): Promise<Property[]> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });
  
  const res = await fetch(`${API_BASE}/properties?${params.toString()}`, { headers: getAuthHeadersGET() });
  if (!res.ok) throw new Error('Failed to fetch properties');
  return res.json();
}

export async function fetchPropertyById(id: string): Promise<Property> {
  const res = await fetch(`${API_BASE}/properties/${id}`, { headers: getAuthHeadersGET() });
  if (!res.ok) throw new Error('Failed to fetch property details');
  return res.json();
}

export async function createProperty(property: Omit<Property, 'id' | 'views' | 'favoritesCount' | 'createdAt' | 'updatedAt' | 'daysOnPlatform'>): Promise<Property> {
  const res = await fetch(`${API_BASE}/properties`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(property)
  });
  if (!res.ok) throw new Error('Failed to create property');
  return res.json();
}

export async function updateProperty(id: string, property: Partial<Property>): Promise<Property> {
  const res = await fetch(`${API_BASE}/properties/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(property)
  });
  if (!res.ok) throw new Error('Failed to update property');
  return res.json();
}

export async function deleteProperty(id: string, hard = false): Promise<boolean> {
  const res = await fetch(`${API_BASE}/properties/${id}${hard ? '?hard=true' : ''}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to delete property');
  const data = await res.json();
  return data.success;
}

export async function fetchAgents(): Promise<Agent[]> {
  const res = await fetch(`${API_BASE}/agents`, { headers: getAuthHeadersGET() });
  if (!res.ok) throw new Error('Failed to fetch agents');
  return res.json();
}

export async function fetchAgentById(id: string): Promise<Agent & { properties: Property[] }> {
  const res = await fetch(`${API_BASE}/agents/${id}`, { headers: getAuthHeadersGET() });
  if (!res.ok) throw new Error('Failed to fetch agent details');
  return res.json();
}

export async function fetchDeals(): Promise<CompletedDeal[]> {
  const res = await fetch(`${API_BASE}/deals`, { headers: getAuthHeadersGET() });
  if (!res.ok) throw new Error('Failed to fetch completed deals');
  return res.json();
}

export async function fetchMessages(): Promise<ContactMessage[]> {
  const res = await fetch(`${API_BASE}/messages`, { headers: getAuthHeadersGET() });
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
  const res = await fetch(`${API_BASE}/payments`, { headers: getAuthHeadersGET() });
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
  const res = await fetch(`${API_BASE}/stats`, { headers: getAuthHeadersGET() });
  if (!res.ok) throw new Error('Failed to fetch statistics');
  return res.json();
}

export async function fetchSupervisors(): Promise<Supervisor[]> {
  const res = await fetch(`${API_BASE}/supervisors`, { headers: getAuthHeadersGET() });
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
  const res = await fetch(`${API_BASE}/profiles/${encodeURIComponent(identity)}`, { headers: getAuthHeadersGET() });
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
  const res = await fetch(`${API_BASE}/profiles`, { headers: getAuthHeadersGET() });
  if (!res.ok) throw new Error('Failed to fetch profiles');
  return res.json();
}

export async function fetchSettings(): Promise<any> {
  const res = await fetch(`${API_BASE}/settings`, { headers: getAuthHeadersGET() });
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
  return res.json();
}

export async function createVisit(visit: any): Promise<any> {
  const res = await fetch(`${API_BASE}/visits`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(visit)
  });
  return res.json();
}

export async function updateVisitStatus(id: string, updates: any): Promise<any> {
  const res = await fetch(`${API_BASE}/visits/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates)
  });
  return res.json();
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
  return res.json();
}

export async function createOffer(offer: any): Promise<any> {
  const res = await fetch(`${API_BASE}/offers`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(offer)
  });
  return res.json();
}

export async function updateOffer(id: string, updates: any): Promise<any> {
  const res = await fetch(`${API_BASE}/offers/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates)
  });
  return res.json();
}

export async function createComplaint(complaint: any): Promise<any> {
  const res = await fetch(`${API_BASE}/complaints`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(complaint)
  });
  return res.json();
}

export async function fetchComplaints(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/complaints`, { headers: getAuthHeaders() });
  return res.json();
}

export async function updateComplaint(id: string, updates: any): Promise<any> {
  const res = await fetch(`${API_BASE}/complaints/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates)
  });
  return res.json();
}

export async function incrementPhoneViews(id: string): Promise<void> {
  await fetch(`${API_BASE}/properties/${id}/phone-view`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
}


export const fetchAgreements = async (): Promise<any[]> => {
  const res = await fetch('/api/agreements', { headers: getAuthHeadersGET() });
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
  const res = await fetch('/api/service-providers', { headers: getAuthHeadersGET() });
  return res.json();
};
export const addServiceProvider = async (provider: any): Promise<any> => {
  const res = await fetch('/api/service-providers', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(provider)
  });
  return res.json();
};
export const updateServiceProvider = async (id: string, provider: any): Promise<any> => {
  const res = await fetch('/api/service-providers/' + id, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(provider)
  });
  return res.json();
};
export const deleteServiceProvider = async (id: string): Promise<any> => {
  const res = await fetch('/api/service-providers/' + id, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return res.json();
};

export const fetchProviderApplications = async (): Promise<any[]> => {
  const res = await fetch('/api/provider-applications', { headers: getAuthHeadersGET() });
  return res.json();
};
export const submitProviderApplication = async (app: any): Promise<any> => {
  const res = await fetch('/api/provider-applications', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(app)
  });
  return res.json();
};
export const updateProviderApplication = async (id: string, updates: any): Promise<any> => {
  const res = await fetch('/api/provider-applications/' + id, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates)
  });
  return res.json();
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
  const res = await fetch(`${API_BASE}/notifications`, { headers: getAuthHeadersGET() });
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
  const res = await fetch('/api/reviews/' + propertyId, { headers: getAuthHeadersGET() });
  return res.json();
};

export const submitReview = async (review: any): Promise<any> => {
  const res = await fetch('/api/reviews', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(review)
  });
  return res.json();
};
