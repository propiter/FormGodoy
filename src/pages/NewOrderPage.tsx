import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useOrder } from '@/context/OrderContext';
import ClientSearch from '@/components/order/ClientSearch';
import ProductLinesManager from '@/components/order/ProductLinesManager';
import OrderSummary from '@/components/order/OrderSummary';
import { ArrowLeft, Save } from 'lucide-react';
import { Step, Stepper } from '@/components/ui/stepper';
import { Separator } from '@/components/ui/separator';

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
    <div className="space-y-8 py-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Nuevo Pedido</h1>
        <Button variant="outline" size="sm" onClick={handleCancel} className="flex items-center gap-2 rounded-md">
          <ArrowLeft className="h-4 w-4" /> Cancelar
        </Button>
      </div>

      <Separator className="my-6" />

      <Stepper currentStep={currentStep} className="mb-8 w-full">
        <Step title="Cliente" description="Buscar cliente por CIF" />
        <Step title="Productos" description="Añadir productos al pedido" />
        <Step title="Confirmar" description="Revisar y guardar pedido" />
      </Stepper>

      {currentStep === 0 && (
        <Card className="w-full max-w-3xl mx-auto shadow-lg rounded-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-semibold text-primary">Datos del Cliente</CardTitle>
            <CardDescription className="text-muted-foreground">
              Introduzca el CIF del cliente para buscar sus datos automáticamente.
            </CardDescription>
          </CardHeader>
          <CardContent className="py-6">
            <ClientSearch />
          </CardContent>
          <CardFooter className="flex justify-between pt-4 border-t border-border">
            <Button variant="outline" onClick={handleCancel} className="rounded-md">
              Cancelar
            </Button>
            <Button 
              onClick={handleNext} 
              disabled={!client}
              className="rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Continuar
            </Button>
          </CardFooter>
        </Card>
      )}

      {currentStep === 1 && (
        <Card className="w-full max-w-5xl mx-auto shadow-lg rounded-lg">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-2xl font-semibold text-primary">Productos</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Añada los productos que desea incluir en el pedido.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="py-6">
            <ProductLinesManager />
          </CardContent>
          <CardFooter className="flex justify-between pt-4 border-t border-border">
            <Button variant="outline" onClick={handlePrevious} className="rounded-md">
              Atrás
            </Button>
            <Button 
              onClick={handleNext} 
              disabled={productLines.length === 0}
              className="rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Continuar
            </Button>
          </CardFooter>
        </Card>
      )}

      {currentStep === 2 && (
        <Card className="w-full max-w-4xl mx-auto shadow-lg rounded-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-semibold text-primary">Confirmar Pedido</CardTitle>
            <CardDescription className="text-muted-foreground">
              Revise los detalles del pedido antes de enviar, una vez enviado solo se podra modificar dentro de las 4 horas siguientes.
            </CardDescription>
          </CardHeader>
          <CardContent className="py-6">
            <OrderSummary />
          </CardContent>
          <CardFooter className="flex justify-between pt-4 border-t border-border">
            <Button variant="outline" onClick={handlePrevious} className="rounded-md">
              Atrás
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-md bg-success text-success-foreground hover:bg-success/90"
            >
              {isSubmitting ? 'Guardando...' : (
                <>
                  <Save className="h-4 w-4" /> Enviar Pedido
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
