import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Order, CatalogItem, StockItem, FinanceRecord, Customer } from './types';

interface AppDataState {
  orders: Order[];
  catalog: CatalogItem[];
  stock: StockItem[];
  finances: FinanceRecord[];
  customers: Customer[];
  addOrder: (order: Order) => Promise<void>;
  updateOrderStatus: (id: string, status: Order['status']) => Promise<void>;
  addCatalogItem: (item: CatalogItem) => Promise<void>;
  updateStock: (id: string, quantity: number) => Promise<void>;
  addFinanceRecord: (record: FinanceRecord) => Promise<void>;
  isLoading: boolean;
}

const AppDataContext = createContext<AppDataState | undefined>(undefined);

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [stock, setStock] = useState<StockItem[]>([]);
  const [finances, setFinances] = useState<FinanceRecord[]>([]);
  const [customers, ] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial data from DB
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, catalogRes, stockRes, financesRes] = await Promise.all([
          fetch('/api/orders').then(res => res.json()),
          fetch('/api/catalog').then(res => res.json()),
          fetch('/api/stock').then(res => res.json()),
          fetch('/api/finances').then(res => res.json())
        ]);
        
        // Handle cases where api doesn't return arrays yet (e.g. running just vite dev without vercel)
        if (Array.isArray(ordersRes)) setOrders(ordersRes);
        if (Array.isArray(catalogRes)) setCatalog(catalogRes);
        if (Array.isArray(stockRes)) setStock(stockRes);
        if (Array.isArray(financesRes)) setFinances(financesRes);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const addOrder = async (order: Order) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });
      if (res.ok) {
        const newOrder = await res.json();
        setOrders(prev => [newOrder, ...prev]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateOrderStatus = async (id: string, status: Order['status']) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addCatalogItem = async (item: CatalogItem) => {
    try {
      const res = await fetch('/api/catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (res.ok) {
        const newItem = await res.json();
        setCatalog(prev => [...prev, newItem]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateStock = async (id: string, quantity: number) => {
    try {
      const res = await fetch('/api/stock', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, quantity })
      });
      if (res.ok) {
        setStock(prev => prev.map(s => s.id === id ? { ...s, quantity } : s));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addFinanceRecord = async (record: FinanceRecord) => {
    try {
      const res = await fetch('/api/finances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      });
      if (res.ok) {
        const newRecord = await res.json();
        setFinances(prev => [newRecord, ...prev]);
        // Also update local stock to reflect the change
        setStock(prev => prev.map(s => s.id === record.ingredientId ? { ...s, quantity: s.quantity + record.quantityAdded } : s));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AppDataContext.Provider value={{
      orders, catalog, stock, finances, customers,
      addOrder, updateOrderStatus, addCatalogItem, updateStock, addFinanceRecord, isLoading
    }}>
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};
