import type { Category, CreateOrderRequest, Order, Product, ProductFormData } from '../types';

const BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => ({ message: res.statusText }));

  if (!res.ok) {
    throw new Error(data?.message || `Error ${res.status}`);
  }

  return data as T;
}

// --- Productos ---
export const productsApi = {
  getAll: (params?: { categoryId?: number; search?: string; onlyActive?: boolean }) => {
    const qs = new URLSearchParams();
    if (params?.categoryId != null) qs.set('categoryId', String(params.categoryId));
    if (params?.search) qs.set('search', params.search);
    if (params?.onlyActive != null) qs.set('onlyActive', String(params.onlyActive));
    const query = qs.toString();
    return request<Product[]>(`/products${query ? `?${query}` : ''}`);
  },

  getById: (id: number) => request<Product>(`/products/${id}`),

  create: (data: ProductFormData) =>
    request<Product>('/products', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: number, data: ProductFormData) =>
    request<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ id, ...data }),
    }),

  delete: (id: number) => request<void>(`/products/${id}`, { method: 'DELETE' }),
};

// --- Categorías ---
export const categoriesApi = {
  getAll: () => request<Category[]>('/categories'),

  getById: (id: number) => request<Category>(`/categories/${id}`),

  create: (data: Omit<Category, 'id'>) =>
    request<Category>('/categories', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: number, data: Omit<Category, 'id'>) =>
    request<Category>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ id, ...data }),
    }),

  delete: (id: number) => request<void>(`/categories/${id}`, { method: 'DELETE' }),
};

// --- Pedidos ---
export const ordersApi = {
  getAll: (status?: string) => {
    const qs = status ? `?status=${encodeURIComponent(status)}` : '';
    return request<Order[]>(`/orders${qs}`);
  },

  getById: (id: number) => request<Order>(`/orders/${id}`),

  create: (data: CreateOrderRequest) =>
    request<Order>('/orders', { method: 'POST', body: JSON.stringify(data) }),

  updateStatus: (id: number, status: string) =>
    request<Order>(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  delete: (id: number) => request<void>(`/orders/${id}`, { method: 'DELETE' }),
};
