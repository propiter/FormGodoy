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

  const clearOrder = useCallback(() => { 
    setClient(null);
    setProductLines([]);
    setIsEditMode(false);
    setCurrentOrderNumber(null);
    // No resetear lastOrderNumber aquí, se usa para el modal
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
        createdAt: new Date().toISOString()
      };

      const savedOrder = await saveOrder(newOrder); 
      
      setLastOrderNumber(receptionNumber); // Guardar para el modal
      setShowConfirmation(true);
      
      // Limpiar el formulario para un nuevo pedido, pero no el cliente
      setProductLines([]); 
      // No llamar a clearOrder() completo para permitir múltiples pedidos para el mismo cliente
      // Si se quiere limpiar el cliente también, se puede llamar a clearOrder() aquí.
      
      return savedOrder;
    } catch (error) {
      console.error("Error saving order:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al guardar el pedido. Por favor, intente de nuevo.",
        variant: "destructive"
      });
    }
    return undefined;
  };

  const startEditOrder = (order: Order) => {
    setIsEditMode(true);
    setCurrentOrderNumber(order.receptionNumber); 
    setClient({
      cif: order.clientCIF,
      name: order.clientName,
      address: order.client?.address || '', 
      phone: order.client?.phone || '',
      email: order.client?.email || ''
    });
    setProductLines(order.products);
    setShowConfirmation(false); // Asegurarse de que no haya modales de confirmación abiertos
  };

  // Esta función es para la actualización vía Google Sheets (flujo antiguo)
  // La nueva actualización vía webhook se manejará en UpdateOrderPage.tsx
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
      toast({
        title: "Error",
        description: "Debe agregar al menos un producto al pedido para actualizar.",
        variant: "destructive"
      });
      return;
    }

    try {
      const orderToUpdate: Order = {
        receptionNumber: currentOrderNumber,
        clientCIF: client.cif,
        clientName: client.name,
        products: productLines,
        status: "Pendiente", // O el status actual del pedido si se quiere preservar
        orderNumber: "", // O el orderNumber existente
        provider: "", // O el provider existente
        createdAt: new Date().toISOString() // O el createdAt existente
      };

      const result = await updateOrder(orderToUpdate); // updateOrder es la de Google Sheets
      
      toast({
        title: "Pedido actualizado (Google Sheets)",
        description: `Pedido #${currentOrderNumber} actualizado correctamente en Google Sheets.`,
      });
      
      clearOrder(); // Limpiar todo después de actualizar
      return result;
    } catch (error) {
      console.error("Error updating order (Google Sheets):", error);
      toast({
        title: "Error",
        description: "Hubo un problema al actualizar el pedido (Google Sheets).",
        variant: "destructive"
      });
    }
    return undefined;
  };

  const handleCloseModal = useCallback(() => {
    setShowConfirmation(false);
    // Considerar si lastOrderNumber debe resetearse aquí o al iniciar un nuevo pedido.
    // Por ahora, se mantiene hasta que se envíe un nuevo pedido.
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
        updateExistingOrder, // Mantener por si se usa en otro lado, aunque el flujo principal de update es otro
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
