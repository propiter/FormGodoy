import { Button } from '@/components/ui/button';
import { Printer, Download } from 'lucide-react';
import { useOrder } from '@/context/OrderContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface OrderReceiptProps {
  orderNumber: string;
  onClose: () => void;
}

export function OrderReceipt({ orderNumber, onClose }: OrderReceiptProps) {
  const { client, productLines } = useOrder();
  
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Esta función se encargará de generar un PDF en el futuro
    // Por ahora, solo imprimimos
    window.print();
  };

  return (
    <div className="bg-white p-8 rounded-lg max-w-3xl mx-auto print:p-0 print:max-w-none print:shadow-none">
      {/* Controles de impresión (no se muestran al imprimir) */}
      <div className="flex justify-end gap-4 mb-8 print:hidden">
        <Button variant="outline" onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          Descargar PDF
        </Button>
        <Button onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Imprimir Comprobante
        </Button>
      </div>

      {/* Contenido del comprobante */}
      <div className="border border-gray-200 p-8 print:border-0">
        {/* Encabezado */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold">Comprobante de Pedido</h1>
            <p className="text-muted-foreground">Número: {orderNumber}</p>
            <p className="text-muted-foreground">
              Fecha: {format(new Date(), "PPP", { locale: es })}
            </p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-semibold">Godoy Hortalizas</h2>
            <p className="text-sm text-muted-foreground">
              CIF: B04752614<br />
              Dirección: Paraje Lote de los Rodriguez, 04711 El Ejido, Almería<br />
              Teléfono:  950 338 666
            </p>
          </div>
        </div>

        {/* Información del Cliente */}
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Datos del Cliente</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-medium">Razón Social</p>
              <p className="text-muted-foreground">{client?.name || 'No especificado'}</p>
            </div>
            <div>
              <p className="font-medium">CIF/NIF</p>
              <p className="text-muted-foreground">{client?.cif || 'No especificado'}</p>
            </div>
            <div>
              <p className="font-medium">Dirección</p>
              <p className="text-muted-foreground">{client?.address || 'No especificada'}</p>
            </div>
            <div>
              <p className="font-medium">Teléfono</p>
              <p className="text-muted-foreground">{client?.phone || 'No especificado'}</p>
            </div>
          </div>
        </div>

        {/* Detalles del Pedido */}
        <div className="mb-8">
          <h3 className="font-semibold mb-4">Detalles del Pedido</h3>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase">Producto</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-500 uppercase">Cant. Palets</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-500 uppercase">Cant. Cajas</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-500 uppercase">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {productLines.map((line, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{line.product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {line.palet.name}: {line.paletQuantity}, {line.caja.name}: {line.cajaQuantity}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">{line.paletQuantity}</td>
                    <td className="px-4 py-3 text-right">{line.cajaQuantity}</td>
                    <td className="px-4 py-3 text-right font-medium">
                      {line.paletQuantity} {line.paletQuantity === 1 ? 'palet' : 'palets'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={2} className="px-4 py-3 text-right font-medium">Total:</td>
                  <td colSpan={2} className="px-4 py-3 text-right font-bold">
                    {productLines.reduce((total, line) => total + line.paletQuantity, 0)} palets
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Notas */}
        <div className="mt-8 pt-4 border-t border-gray-200">
          <h3 className="font-semibold mb-2">Notas</h3>
          <p className="text-sm text-muted-foreground">
            Este comprobante es válido como documento justificativo de su pedido.
            Para cualquier incidencia, por favor, proporcione el número de pedido.
          </p>
        </div>
      </div>

      {/* Botón de cierre (solo visible en pantalla) */}
      <div className="mt-8 flex justify-end print:hidden">
        <Button onClick={onClose}>
          Cerrar Comprobante
        </Button>
      </div>
    </div>
  );
}
