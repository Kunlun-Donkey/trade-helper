import request from '@/utils/request';

/* ────────────── Auth ────────────── */
export const authApi = {
  login: (username: string, password: string) =>
    request.post('/auth/login', { username, password }),
  register: (data: { username: string; password: string; email?: string }) =>
    request.post('/auth/register', data),
  getProfile: () => request.get('/auth/profile'),
  updateProfile: (data: Record<string, unknown>) =>
    request.put('/auth/profile', data),
};

/* ────────────── Customer ────────────── */
export const customerApi = {
  getList: (params?: Record<string, unknown>) =>
    request.get('/customer', { params }),
  getById: (id: number | string) => request.get(`/customer/${id}`),
  create: (data: Record<string, unknown>) => request.post('/customer', data),
  update: (id: number | string, data: Record<string, unknown>) =>
    request.put(`/customer/${id}`, data),
  delete: (id: number | string) => request.delete(`/customer/${id}`),
  getFollowLogs: (customerId: number | string) =>
    request.get(`/customer/${customerId}/follow-log`),
  createFollowLog: (customerId: number | string, data: Record<string, unknown>) =>
    request.post(`/customer/${customerId}/follow-log`, data),
  deleteFollowLog: (customerId: number | string, logId: number | string) =>
    request.delete(`/customer/${customerId}/follow-log/${logId}`),
  importCustomers: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request.post('/customer/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

/* ────────────── Product ────────────── */
export const productApi = {
  getList: (params?: Record<string, unknown>) =>
    request.get('/product', { params }),
  getById: (id: number | string) => request.get(`/product/${id}`),
  create: (data: Record<string, unknown>) => request.post('/product', data),
  update: (id: number | string, data: Record<string, unknown>) =>
    request.put(`/product/${id}`, data),
  delete: (id: number | string) => request.delete(`/product/${id}`),
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request.post('/product/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

/* ────────────── Document ────────────── */
export const documentApi = {
  getList: (params?: Record<string, unknown>) =>
    request.get('/document', { params }),
  getById: (id: number | string) => request.get(`/document/${id}`),
  create: (data: Record<string, unknown>) => request.post('/document', data),
  update: (id: number | string, data: Record<string, unknown>) =>
    request.put(`/document/${id}`, data),
  delete: (id: number | string) => request.delete(`/document/${id}`),
  generatePdf: (id: number | string) =>
    request.get(`/document/${id}/pdf`, { responseType: 'blob' }),
};

/* ────────────── Order ────────────── */
export const orderApi = {
  getList: (params?: Record<string, unknown>) =>
    request.get('/order', { params }),
  getById: (id: number | string) => request.get(`/order/${id}`),
  create: (data: Record<string, unknown>) => request.post('/order', data),
  update: (id: number | string, data: Record<string, unknown>) =>
    request.put(`/order/${id}`, data),
  delete: (id: number | string) => request.delete(`/order/${id}`),
  getStats: () => request.get('/order/stats'),
};

/* ────────────── Amazon ────────────── */
export const amazonApi = {
  upload: (file: File, reportType: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('reportType', reportType);
    return request.post('/amazon/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getList: (params?: Record<string, unknown>) =>
    request.get('/amazon', { params }),
  getById: (id: number | string) => request.get(`/amazon/${id}`),
  getData: (id: number | string) => request.get(`/amazon/${id}/data`),
  delete: (id: number | string) => request.delete(`/amazon/${id}`),
};

/* ────────────── Dashboard ────────────── */
export const dashboardApi = {
  getB2BStats: () => request.get('/dashboard/b2b-stats'),
  getAmazonStats: () => request.get('/dashboard/amazon-stats'),
  getTodos: () => request.get('/dashboard/todos'),
};
