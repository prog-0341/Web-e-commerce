export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  unit: string;
  producer: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  categoryId: number;
  category?: Category;
}

export interface OrderItem {
  id: number;
  productId: number;
  product?: Product;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: number;
  customerName: string;
  customerEmail: string;
  orderDate: string;
  status: string;
  total: number;
  items: OrderItem[];
}

export interface CreateOrderRequest {
  customerName: string;
  customerEmail: string;
  items: { productId: number; quantity: number }[];
}

export type ProductFormData = Omit<Product, 'id' | 'createdAt' | 'category'>;
