import { Button } from '@/components/ui/button';
import { CheckCircle, Copy, X } from 'lucide-react';
import { useState } from 'react';
import { OrderReceipt } from './OrderReceipt';

export function OrderConfirmationModal({ orderNumber, onClose }: { orderNumber: string; onClose: () => void }) {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(orderNumber);
  };

  const [showReceipt, setShowReceipt] = useState(false);

  if (showReceipt) {
    return <OrderReceipt orderNumber={orderNumber} onClose={() => setShowReceipt(false)} />;
  }

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg max-w-md w-full mx-4 shadow-xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5" />
        </button>
        
        <div className="text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">¡Pedido Creado!</h2>
            <p className="text-gray-600 dark:text-gray-300">Tu número de pedido es:</p>
          </div>
          
          <div className="relative">
            <div className="text-2xl font-mono font-bold bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-between">
              <span className="text-gray-900 dark:text-white">{orderNumber}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={copyToClipboard}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
                aria-label="Copiar número de pedido"
              >
                <Copy className="h-5 w-5" />
              </Button>
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Guarda este número para futuras referencias
            </p>
          </div>
          
          <div className="space-y-3 pt-2">
            {/*<Button 
              onClick={() => setShowReceipt(true)}
              variant="outline"
              className="w-full"
              size="lg"

            >
              <FileText className="mr-2 h-5 w-5" />
              Ver Comprobante
            </Button>*/}
            <Button 
              onClick={onClose}
              className="w-full bg-primary hover:bg-primary/90 dark:bg-primary/90 dark:hover:bg-primary"
              size="lg"
            >
              Finalizar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
