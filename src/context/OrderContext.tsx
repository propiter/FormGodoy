import { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { Client, ProductLine, Order } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { saveOrder, updateOrder } from '@/lib/api'; // updateOrder here is the one for Google Sheets
import { OrderConfirmationModal } from '@/components/order/OrderConfirmationModal';

interface OrderContextType {
  client: Client | null;
  productLines: ProductLine[];
  isEditMode: boolean;
  currentOrderNumber: string | null; // Stores receptionNumber of the order being edited
  lastOrderNumber: string | null; // For new order confirmation
  showConfirmation: boolean;
  setClient: (client: Client | null) => void;
  addProductLine: (line: ProductLine) => void;
  updateProductLine: (index: number, line: ProductLine) => void;
  removeProductLine: (index: number) => void;
  clearOrder: () => void;
  submitOrder: () => Promise<Order | undefined>; // For new orders
  startEditOrder: (order: Order) => void; // To load an existing order into the form
  updateExistingOrder: () => Promise<Order | undefined>; // Old method for GSheets, not used by new webhook flow
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

  const clearOrder = useCallback(() => { // Wrapped in useCallback
    setClient(null);
    setProductLines([]);
    setIsEditMode(false);
    setCurrentOrderNumber(null);
    // lastOrderNumber and showConfirmation are related to new order flow, not reset here
  }, []);


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

  // For creating NEW orders (uses Google Sheets via saveOrder)
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
      const receptionNumber = `PED-${Date.now().toString().slice(-4)}`;
      
      const newOrder: Order = {
        receptionNumber,
        clientCIF: client.cif,
        clientName: client.name,
        products: productLines,
        status: "Pendiente",
        orderNumber: "",
        provider: "",
        createdAt: new Date().toISOString() // Consistent ISO string
      };

      const savedOrder = await saveOrder(newOrder); // saveOrder writes to Google Sheets
      
      setLastOrderNumber(receptionNumber);
      setShowConfirmation(true);
      
      setProductLines([]); // Clear products, keep client for potentially another order
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

  // To load an existing order's data into the form for editing
  const startEditOrder = (order: Order) => {
    setIsEditMode(true);
    setCurrentOrderNumber(order.receptionNumber); // Store the ID of the order being edited
    setClient({
      cif: order.clientCIF,
      name: order.clientName,
      address: order.client?.address || '', // Assuming client details might be part of Order or fetched separately
      phone: order.client?.phone || '',
      email: order.client?.email || ''
    });
    setProductLines(order.products);
  };

  // OLD method for updating orders via Google Sheets.
  // The new webhook flow in UpdateOrderPage.tsx bypasses this.
  const updateExistingOrder = async (): Promise<Order | undefined> => {
    if (!client || !currentOrderNumber) {
      toast({
        title: "Error",
        description: "Información de pedido incompleta para la actualización (método antiguo).",
        variant: "destructive"
      });
      return;
    }

    if (productLines.length === 0) {
      // ... (same validation as submitOrder)
      return;
    }

    try {
      const orderToUpdate: Order = {
        receptionNumber: currentOrderNumber,
        clientCIF: client.cif,
        clientName: client.name,
        products: productLines,
        status: "Pendiente", // Or get from a status field if available
        orderNumber: "", // Or get from field
        provider: "", // Or get from field
        createdAt: new Date().toISOString() 
      };

      // updateOrder is the one from lib/api.ts that writes to Google Sheets
      const result = await updateOrder(orderToUpdate); 
      
      toast({
        title: "Pedido actualizado (Google Sheets)",
        description: `Pedido #${currentOrderNumber} actualizado correctamente en Google Sheets.`,
      });
      
      clearOrder();
      return result;
    } catch (error) {
      console.error("Error updating order (Google Sheets):", error);
      toast({
        title: "Error",
        description: "Hubo un problema al actualizar el pedido (Google Sheets).",
        variant: "destructive"
      });
    }
    return undefined; // Ensure a Promise<Order | undefined> is returned
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
        updateExistingOrder, // Kept for now, but not used by new webhook flow
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
