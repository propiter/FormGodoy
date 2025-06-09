import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { Client, Product, Palet, Caja, Order } from '@/types';
import { fetchClientes, fetchProductos, fetchPalets, fetchCajas, fetchPedidos } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface DataContextType {
  clients: Client[];
  products: Product[];
  palets: Palet[];
  cajas: Caja[];
  orders: Order[];
  categories: string[]; // Added categories
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  getClientByCIF: (cif: string) => Client | undefined;
  getOrderByNumber: (number: string) => Order | undefined;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider = ({ children }: DataProviderProps) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [palets, setPalets] = useState<Palet[]>([]);
  const [cajas, setCajas] = useState<Caja[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<string[]>([]); // State for categories
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [clientsData, productsData, paletsData, cajasData, ordersData] = await Promise.all([
        fetchClientes(),
        fetchProductos(),
        fetchPalets(),
        fetchCajas(),
        fetchPedidos()
      ]);
      setClients(clientsData);
      setProducts(productsData);
      setPalets(paletsData);
      setCajas(cajasData);
      setOrders(ordersData);
      // Extract unique categories and ensure they are all strings
      const productCategories = productsData.map(p => p.category).filter(c => typeof c === 'string') as string[];
      const uniqueCategories = Array.from(new Set(productCategories));
      setCategories(uniqueCategories.sort()); // Sort categories alphabetically

    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Failed to load data. Please try again.");
      toast({
        title: "Error de carga",
        description: "No se pudieron cargar los datos. Intente recargar la página.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const getClientByCIF = (cif: string) => {
    return clients.find(client => client.cif === cif);
  };

  const getOrderByNumber = (number: string) => {
    const searchNum = String(number).trim().toUpperCase();
    
    return orders.find(order => 
      String(order.receptionNumber).toUpperCase() === searchNum
    );
  };

  return (
    <DataContext.Provider
      value={{ clients, products, palets, cajas, orders, categories, loading, error, refreshData, getClientByCIF, getOrderByNumber }}
    >
      {children}
    </DataContext.Provider>
  );
};
