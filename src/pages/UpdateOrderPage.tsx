import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useOrder } from '@/context/OrderContext';
import { Order } from '@/types';
import { fetchPedidos } from '@/lib/api';
import ProductLinesManager from '@/components/order/ProductLinesManager';
import OrderSummary from '@/components/order/OrderSummary';
import { ArrowLeft, Search, Save, Loader2, Info } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const UpdateOrderPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { client, productLines, isEditMode, currentOrderNumber, startEditOrder, clearOrder } = useOrder();
  
  const [cif, setCif] = useState('');
  const [receptionNumberInput, setReceptionNumberInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previousOrderData, setPreviousOrderData] = useState<Order | null>(null);

  const [showStatusInfoModal, setShowStatusInfoModal] = useState(false);
  const [statusInfoModalOrderNumber, setStatusInfoModalOrderNumber] = useState<string | null>(null);

  const handleSearch = async () => {
    const cleanCif = cif.trim().toUpperCase();
    const cleanReceptionNumber = receptionNumberInput.trim().toUpperCase();
    
    if (!cleanCif || !cleanReceptionNumber) {
      toast({
        title: "Campos incompletos",
        description: "Por favor, introduce el CIF y el número de recepción",
        variant: "destructive"
      });
      return;
    }
    
    setIsSearching(true);
    setPreviousOrderData(null);
    clearOrder(); // Clear any existing form data from context

    try {
      const allOrders = await fetchPedidos();
      const order = allOrders.find(
        (o) => o.receptionNumber.toUpperCase() === cleanReceptionNumber
      );
      
      console.log('Resultado de búsqueda (fresco):', {
        buscado: cleanReceptionNumber,
        orderEncontrado: order,
      });

      if (!order) {
        toast({
          title: "Pedido no encontrado",
          description: `No se encontró el pedido "${cleanReceptionNumber}" en los datos más recientes.`,
          variant: "destructive"
        });
        setIsSearching(false);
        return;
      }

      if (String(order.clientCIF).toUpperCase() !== cleanCif) {
        toast({
          title: "CIF incorrecto",
          description: `El CIF del pedido encontrado (${order.clientCIF}) no coincide con el CIF introducido.`,
          variant: "destructive"
        });
        setIsSearching(false);
        return;
      }

      const orderStatus = order.status.toLowerCase();
      if (orderStatus === 'pendiente' || orderStatus === 'solicitado') {
        setPreviousOrderData(order);
        startEditOrder(order);
      } else {
        setStatusInfoModalOrderNumber(order.receptionNumber);
        setShowStatusInfoModal(true);
        // Do not proceed to edit mode, previousOrderData remains null, form remains cleared
      }

    } catch (error) {
      console.error('Error buscando pedido (fresco):', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al buscar el pedido.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = async () => {
    if (!previousOrderData || !client || !currentOrderNumber) {
      toast({
        title: "Error de consistencia",
        description: "Faltan datos del pedido original, del cliente o el número de pedido actual. Intente buscar el pedido de nuevo.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (productLines.length === 0) {
      toast({
        title: "Pedido vacío",
        description: "Debe agregar al menos un producto al pedido.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    const updatedOrder: Order = {
      receptionNumber: currentOrderNumber,
      clientCIF: client.cif,
      clientName: client.name,
      products: productLines,
      status: previousOrderData.status, 
      orderNumber: previousOrderData.orderNumber,
      provider: previousOrderData.provider,
      createdAt: new Date().toISOString(),
    };

    try {
      const response = await fetch('https://automation.whitelabel.lat/webhook/order-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          previousOrder: previousOrderData,
          updatedOrder: updatedOrder,
        }),
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: response.statusText || 'Error desconocido del webhook' };
        }
        console.error("Webhook error response:", errorData);
        throw new Error(`Error del Webhook (${response.status}): ${errorData.message}`);
      }
      
      toast({
        title: "Pedido Actualizado",
        description: `El pedido #${currentOrderNumber} se ha enviado para actualización vía webhook.`,
        variant: "default"
      });
      clearOrder();
      setPreviousOrderData(null);
      navigate('/');
    } catch (error: any) {
      console.error('Error actualizando pedido vía webhook:', error);
      toast({
        title: "Error al Actualizar",
        description: error.message || "No se pudo enviar la actualización del pedido.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    clearOrder();
    setPreviousOrderData(null);
    navigate('/');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Actualizar Pedido</h1>
        <Button variant="outline" size="sm" onClick={handleCancel}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Volver
        </Button>
      </div>

      {!isEditMode ? (
        <Card>
          <CardHeader>
            <CardTitle>Buscar Pedido</CardTitle>
            <CardDescription>
              Introduzca el CIF del cliente y el número de recepción para buscar el pedido y obtener los datos más recientes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="cif">CIF del Cliente</Label>
              <Input 
                id="cif" 
                value={cif} 
                onChange={(e) => setCif(e.target.value.toUpperCase())}
                placeholder="Ej: B12345678"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="receptionNumberInput">Número de Recepción</Label>
              <Input 
                id="receptionNumberInput" 
                value={receptionNumberInput} 
                onChange={(e) => setReceptionNumberInput(e.target.value.toUpperCase())}
                placeholder="Ej: REC-123456"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full flex items-center gap-2"
              onClick={handleSearch}
              disabled={isSearching}
            >
              {isSearching ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Buscando...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" /> Buscar Pedido
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detalles del Cliente</CardTitle>
              <CardDescription>
                Información del cliente para el pedido #{currentOrderNumber}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {client && (
                <div className="grid gap-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">CIF</Label>
                      <p className="font-medium">{client.cif}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Nombre</Label>
                      <p className="font-medium">{client.name}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Productos</CardTitle>
              <CardDescription>
                Modifique los productos del pedido
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProductLinesManager />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumen del Pedido</CardTitle>
              <CardDescription>
                Revise los cambios antes de guardar. Los cambios se enviarán al webhook.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OrderSummary />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" /> Guardar Cambios
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      <AlertDialog open={showStatusInfoModal} onOpenChange={setShowStatusInfoModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center space-x-2">
              <Info className="h-6 w-6 text-blue-500" />
              <AlertDialogTitle>Pedido No Modificable</AlertDialogTitle>
            </div>
          </AlertDialogHeader>
          <AlertDialogDescription>
            El pedido #{statusInfoModalOrderNumber} ya ha sido procesado o se encuentra en un estado que no permite modificaciones. 
            Para cualquier cambio, por favor, solicite un nuevo pedido o comuníquese con servicio al cliente.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowStatusInfoModal(false)}>
              Aceptar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UpdateOrderPage;
