import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/auth/signin';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  register: async (userData: { name: string; email: string; password: string }) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Products API
export const productApi = {
  getAll: async (params?: { category?: string; search?: string; page?: number; limit?: number }) => {
    const response = await api.get('/products', { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
  create: async (productData: any) => {
    const response = await api.post('/products', productData);
    return response.data;
  },
  update: async (id: string, productData: any) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
  getLowStock: async () => {
    const response = await api.get('/products/low-stock/alert');
    return response.data;
  },
};

// Categories API
export const categoryApi = {
  getAll: async () => {
    const response = await api.get('/categories');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },
  create: async (categoryData: any) => {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },
  update: async (id: string, categoryData: any) => {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};

// Customers API
export const customerApi = {
  getAll: async (params?: { search?: string; page?: number; limit?: number }) => {
    const response = await api.get('/customers', { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },
  create: async (customerData: any) => {
    const response = await api.post('/customers', customerData);
    return response.data;
  },
  update: async (id: string, customerData: any) => {
    const response = await api.put(`/customers/${id}`, customerData);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  },
};

// Invoices API
export const invoiceApi = {
  getAll: async (params?: { customer?: string; status?: string; dateFrom?: string; dateTo?: string; page?: number; limit?: number }) => {
    const response = await api.get('/invoices', { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/invoices/${id}`);
    return response.data;
  },
  create: async (invoiceData: any) => {
    const response = await api.post('/invoices', invoiceData);
    return response.data;
  },
  updateStatus: async (id: string, status: string) => {
    const response = await api.put(`/invoices/${id}/status`, { status });
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/invoices/${id}`);
    return response.data;
  },
};

// Dashboard API
export const dashboardApi = {
  getStats: async () => {
    const response = await api.get('/dashboard');
    return response.data;
  },
};

// Analytics API
export const analyticsApi = {
  getReports: async (params?: { dateFrom?: string; dateTo?: string; category?: string; customer?: string }) => {
    const response = await api.get('/analytics', { params });
    return response.data;
  },
};

// Legacy exports for backward compatibility
export const getProducts = () => productApi.getAll();
export const getProduct = (id: string) => productApi.getById(id);
export const createProduct = (data: any) => productApi.create(data);
export const updateProduct = (id: string, data: any) => productApi.update(id, data);
export const deleteProduct = (id: string) => productApi.delete(id);

export const getCategories = () => categoryApi.getAll();
export const getCategory = (id: string) => categoryApi.getById(id);
export const createCategory = (data: any) => categoryApi.create(data);
export const updateCategory = (id: string, data: any) => categoryApi.update(id, data);
export const deleteCategory = (id: string) => categoryApi.delete(id);

export const getCustomers = () => customerApi.getAll();
export const getCustomer = (id: string) => customerApi.getById(id);
export const createCustomer = (data: any) => customerApi.create(data);
export const updateCustomer = (id: string, data: any) => customerApi.update(id, data);
export const deleteCustomer = (id: string) => customerApi.delete(id);

export default api;
