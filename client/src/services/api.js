const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const removeLegacyLocalImageUrls = (value) => {
  if (typeof value === 'string') return /^http:\/\/localhost(?::\d+)?\/uploads\//i.test(value) ? '' : value;
  if (Array.isArray(value)) return value.map(removeLegacyLocalImageUrls);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, removeLegacyLocalImageUrls(item)]));
  return value;
};
const request = async (path, options = {}) => {
  const response = await fetch(`${API_URL}${path}`, { credentials: 'include', headers: { 'Content-Type': 'application/json', ...options.headers }, ...options });
  const payload = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(payload?.message || 'Request failed.');
  return removeLegacyLocalImageUrls(payload);
};

export const getHealth = async () => {
  return request('/health');
};

export const login = (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
export const getCurrentUser = () => request('/auth/me');
export const logout = () => request('/auth/logout', { method: 'POST' });
export const getCompanies = (search = '') => request(`/companies${search ? `?search=${encodeURIComponent(search)}` : ''}`);
export const createCompany = (company) => request('/companies', { method: 'POST', body: JSON.stringify(company) });
export const updateCompany = (id, company) => request(`/companies/${id}`, { method: 'PUT', body: JSON.stringify(company) });
export const deleteCompany = (id) => request(`/companies/${id}`, { method: 'DELETE' });
export const getVouchers = (filters = '') => {
  const query = typeof filters === 'string' ? { status: filters } : filters;
  const clean = Object.fromEntries(Object.entries(query || {}).filter(([, value]) => value !== '' && value !== undefined && value !== null));
  const params = new URLSearchParams(clean).toString();
  return request(`/vouchers${params ? `?${params}` : ''}`);
};
export const getVoucher = (id) => request(`/vouchers/${id}`);
export const getNextVoucherNumber = () => request('/vouchers/next-number');
export const createVoucher = (voucher) => request('/vouchers', { method: 'POST', body: JSON.stringify(voucher) });
export const updateVoucher = (id, voucher) => request(`/vouchers/${id}`, { method: 'PUT', body: JSON.stringify(voucher) });
export const deleteVoucher = (id) => request(`/vouchers/${id}`, { method: 'DELETE' });
export const approveVoucher = (id) => request(`/vouchers/${id}/approve`, { method: 'PATCH' });
export const cancelVoucher = (id) => request(`/vouchers/${id}/cancel`, { method: 'PATCH' });
export const getVoucherQr = (id) => request(`/vouchers/${id}/qr`);
export const downloadVoucherPdf = async (id, voucherNo = 'umrah-voucher') => {
  const response = await fetch(`${API_URL}/vouchers/${encodeURIComponent(id)}/pdf`, { credentials: 'include' });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload?.message || 'Unable to generate the PDF.');
  }
  const objectUrl = URL.createObjectURL(await response.blob());
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = `${voucherNo}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
};
export const getPublicVoucher = (companySlug, token) => request(`/public/vouchers/${encodeURIComponent(companySlug)}/${encodeURIComponent(token)}`);
export const getDashboardStats = (date = '', page = 1) => request(`/dashboard/stats?${new URLSearchParams({ ...(date ? { date } : {}), page }).toString()}`);

export const uploadImage = async (file, folder = 'misc') => {
  if (!file) throw new Error('Please select an image.');
  const formData = new FormData();
  formData.append('image', file); formData.append('folder', folder);
  const response = await fetch(`${API_URL}/uploads/image`, { method: 'POST', credentials: 'include', body: formData });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.message || 'Image upload failed.');
  return removeLegacyLocalImageUrls(payload);
};
export const getAgents = () => request('/agents');
export const createAgent = (agent) => request('/agents', { method: 'POST', body: JSON.stringify(agent) });
export const updateAgent = (id, agent) => request(`/agents/${id}`, { method: 'PUT', body: JSON.stringify(agent) });
export const deleteAgent = (id) => request(`/agents/${id}`, { method: 'DELETE' });

export const getCustomers = () => request('/customers');
export const createCustomer = (customer) => request('/customers', { method: 'POST', body: JSON.stringify(customer) });
export const updateCustomer = (id, customer) => request(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(customer) });
export const deleteCustomer = (id) => request(`/customers/${id}`, { method: 'DELETE' });

export const getReportPdf = async (filters = {}) => {
  const params = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== '' && value !== undefined && value !== null)));
  const response = await fetch(API_URL + '/reports/pdf?' + params.toString(), { credentials: 'include' });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload?.message || 'Unable to generate the report PDF.');
  }
  return URL.createObjectURL(await response.blob());
};
export const getSettingsAdmins = () => request('/settings/admins');
export const createSettingsAdmin = (admin) => request('/settings/admins', { method: 'POST', body: JSON.stringify(admin) });
export const updateSettingsAdmin = (id, admin) => request('/settings/admins/' + id, { method: 'PUT', body: JSON.stringify(admin) });
export const deleteSettingsAdmin = (id) => request('/settings/admins/' + id, { method: 'DELETE' });
export const updateSettingsProfile = (profile) => request('/settings/profile', { method: 'PATCH', body: JSON.stringify(profile) });
export const getDashboardBranding = () => request('/settings/branding');
export const updateDashboardBranding = (branding) => request('/settings/branding', { method: 'PATCH', body: JSON.stringify(branding) });
