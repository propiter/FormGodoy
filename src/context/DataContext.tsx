import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { fetchClientes, fetchProductos, fetchPalets, fetchCajas, fetchPedidos } from '@/lib/api';
import { Client, Product, Palet, Caja, Order } from '@/types';

interface DataContextType {
  clients: Client[];
  products: Product[];
  palets: Palet[];
  cajas: Caja[];
  orders: Order[];
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = async () => {
    try {
      setLoading(true);
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
      setError(null);
    } catch (err) {
      setError('Error al cargar los datos. Por favor, intente de nuevo.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

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
      value={{
        clients,
        products,
        palets,
        cajas,
        orders,
        loading,
        error,
        refreshData: fetchAllData,
        getClientByCIF,
        getOrderByNumber
      }}
    >
      {children}
    </DataContext.Provider>
  );
};