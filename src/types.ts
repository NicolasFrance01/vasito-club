export type OrderStatus = 'Pendiente' | 'En Preparación' | 'Listo' | 'Entregado' | 'Cancelado';
export type PaymentMethod = 'Efectivo' | 'Transferencia';

export interface OrderItem {
  catalogId: string;
  quantity: number;
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
}

export interface CatalogItem {
  id: string;
  name: string;
  image: string;
  ingredients: string[];
  price: number;
  promo?: string;
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
