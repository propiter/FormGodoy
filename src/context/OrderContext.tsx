import { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { Client, ProductLine, Order } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { saveOrder, updateOrder } from '@/lib/api';
import { OrderConfirmationModal } from '@/components/order/OrderConfirmationModal';

interface OrderContextType {
  client: Client | null;
  productLines: ProductLine[];
  isEditMode: boolean;
  currentOrderNumber: string | null;
  lastOrderNumber: string | null;
  showConfirmation: boolean;
  setClient: (client: Client | null) => void;
  addProductLine: (line: ProductLine) => void;
  updateProductLine: (index: number, line: ProductLine) => void;
  removeProductLine: (index: number) => void;
  clearOrder: () => void;
  submitOrder: () => Promise<Order | undefined>;
  startEditOrder: (order: Order) => void;
  updateExistingOrder: () => Promise<Order | undefined>;
  handleCloseModal: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};

interface OrderProviderProps {
  children: ReactNode;
}

export const OrderProvider = ({ children }: OrderProviderProps) => {
  const [client, setClient] = useState<Client | null>(null);
  const [productLines, setProductLines] = useState<ProductLine[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentOrderNumber, setCurrentOrderNumber] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [lastOrderNumber, setLastOrderNumber] = useState<string | null>(null);
  const { toast } = useToast();

  const clearOrder = () => {
    setClient(null);
    setProductLines([]);
    setIsEditMode(false);
    setCurrentOrderNumber(null);
  };

  const addProductLine = (line: ProductLine) => {
    setProductLines(prev => [...prev, line]);
  };

  const updateProductLine = (index: number, line: ProductLine) => {
    setProductLines(prev => {
      const newLines = [...prev];
      newLines[index] = line;
      return newLines;
    });
  };

  const removeProductLine = (index: number) => {
    setProductLines(prev => prev.filter((_, i) => i !== index));
  };

  const submitOrder = async (): Promise<Order | undefined> => {
    if (!client) {
      toast({
        title: "Error",
        description: "Debe seleccionar un cliente antes de enviar el pedido.",
        variant: "destructive"
      });
      return;
    }

    if (productLines.length === 0) {
      toast({
        title: "Error",
        description: "Debe agregar al menos un producto al pedido.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Generate a new reception number (in a real app this might come from the backend)
      const receptionNumber = `P-${Date.now().toString().slice(-4)}`;
      
      const newOrder: Order = {
        receptionNumber,
        clientCIF: client.cif,
        clientName: client.name,
        products: productLines,
        status: "Pendiente",
        orderNumber: "",
        provider: "",
        createdAt: new Date().toISOString()
      };

      const savedOrder = await saveOrder(newOrder);
      
      // Show the confirmation modal
      setLastOrderNumber(receptionNumber);
      setShowConfirmation(true);
      
      // Clear the form but keep the client if they want to make another order
      setProductLines([]);
      return savedOrder;
    } catch (error) {
      console.error("Error saving order:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al guardar el pedido. Por favor, intente de nuevo.",
        variant: "destructive"
      });
    }
  };

  const startEditOrder = (order: Order) => {
    setIsEditMode(true);
    setCurrentOrderNumber(order.receptionNumber);
    setClient({
      cif: order.clientCIF,
      name: order.clientName,
      // We would populate more client fields from actual data
      address: '',
      phone: '',
      email: ''
    });
    setProductLines(order.products);
  };

  const updateExistingOrder = async (): Promise<Order | undefined> => {
    if (!client || !currentOrderNumber) {
      toast({
        title: "Error",
        description: "Información de pedido incompleta.",
        variant: "destructive"
      });
      return;
    }

    if (productLines.length === 0) {
      toast({
        title: "Error",
        description: "Debe agregar al menos un producto al pedido.",
        variant: "destructive"
      });
      return;
    }

    try {
      const updatedOrder: Order = {
        receptionNumber: currentOrderNumber,
        clientCIF: client.cif,
        clientName: client.name,
        products: productLines,
        status: "Pendiente", // Maintain status
        orderNumber: "",
        provider: "",
        createdAt: new Date().toISOString() // Update timestamp
      };

      const result = await updateOrder(updatedOrder);
      
      toast({
        title: "Pedido actualizado",
        description: `Pedido #${currentOrderNumber} actualizado correctamente.`,
      });
      
      clearOrder();
      return result;
    } catch (error) {
      console.error("Error updating order:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al actualizar el pedido. Por favor, intente de nuevo.",
        variant: "destructive"
      });
    }
  };

  const handleCloseModal = useCallback(() => {
    setShowConfirmation(false);
  }, []);

  return (
    <OrderContext.Provider
      value={{
        client,
        productLines,
        isEditMode,
        currentOrderNumber,
        setClient,
        addProductLine,
        updateProductLine,
        removeProductLine,
        clearOrder,
        submitOrder,
        startEditOrder,
        updateExistingOrder,
        showConfirmation,
        lastOrderNumber,
        handleCloseModal
      }}
    >
      {children}
      {showConfirmation && lastOrderNumber && (
        <OrderConfirmationModal 
          orderNumber={lastOrderNumber} 
          onClose={handleCloseModal} 
        />
      )}
    </OrderContext.Provider>
  );
};