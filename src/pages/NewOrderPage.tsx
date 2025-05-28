import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useOrder } from '@/context/OrderContext';
import ClientSearch from '@/components/order/ClientSearch';
import ProductLinesManager from '@/components/order/ProductLinesManager';
import OrderSummary from '@/components/order/OrderSummary';
import { ArrowLeft, Save, Plus } from 'lucide-react';
import { Step, Stepper } from '@/components/ui/stepper';

const NewOrderPage = () => {
  const navigate = useNavigate();
  const { client, productLines, submitOrder, clearOrder } = useOrder();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = () => {
    if (currentStep === 0 && !client) return;
    if (currentStep === 1 && productLines.length === 0) return;
    setCurrentStep(prev => prev + 1);
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await submitOrder();
      navigate('/');
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
        <h1 className="text-2xl font-bold tracking-tight">Nuevo Pedido</h1>
        <Button variant="outline" size="sm" onClick={handleCancel}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Cancelar
        </Button>
      </div>

      <Stepper currentStep={currentStep} className="mb-8">
        <Step title="Cliente" description="Buscar cliente por CIF" />
        <Step title="Productos" description="Añadir productos al pedido" />
        <Step title="Confirmar" description="Revisar y guardar pedido" />
      </Stepper>

      {currentStep === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Datos del Cliente</CardTitle>
            <CardDescription>
              Introduzca el CIF del cliente para buscar sus datos automáticamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ClientSearch />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button 
              onClick={handleNext} 
              disabled={!client}
            >
              Continuar
            </Button>
          </CardFooter>
        </Card>
      )}

      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Productos</CardTitle>
                <CardDescription>
                  Añada los productos que desea incluir en el pedido
                </CardDescription>
              </div>
              <Button size="sm" variant="outline" className="flex items-center gap-1">
                <Plus className="h-4 w-4" /> Añadir Producto
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ProductLinesManager />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handlePrevious}>
              Atrás
            </Button>
            <Button 
              onClick={handleNext} 
              disabled={productLines.length === 0}
            >
              Continuar
            </Button>
          </CardFooter>
        </Card>
      )}

      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Confirmar Pedido</CardTitle>
            <CardDescription>
              Revise los detalles del pedido antes de guardar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OrderSummary />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handlePrevious}>
              Atrás
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting ? 'Guardando...' : (
                <>
                  <Save className="h-4 w-4" /> Guardar Pedido
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default NewOrderPage;