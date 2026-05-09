export type OrderStatus = 'Pendiente' | 'En Elaboración' | 'En Envío' | 'Entregado' | 'Cancelado';
export type PaymentMethod = 'Efectivo' | 'Transferencia';
export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  createdAt: string;
}

export interface StockRevision {
  id: string;
  date: string;
  details: any; // Using any for Json for now, or define a specific interface
  notes?: string;
}

export interface OrderItem {
  catalogId: string;
  quantity: number;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  status: string;
  userId?: string;
  username?: string;
  date: string;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  address?: string;
  items: OrderItem[];
  delivery: boolean;
  deliveryCost: number;
  date: string;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  total: number;
  createdById?: string;
  createdByUsername?: string;
  history?: OrderStatusHistory[];
}

export interface PromoType {
  quantity: number;
  promoPrice: number;
}

export interface CatalogItem {
  id: string;
  name: string;
  coverImage?: string;
  carouselImages: string[];
  ingredients: string[];
  price: number;
  promos?: any;
}

export interface StockItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  minQuantity: number;
}

export interface FinanceRecord {
  id: string;
  date: string;
  ingredientId: string;
  quantityAdded: number;
  totalCost: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  ordersCount: number;
}

export interface RecipeIngredient {
  id: string;
  recipeId: string;
  stockItemId: string;
  quantity: number;
  stockItem?: StockItem;
}

export interface Recipe {
  id: string;
  name: string;
  preparation: string;
  ingredients: RecipeIngredient[];
}
