import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Order, CatalogItem, StockItem, FinanceRecord, Customer, Recipe } from './types';

interface AppDataState {
  orders: Order[];
  catalog: CatalogItem[];
  stock: StockItem[];
  finances: FinanceRecord[];
  customers: Customer[];
  addOrder: (order: Order) => Promise<void>;
  updateOrderStatus: (id: string, status: Order['status']) => Promise<void>;
  addCatalogItem: (item: CatalogItem) => Promise<void>;
  updateCatalogItem: (item: CatalogItem) => Promise<void>;
  deleteCatalogItem: (id: string) => Promise<void>;
  updateStock: (id: string, quantity: number) => Promise<void>;
  updateStockItem: (item: StockItem) => Promise<void>;
  deleteStockItem: (id: string) => Promise<void>;
  addStockItem: (item: Omit<StockItem, 'id'>) => Promise<void>;
  addFinanceRecord: (record: FinanceRecord) => Promise<void>;
  updateFinanceRecord: (record: FinanceRecord) => Promise<void>;
  deleteFinanceRecord: (id: string) => Promise<void>;
  recipes: Recipe[];
  addRecipe: (recipe: Omit<Recipe, 'id'>) => Promise<void>;
  updateOrder: (order: Order) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  refreshStock: () => Promise<void>;
  isLoading: boolean;
}

const AppDataContext = createContext<AppDataState | undefined>(undefined);

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [stock, setStock] = useState<StockItem[]>([]);
  const [finances, setFinances] = useState<FinanceRecord[]>([]);
  const [customers, ] = useState<Customer[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial data from DB
  const fetchData = async () => {
    try {
      const [ordersRes, catalogRes, stockRes, financesRes, recipesRes] = await Promise.all([
        fetch('/api/orders').then(res => res.json()),
        fetch('/api/catalog').then(res => res.json()),
        fetch('/api/stock').then(res => res.json()),
        fetch('/api/finances').then(res => res.json()),
        fetch('/api/recipes').then(res => res.json())
      ]);
      
      if (Array.isArray(ordersRes)) setOrders(ordersRes);
      if (Array.isArray(catalogRes)) setCatalog(catalogRes);
      if (Array.isArray(stockRes)) setStock(stockRes);
      if (Array.isArray(financesRes)) setFinances(financesRes);
      if (Array.isArray(recipesRes)) setRecipes(recipesRes);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refreshStock = async () => {
    const stockRes = await fetch('/api/stock').then(res => res.json());
    if (Array.isArray(stockRes)) setStock(stockRes);
  };

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

  const updateOrder = async (order: Order) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });
      if (res.ok) {
        const updatedOrder = await res.json();
        setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      const res = await fetch(`/api/orders?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setOrders(prev => prev.filter(o => o.id !== id));
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

  const updateCatalogItem = async (item: CatalogItem) => {
    try {
      const res = await fetch('/api/catalog', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (res.ok) {
        const updatedItem = await res.json();
        setCatalog(prev => prev.map(c => c.id === updatedItem.id ? updatedItem : c));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteCatalogItem = async (id: string) => {
    try {
      const res = await fetch(`/api/catalog?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setCatalog(prev => prev.filter(c => c.id !== id));
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

  const updateStockItem = async (item: StockItem) => {
    try {
      const res = await fetch('/api/stock', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (res.ok) {
        const updatedItem = await res.json();
        setStock(prev => prev.map(s => s.id === updatedItem.id ? updatedItem : s));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteStockItem = async (id: string) => {
    try {
      const res = await fetch(`/api/stock?id=${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setStock(prev => prev.filter(s => s.id !== id));
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

  const updateFinanceRecord = async (record: FinanceRecord) => {
    try {
      const res = await fetch('/api/finances', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      });
      if (res.ok) {
        const updatedRecord = await res.json();
        setFinances(prev => prev.map(f => f.id === updatedRecord.id ? updatedRecord : f));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteFinanceRecord = async (id: string) => {
    try {
      const res = await fetch(`/api/finances?id=${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setFinances(prev => prev.filter(f => f.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addStockItem = async (item: Omit<StockItem, 'id'>) => {
    try {
      const res = await fetch('/api/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (res.ok) {
        const newItem = await res.json();
        setStock(prev => [...prev, newItem]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addRecipe = async (recipe: Omit<Recipe, 'id'>) => {
    try {
      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipe)
      });
      if (res.ok) {
        const newRecipe = await res.json();
        setRecipes(prev => [newRecipe, ...prev]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AppDataContext.Provider value={{
      orders, catalog, stock, finances, customers, recipes,
      addOrder, updateOrderStatus, updateOrder, deleteOrder, addCatalogItem, updateCatalogItem, deleteCatalogItem, updateStock, updateStockItem, deleteStockItem, addStockItem, addFinanceRecord, updateFinanceRecord, deleteFinanceRecord, addRecipe, refreshStock, isLoading
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
