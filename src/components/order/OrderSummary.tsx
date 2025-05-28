import { useOrder } from '@/context/OrderContext';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Package, User } from 'lucide-react';

const OrderSummary = () => {
  const { client, productLines, currentOrderNumber } = useOrder();

  if (!client || productLines.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No hay información del pedido para mostrar.
      </div>
    );
  }

  const totalProducts = productLines.length;
  const totalPalets = productLines.reduce((sum, line) => sum + line.paletQuantity, 0);
  const totalCajas = productLines.reduce((sum, line) => sum + line.cajaQuantity, 0);

  return (
    <div className="space-y-4">
      {currentOrderNumber && (
        <div className="bg-muted p-3 rounded-md">
          <p className="text-sm font-medium">Número de Recepción: <span className="font-bold">{currentOrderNumber}</span></p>
        </div>
      )}

      <Card>
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <h3 className="font-medium">Datos del Cliente</h3>
          </div>
          <div className="grid grid-cols-2 gap-2 pl-6">
            <div>
              <p className="text-sm text-muted-foreground">CIF:</p>
              <p className="font-medium">{client.cif}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Nombre:</p>
              <p className="font-medium">{client.name}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            <h3 className="font-medium">Productos ({totalProducts})</h3>
          </div>
          
          <div className="space-y-3 pl-6">
            {productLines.map((line, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between">
                  <p className="font-medium">{line.product.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Palet:</span> {line.palet.name} × {line.paletQuantity}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Caja:</span> {line.caja.name} × {line.cajaQuantity}
                  </div>
                </div>
                {index < productLines.length - 1 && <Separator className="my-2" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="bg-muted rounded-md p-4">
        <h3 className="font-medium mb-2">Resumen del Pedido</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-2 bg-background rounded-md">
            <p className="text-xs text-muted-foreground">Total Productos</p>
            <p className="text-xl font-bold">{totalProducts}</p>
          </div>
          <div className="text-center p-2 bg-background rounded-md">
            <p className="text-xs text-muted-foreground">Total Palets</p>
            <p className="text-xl font-bold">{totalPalets}</p>
          </div>
          <div className="text-center p-2 bg-background rounded-md">
            <p className="text-xs text-muted-foreground">Total Cajas</p>
            <p className="text-xl font-bold">{totalCajas}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;