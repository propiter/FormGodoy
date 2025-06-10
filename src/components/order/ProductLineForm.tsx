import { useState, useEffect } from 'react';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ProductLine, Product, Palet, Caja } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CategorySelector from './CategorySelector';

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
  const { products, palets, cajas, categories } = useData();
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedPalet, setSelectedPalet] = useState<Palet | null>(null);
  const [paletQuantity, setPaletQuantity] = useState<string | number>(initialValues?.paletQuantity ?? 1);
  const [selectedCaja, setSelectedCaja] = useState<Caja | null>(null);
  const [cajaQuantity, setCajaQuantity] = useState<string | number>(initialValues?.cajaQuantity ?? 1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const [errors, setErrors] = useState({
    product: false,
    palet: false,
    paletQuantity: false,
    caja: false,
    cajaQuantity: false
  });

  const filteredProducts = selectedCategory
    ? products.filter(p => p.category === selectedCategory)
    : products;

  const handlePaletQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue === '') {
      setPaletQuantity('');
      setErrors(prev => ({ ...prev, paletQuantity: true })); // Assuming empty is invalid
    } else {
      const numValue = parseInt(inputValue, 10);
      if (!isNaN(numValue) && numValue >= 0) {
        setPaletQuantity(numValue);
        setErrors(prev => ({ ...prev, paletQuantity: numValue < 1 }));
      }
    }
  };

  const handleCajaQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue === '') {
      setCajaQuantity('');
      setErrors(prev => ({ ...prev, cajaQuantity: true })); // Assuming empty is invalid
    } else {
      const numValue = parseInt(inputValue, 10);
      if (!isNaN(numValue) && numValue >= 0) {
        setCajaQuantity(numValue);
        setErrors(prev => ({ ...prev, cajaQuantity: numValue < 1 }));
      }
    }
  };

  useEffect(() => {
    if (initialValues) {
      setSelectedProduct(initialValues.product);
      setSelectedPalet(initialValues.palet);
      setPaletQuantity(initialValues.paletQuantity);
      setSelectedCaja(initialValues.caja);
      setCajaQuantity(initialValues.cajaQuantity);
      setSelectedCategory(initialValues.product.category || null);
    } else {
      // Reset to defaults if not editing (e.g. for a new item after submission)
      // This part depends on how the form is reset externally.
      // For now, initial useState handles new item defaults.
      // If category changes, clear product selection
      if (selectedProduct && selectedCategory && selectedProduct.category !== selectedCategory) {
        setSelectedProduct(null);
      }
    }
  }, [initialValues, selectedCategory, selectedProduct]);

  const validate = (): boolean => {
    const currentPaletQuantity = paletQuantity === '' ? 0 : Number(paletQuantity);
    const currentCajaQuantity = cajaQuantity === '' ? 0 : Number(cajaQuantity);

    const newErrors = {
      product: !selectedProduct,
      palet: !selectedPalet,
      paletQuantity: currentPaletQuantity < 1,
      caja: !selectedCaja,
      cajaQuantity: currentCajaQuantity < 1
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
      paletQuantity: paletQuantity === '' ? 0 : Number(paletQuantity),
      caja: selectedCaja,
      cajaQuantity: cajaQuantity === '' ? 0 : Number(cajaQuantity)
    };
    
    onSubmit(productLine);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <CategorySelector
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={(category) => {
          setSelectedCategory(category);
          setSelectedProduct(null); 
        }}
      />

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
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-products" disabled>
                  No hay productos en esta categoría
                </SelectItem>
              )}
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
          <input
            id="paletQuantity"
            type="number"
            min="0" // min="0" allows 0, validation ensures >= 1 if needed
            value={paletQuantity}
            onChange={handlePaletQuantityChange}
            placeholder="0"
            className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 focus:ring-2 focus:ring-primary/50 ${
              errors.paletQuantity ? 'border-destructive' : ''
            }`}
          />
          {errors.paletQuantity && (
            <p className="text-xs text-destructive">Ingrese la cantidad de palets (mínimo 1)</p>
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
          <input
            id="cajaQuantity"
            type="number"
            min="0" // min="0" allows 0, validation ensures >= 1 if needed
            value={cajaQuantity}
            onChange={handleCajaQuantityChange}
            placeholder="0"
            className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 focus:ring-2 focus:ring-primary/50 ${
              errors.cajaQuantity ? 'border-destructive' : ''
            }`}
          />
          {errors.cajaQuantity && (
            <p className="text-xs text-destructive">Ingrese la cantidad de cajas (mínimo 1)</p>
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
