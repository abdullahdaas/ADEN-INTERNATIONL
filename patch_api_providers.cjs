const fs = require('fs');
let code = fs.readFileSync('src/utils/api.ts', 'utf8');

code += `
export const fetchServiceProviders = async (): Promise<any[]> => {
  const res = await fetch('/api/service-providers');
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
  const res = await fetch('/api/provider-applications');
  return res.json();
};
export const submitProviderApplication = async (app: any): Promise<any> => {
  const res = await fetch('/api/provider-applications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
`;

fs.writeFileSync('src/utils/api.ts', code);
console.log("Patched api.ts for providers");
