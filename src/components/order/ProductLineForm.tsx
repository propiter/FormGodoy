import { useState, useEffect } from 'react';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProductLine, Product, Palet, Caja } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductLineFormProps {
  initialValues?: ProductLine;
  onSubmit: (productLine: ProductLine) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const ProductLineForm = ({ 
  initialValues,
  onSubmit, 
  onCancel,
  isEditing = false
}: ProductLineFormProps) => {
  const { products, palets, cajas } = useData();
  
  // Local state for form fields
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedPalet, setSelectedPalet] = useState<Palet | null>(null);
  const [paletQuantity, setPaletQuantity] = useState(1);
  const [selectedCaja, setSelectedCaja] = useState<Caja | null>(null);
  const [cajaQuantity, setCajaQuantity] = useState(1);
  
  // Form validation
  const [errors, setErrors] = useState({
    product: false,
    palet: false,
    paletQuantity: false,
    caja: false,
    cajaQuantity: false
  });

  // Reset form when initialValues change
  useEffect(() => {
    if (initialValues) {
      setSelectedProduct(initialValues.product);
      setSelectedPalet(initialValues.palet);
      setPaletQuantity(initialValues.paletQuantity);
      setSelectedCaja(initialValues.caja);
      setCajaQuantity(initialValues.cajaQuantity);
    }
  }, [initialValues]);

  const validate = (): boolean => {
    const newErrors = {
      product: !selectedProduct,
      palet: !selectedPalet,
      paletQuantity: paletQuantity < 1,
      caja: !selectedCaja,
      cajaQuantity: cajaQuantity < 1
    };
    
    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate() || !selectedProduct || !selectedPalet || !selectedCaja) return;
    
    const productLine: ProductLine = {
      product: selectedProduct,
      palet: selectedPalet,
      paletQuantity,
      caja: selectedCaja,
      cajaQuantity
    };
    
    onSubmit(productLine);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="product">
            Producto <span className="text-destructive">*</span>
          </Label>
          <Select
            value={selectedProduct?.id}
            onValueChange={(value) => {
              const product = products.find(p => p.id === value);
              if (product) setSelectedProduct(product);
              setErrors(prev => ({ ...prev, product: false }));
            }}
          >
            <SelectTrigger className={errors.product ? "border-destructive" : ""}>
              <SelectValue placeholder="Seleccionar producto" />
            </SelectTrigger>
            <SelectContent>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.product && (
            <p className="text-xs text-destructive">Seleccione un producto</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="palet">
            Palet <span className="text-destructive">*</span>
          </Label>
          <Select
            value={selectedPalet?.id}
            onValueChange={(value) => {
              const palet = palets.find(p => p.id === value);
              if (palet) setSelectedPalet(palet);
              setErrors(prev => ({ ...prev, palet: false }));
            }}
          >
            <SelectTrigger className={errors.palet ? "border-destructive" : ""}>
              <SelectValue placeholder="Seleccionar palet" />
            </SelectTrigger>
            <SelectContent>
              {palets.map((palet) => (
                <SelectItem key={palet.id} value={palet.id}>
                  {palet.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.palet && (
            <p className="text-xs text-destructive">Seleccione un palet</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="paletQuantity">
            Cantidad de Palets <span className="text-destructive">*</span>
          </Label>
          <Input
            id="paletQuantity"
            type="number"
            min="1"
            value={paletQuantity}
            onChange={(e) => {
              setPaletQuantity(parseInt(e.target.value) || 0);
              setErrors(prev => ({ ...prev, paletQuantity: false }));
            }}
            className={errors.paletQuantity ? "border-destructive" : ""}
          />
          {errors.paletQuantity && (
            <p className="text-xs text-destructive">La cantidad debe ser al menos 1</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="caja">
            Caja <span className="text-destructive">*</span>
          </Label>
          <Select
            value={selectedCaja?.id}
            onValueChange={(value) => {
              const caja = cajas.find(c => c.id === value);
              if (caja) setSelectedCaja(caja);
              setErrors(prev => ({ ...prev, caja: false }));
            }}
          >
            <SelectTrigger className={errors.caja ? "border-destructive" : ""}>
              <SelectValue placeholder="Seleccionar caja" />
            </SelectTrigger>
            <SelectContent>
              {cajas.map((caja) => (
                <SelectItem key={caja.id} value={caja.id}>
                  {caja.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.caja && (
            <p className="text-xs text-destructive">Seleccione una caja</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cajaQuantity">
            Cantidad de Cajas <span className="text-destructive">*</span>
          </Label>
          <Input
            id="cajaQuantity"
            type="number"
            min="1"
            value={cajaQuantity}
            onChange={(e) => {
              setCajaQuantity(parseInt(e.target.value) || 0);
              setErrors(prev => ({ ...prev, cajaQuantity: false }));
            }}
            className={errors.cajaQuantity ? "border-destructive" : ""}
          />
          {errors.cajaQuantity && (
            <p className="text-xs text-destructive">La cantidad debe ser al menos 1</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {isEditing ? 'Actualizar' : 'Añadir'} Producto
        </Button>
      </div>
    </form>
  );
};

export default ProductLineForm;