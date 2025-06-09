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
    setIsAdding(false);
    toast({
      title: "Producto añadido",
      description: `${productLine.product.name} añadido al pedido.`
    });
  };

  const handleUpdate = (productLine: ProductLine) => {
    if (editingIndex !== null) {
      updateProductLine(editingIndex, productLine);
      setEditingIndex(null);
      toast({
        title: "Producto actualizado",
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
      title: "Producto eliminado",
      description: `${productName} eliminado del pedido.`
    });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingIndex(null);
  };

  return (
    <div className="space-y-6">
      {productLines.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground px-2">
            <div className="col-span-4">Producto</div>
            <div className="col-span-2">Palet</div>
            <div className="col-span-1">Cant.</div>
            <div className="col-span-2">Caja</div>
            <div className="col-span-1">Cant.</div>
            <div className="col-span-2 hidden md:block">Acciones</div>
          </div>
          
          {productLines.map((line, index) => (
            <div key={index} className={`p-3 rounded-md border ${editingIndex === index ? 'bg-muted/50 border-primary/50' : ''}`}>
              {editingIndex === index ? (
                <ProductLineForm 
                  initialValues={line}
                  onSubmit={handleUpdate}
                  onCancel={handleCancel}
                  isEditing={true}
                />
              ) : (
                <div className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-4">
                    <p className="font-medium">{line.product.name}</p>
                  </div>
                  <div className="col-span-2 truncate">{line.palet.name}</div>
                  <div className="col-span-1">{line.paletQuantity}</div>
                  <div className="col-span-2 truncate">{line.caja.name}</div>
                  <div className="col-span-1">{line.cajaQuantity}</div>
                  {/* Acciones en escritorio y tablet */}
<div className="col-span-2 hidden md:flex space-x-2 justify-end">
  <Button size="sm" variant="outline" onClick={() => handleEdit(index)}>
    <Pencil className="h-4 w-4" />
  </Button>
  <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleDelete(index)}>
    <Trash2 className="h-4 w-4" />
  </Button>
</div>

{/* Acciones en móvil debajo */}
<div className="col-span-12 md:hidden mt-2 flex justify-end space-x-2">
  <Button size="sm" variant="outline" onClick={() => handleEdit(index)}>
    <Pencil className="h-4 w-4" />
  </Button>
  <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleDelete(index)}>
    <Trash2 className="h-4 w-4" />
  </Button>
</div>

                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {isAdding ? (
        <div className="border rounded-md p-4 bg-muted/30">
          <h3 className="font-medium mb-4">Añadir Producto</h3>
          <ProductLineForm 
            onSubmit={handleAdd}
            onCancel={handleCancel}
          />
        </div>
      ) : (
        <Button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2"
          variant={productLines.length === 0 ? "default" : "outline"}
        >
          <Plus className="h-4 w-4" /> Añadir Producto
        </Button>
      )}
    </div>
  );
};

export default ProductLinesManager;