import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useOrder } from '@/context/OrderContext';
import { useData } from '@/context/DataContext';
import ProductLinesManager from '@/components/order/ProductLinesManager';
import OrderSummary from '@/components/order/OrderSummary';
import { ArrowLeft, Search, Save } from 'lucide-react';

const UpdateOrderPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getOrderByNumber } = useData();
  const { client, isEditMode, startEditOrder, updateExistingOrder, clearOrder } = useOrder();
  
  const [cif, setCif] = useState('');
  const [receptionNumber, setReceptionNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSearch = () => {
    const cleanCif = cif.trim().toUpperCase();
    const cleanReceptionNumber = receptionNumber.trim().toUpperCase();
    
    if (!cleanCif || !cleanReceptionNumber) {
      toast({
        title: "Campos incompletos",
        description: "Por favor, introduce el CIF y el número de recepción",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const order = getOrderByNumber(cleanReceptionNumber);
      
      console.log('Resultado de búsqueda:', {
        buscado: cleanReceptionNumber,
        tipoBuscado: typeof cleanReceptionNumber,
        orderEncontrado: order,
        orderCIF: order?.clientCIF,
        inputCIF: cleanCif
      });

      if (!order) {
        console.error('Pedido no encontrado. Valores buscados:', {
          receptionNumber: cleanReceptionNumber,
          tipo: typeof cleanReceptionNumber
        });
        toast({
          title: "Pedido no encontrado",
          description: `No se encontró el pedido "${cleanReceptionNumber}"`,
          variant: "destructive"
        });
        return;
      }

      // Comparación estricta incluyendo tipo de dato
      if (String(order.clientCIF).toUpperCase() !== cleanCif) {
        console.error('Discrepancia en CIF:', {
          cifPedido: order.clientCIF,
          tipoCifPedido: typeof order.clientCIF,
          cifInput: cleanCif,
          tipoCifInput: typeof cleanCif
        });
        toast({
          title: "CIF incorrecto",
          description: `El CIF del pedido es ${order.clientCIF} (tipo: ${typeof order.clientCIF})`,
          variant: "destructive"
        });
        return;
      }

      startEditOrder(order);
    } catch (error) {
      console.error('Error buscando pedido:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al buscar el pedido",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await updateExistingOrder();
      toast({
        title: "Pedido actualizado",
        description: "Los cambios se guardaron correctamente",
        variant: "default"
      });
      navigate('/');
    } catch (error) {
      console.error('Error actualizando pedido:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el pedido",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    clearOrder();
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
              Introduzca el CIF del cliente y el número de recepción para buscar el pedido
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="cif">CIF del Cliente</Label>
              <Input 
                id="cif" 
                value={cif} 
                onChange={(e) => setCif(e.target.value)}
                placeholder="Ej: B12345678"
                className="placeholder:text-muted-foreground/50" 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="receptionNumber">Número de Recepción</Label>
              <Input 
                id="receptionNumber" 
                value={receptionNumber} 
                onChange={(e) => setReceptionNumber(e.target.value)}
                placeholder="Ej: REC-123456"
                className="placeholder:text-muted-foreground/50" 
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full flex items-center gap-2"
              onClick={handleSearch}
            >
              <Search className="h-4 w-4" /> Buscar Pedido
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detalles del Cliente</CardTitle>
              <CardDescription>
                Información del cliente para el pedido #{receptionNumber}
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
                Revise los cambios antes de guardar
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
                {isSubmitting ? 'Guardando...' : (
                  <>
                    <Save className="h-4 w-4" /> Enviar Cambios
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
};

export default UpdateOrderPage;