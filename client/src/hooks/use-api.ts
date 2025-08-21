import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productApi, categoryApi, customerApi, invoiceApi, dashboardApi, analyticsApi } from '../lib/api-client-new';

// Query Keys
export const QUERY_KEYS = {
  PRODUCTS: ['products'],
  PRODUCT: (id: string) => ['product', id],
  CATEGORIES: ['categories'],
  CATEGORY: (id: string) => ['category', id],
  CUSTOMERS: ['customers'],
  CUSTOMER: (id: string) => ['customer', id],
  INVOICES: ['invoices'],
  INVOICE: (id: string) => ['invoice', id],
  DASHBOARD: ['dashboard'],
  ANALYTICS: ['analytics'],
  LOW_STOCK: ['low-stock'],
};

// Product Hooks
export const useProducts = (params?: { category?: string; search?: string; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.PRODUCTS, params],
    queryFn: () => productApi.getAll(params),
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.PRODUCT(id),
    queryFn: () => productApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: productApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LOW_STOCK });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => productApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCT(id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LOW_STOCK });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: productApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LOW_STOCK });
    },
  });
};

export const useLowStockProducts = () => {
  return useQuery({
    queryKey: QUERY_KEYS.LOW_STOCK,
    queryFn: productApi.getLowStock,
  });
};

// Category Hooks
export const useCategories = () => {
  return useQuery({
    queryKey: QUERY_KEYS.CATEGORIES,
    queryFn: categoryApi.getAll,
  });
};

export const useCategory = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.CATEGORY(id),
    queryFn: () => categoryApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: categoryApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => categoryApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORY(id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: categoryApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD });
    },
  });
};

// Customer Hooks
export const useCustomers = (params?: { search?: string; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.CUSTOMERS, params],
    queryFn: () => customerApi.getAll(params),
  });
};

export const useCustomer = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.CUSTOMER(id),
    queryFn: () => customerApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: customerApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOMERS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD });
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => customerApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOMERS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOMER(id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD });
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: customerApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOMERS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD });
    },
  });
};

// Invoice Hooks
export const useInvoices = (params?: { customer?: string; status?: string; dateFrom?: string; dateTo?: string; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.INVOICES, params],
    queryFn: () => invoiceApi.getAll(params),
  });
};

export const useInvoice = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.INVOICE(id),
    queryFn: () => invoiceApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: invoiceApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.INVOICES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LOW_STOCK });
    },
  });
};

export const useUpdateInvoiceStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => invoiceApi.updateStatus(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.INVOICES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.INVOICE(id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD });
    },
  });
};

export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: invoiceApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.INVOICES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LOW_STOCK });
    },
  });
};

// Dashboard Hooks
export const useDashboard = () => {
  return useQuery({
    queryKey: QUERY_KEYS.DASHBOARD,
    queryFn: dashboardApi.getStats,
  });
};

// Analytics Hooks
export const useAnalytics = (params?: { dateFrom?: string; dateTo?: string; category?: string; customer?: string }) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.ANALYTICS, params],
    queryFn: () => analyticsApi.getReports(params),
  });
};
