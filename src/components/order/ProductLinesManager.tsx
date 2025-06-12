import { useState } from 'react';
import { useOrder } from '@/context/OrderContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Pencil } from 'lucide-react';
import ProductLineForm from './ProductLineForm';
import { ProductLine } from '@/types';

const ProductLinesManager = () => {
  const { productLines, addProductLine, updateProductLine, removeProductLine } = useOrder();
  const { toast } = useToast();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(productLines.length === 0);

  const handleAdd = (productLine: ProductLine) => {
    addProductLine(productLine);
    setIsAdding(false); // Cerrar el formulario de añadir después de agregar
    toast({
      title: "Línea de producto añadida",
      description: `${productLine.product.name} añadido al pedido.`
    });
  };

  const handleUpdate = (productLine: ProductLine) => {
    if (editingIndex !== null) {
      updateProductLine(editingIndex, productLine);
      setEditingIndex(null);
      toast({
        title: "Línea de producto actualizada",
        description: `${productLine.product.name} actualizado correctamente.`
      });
    }
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setIsAdding(false); 
  };

  const handleDelete = (index: number) => {
    const productName = productLines[index].product.name;
    removeProductLine(index);
    toast({
      title: "Línea de producto eliminada",
      description: `${productName} eliminado del pedido.`,
      variant: "destructive"
    });
    if (editingIndex === index) {
      setEditingIndex(null); 
    }
    if (productLines.length -1 === 0) { // Si se elimina la última línea
        setIsAdding(true); // Abrir el formulario para añadir una nueva
    }
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
  };
  
  const handleCancelEdit = () => {
    setEditingIndex(null);
  };


  return (
    <div className="space-y-6">
      {productLines.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">Líneas de Producto Agregadas</h3>
          {productLines.map((line, index) => (
            <div 
              key={index} 
              className={`rounded-lg border transition-all duration-200 ease-in-out ${
                editingIndex === index 
                ? 'bg-muted/60 border-primary shadow-lg ring-1 ring-primary/50' 
                : 'bg-card border-border hover:shadow-md'
              }`}
            >
              {editingIndex === index ? (
                <div className="p-4 sm:p-6">
                  <ProductLineForm 
                    initialValues={line}
                    onSubmit={handleUpdate}
                    onCancel={handleCancelEdit}
                    isEditing={true}
                  />
                </div>
              ) : (
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4">
                    <div className="flex-grow space-y-1.5">
                      <p className="text-base sm:text-lg font-semibold text-primary leading-tight">
                        {line.product.name}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        <span className="font-medium text-foreground/90">{line.palet.name}</span> × {line.paletQuantity}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        <span className="font-medium text-foreground/90">{line.caja.name}</span> × {line.cajaQuantity}
                      </p>
                    </div>
                    <div className="flex-shrink-0 flex items-start md:items-center gap-2 mt-2 md:mt-0 self-end md:self-start">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => handleEdit(index)}
                        className="h-8 w-8 sm:h-9 sm:w-9 text-muted-foreground hover:text-primary"
                        aria-label="Editar línea"
                      >
                        <Pencil className="h-4 w-4 sm:h-5 sm:w-5" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => handleDelete(index)}
                        className="h-8 w-8 sm:h-9 sm:w-9 text-destructive/80 hover:text-destructive"
                        aria-label="Eliminar línea"
                      >
                        <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {isAdding && (
        <div className="border rounded-lg p-4 sm:p-6 bg-muted/30 shadow">
          <h3 className="text-lg font-medium mb-4 text-foreground">Añadir Nueva Línea de Producto</h3>
          <ProductLineForm 
            onSubmit={handleAdd}
            onCancel={handleCancelAdd}
            isEditing={false}
          />
        </div>
      )}

      {!isAdding && productLines.length > 0 && ( // Solo mostrar si no se está añadiendo Y hay líneas
         <div className="pt-2">
            <Button 
            onClick={() => { setIsAdding(true); setEditingIndex(null); }}
            variant="outline"
            className="flex items-center gap-2 w-full sm:w-auto"
            >
            <Plus className="h-4 w-4" /> Añadir Otra Línea de Producto
            </Button>
         </div>
      )}
       {!isAdding && productLines.length === 0 && editingIndex === null && ( // Si no hay líneas y no se está editando, mostrar el botón de añadir como principal
         <div className="pt-2">
            <Button 
            onClick={() => { setIsAdding(true); setEditingIndex(null); }}
            variant="default"
            className="flex items-center gap-2 w-full sm:w-auto"
            >
            <Plus className="h-4 w-4" /> Añadir Línea de Producto
            </Button>
         </div>
      )}
    </div>
  );
};

export default ProductLinesManager;
