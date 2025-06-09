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
import CategorySelector from './CategorySelector'; // Import CategorySelector

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
  const { products, palets, cajas, categories } = useData(); // Get categories from context
  
  // Local state for form fields
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedPalet, setSelectedPalet] = useState<Palet | null>(null);
  const [paletQuantity, setPaletQuantity] = useState(1);
  const [selectedCaja, setSelectedCaja] = useState<Caja | null>(null);
  const [cajaQuantity, setCajaQuantity] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null); // State for selected category
  
  // Form validation
  const [errors, setErrors] = useState({
    product: false,
    palet: false,
    paletQuantity: false,
    caja: false,
    cajaQuantity: false
  });

  // Filtered products based on selected category
  const filteredProducts = selectedCategory
    ? products.filter(p => p.category === selectedCategory)
    : products;

  // Handle palet quantity input changes
  const handlePaletQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 0) {
      setPaletQuantity(value);
      setErrors(prev => ({ ...prev, paletQuantity: false }));
    }
  };

  // Handle caja quantity input changes
  const handleCajaQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 0) {
      setCajaQuantity(value);
      setErrors(prev => ({ ...prev, cajaQuantity: false }));
    }
  };

  // Reset form when initialValues change
  useEffect(() => {
    if (initialValues) {
      setSelectedProduct(initialValues.product);
      setSelectedPalet(initialValues.palet);
      setPaletQuantity(initialValues.paletQuantity);
      setSelectedCaja(initialValues.caja);
      setCajaQuantity(initialValues.cajaQuantity);
      setSelectedCategory(initialValues.product.category || null); // Set initial category if available
    } else {
      // Clear product selection if category changes and current product is not in new category
      if (selectedProduct && selectedCategory && selectedProduct.category !== selectedCategory) {
        setSelectedProduct(null);
      }
    }
  }, [initialValues, selectedCategory, selectedProduct]);

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
      paletQuantity: paletQuantity,
      caja: selectedCaja,
      cajaQuantity: cajaQuantity
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
          setSelectedProduct(null); // Clear product selection when category changes
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
            min="0"
            value={paletQuantity}
            onChange={handlePaletQuantityChange}
            placeholder="0"
            className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-white border-gray-300 focus:ring-2 focus:ring-primary/50 ${
              errors.paletQuantity ? 'border-destructive' : ''
            }`}
          />
          {errors.paletQuantity && (
            <p className="text-xs text-destructive">Ingrese la cantidad de palets</p>
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
            min="0"
            value={cajaQuantity}
            onChange={handleCajaQuantityChange}
            placeholder="0"
            className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-white border-gray-300 focus:ring-2 focus:ring-primary/50 ${
              errors.cajaQuantity ? 'border-destructive' : ''
            }`}
          />
          {errors.cajaQuantity && (
            <p className="text-xs text-destructive">Ingrese la cantidad de cajas</p>
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
