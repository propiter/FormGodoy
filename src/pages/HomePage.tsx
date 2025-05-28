import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Package, Edit, PlusCircle, BarChart3 } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          Sistema de Gestión de Pedidos
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Una solución completa para la gestión de recepciones de productos, con búsqueda 
          eficiente e integración con Google Sheets.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pt-6">
        <Card className="transition-all duration-300 hover:shadow-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-primary" />
              <CardTitle>Nuevo Pedido</CardTitle>
            </div>
            <CardDescription>
              Crea un nuevo pedido con múltiples productos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Busca clientes por CIF, selecciona productos, palets y cajas, y guarda el pedido en Google Sheets.
            </p>
          </CardContent>
          <CardFooter>
            <Link to="/new-order" className="w-full">
              <Button className="w-full">
                Crear Pedido
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-primary" />
              <CardTitle>Actualizar Pedido</CardTitle>
            </div>
            <CardDescription>
              Modifica un pedido existente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Busca un pedido por número de recepción y CIF del cliente, y actualiza sus detalles.
            </p>
          </CardContent>
          <CardFooter>
            <Link to="/update-order" className="w-full">
              <Button className="w-full" variant="outline">
                Actualizar Pedido
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <CardTitle>Gestión de Productos</CardTitle>
            </div>
            <CardDescription>
              Administra el catálogo de productos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Próximamente: Visualiza, añade y modifica productos, palets y cajas en el sistema.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" disabled variant="outline">
              Próximamente
            </Button>
          </CardFooter>
        </Card>

        <Card className="md:col-span-2 lg:col-span-3 transition-all duration-300 hover:shadow-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <CardTitle>Instrucciones de Uso</CardTitle>
            </div>
            <CardDescription>
              Cómo utilizar el sistema de gestión de pedidos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">1. Crear un Nuevo Pedido</h3>
                <p className="text-sm text-muted-foreground">
                  Ingresa el CIF del cliente, busca y añade productos, selecciona palets y cajas, y guarda el pedido.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium">2. Actualizar un Pedido Existente</h3>
                <p className="text-sm text-muted-foreground">
                  Ingresa el CIF y número de recepción, modifica los productos o cantidades, y guarda los cambios.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium">3. Búsqueda Eficiente</h3>
                <p className="text-sm text-muted-foreground">
                  Utiliza los campos de búsqueda para encontrar rápidamente clientes, productos, palets y cajas entre cientos de opciones.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;