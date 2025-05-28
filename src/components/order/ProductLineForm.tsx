import { useState, useEffect, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Combobox } from '@/components/ui/combobox';
import { ProductLine, Product, Palet, Caja } from '@/types';
import { useDebounce } from '@/hooks/use-debounce';

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
  console.log('[ProductLineForm] Initializing with products:', products, 'palets:', palets, 'cajas:', cajas);
  
  // Local state for form fields
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedPalet, setSelectedPalet] = useState<Palet | null>(null);
  const [paletQuantity, setPaletQuantity] = useState(1);
  const [selectedCaja, setSelectedCaja] = useState<Caja | null>(null);
  const [cajaQuantity, setCajaQuantity] = useState(1);
  
  // Search state
  const [productSearch, setProductSearch] = useState('');
  const debouncedSearch = useDebounce(productSearch, 300);
  
  // Filtered products based on search
  const filteredProducts = useMemo(() => {
    if (!debouncedSearch) return products;
    const searchTerm = debouncedSearch.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm)
    );
  }, [debouncedSearch, products]);

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

  const handleProductSelect = (id: string) => {
    const product = products.find(p => p.id === id);
    console.log('[ProductLineForm] Selected product:', product);
    if (product) {
      setSelectedProduct(product);
      setErrors(prev => ({ ...prev, product: false }));
    }
  };

  const handlePaletSelect = (id: string) => {
    const palet = palets.find(p => p.id === id);
    console.log('[ProductLineForm] Selected palet:', palet);
    if (palet) {
      setSelectedPalet(palet);
      setErrors(prev => ({ ...prev, palet: false }));
    }
  };

  const handleCajaSelect = (id: string) => {
    const caja = cajas.find(c => c.id === id);
    console.log('[ProductLineForm] Selected caja:', caja);
    if (caja) {
      setSelectedCaja(caja);
      setErrors(prev => ({ ...prev, caja: false }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('[ProductLineForm] Submitting with:', {
      product: selectedProduct,
      palet: selectedPalet,
      paletQuantity,
      caja: selectedCaja,
      cajaQuantity
    });
    
    if (!validate() || !selectedProduct || !selectedPalet || !selectedCaja) return;
    
    const productLine: ProductLine = {
      product: selectedProduct,
      palet: selectedPalet,
      paletQuantity,
      caja: selectedCaja,
      cajaQuantity
    };
    
    try {
      const result = await onSubmit(productLine);
      console.log('[ProductLineForm] Submit successful:', result);
    } catch (error) {
      console.error('[ProductLineForm] Submit failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="product">
            Producto <span className="text-destructive">*</span>
          </Label>
          <Combobox
            id="product"
            value={selectedProduct?.id || ''}
            onChange={handleProductSelect}
            onSearch={setProductSearch}
            items={filteredProducts.map(p => ({
              value: p.id,
              label: p.name
            }))}
            placeholder="Buscar producto..."
            searchPlaceholder="Escriba para buscar..."
            emptyText="No se encontraron productos"
            error={errors.product}
          />
          {errors.product && (
            <p className="text-xs text-destructive">Seleccione un producto</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="palet">
            Palet <span className="text-destructive">*</span>
          </Label>
          <Combobox
            id="palet"
            value={selectedPalet?.id || ''}
            onChange={handlePaletSelect}
            items={palets.map(p => ({
              value: p.id,
              label: p.name
            }))}
            placeholder="Seleccionar palet..."
            emptyText="No se encontraron palets"
            error={errors.palet}
          />
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
          <Combobox
            id="caja"
            value={selectedCaja?.id || ''}
            onChange={handleCajaSelect}
            items={cajas.map(c => ({
              value: c.id,
              label: c.name
            }))}
            placeholder="Seleccionar caja..."
            emptyText="No se encontraron cajas"
            error={errors.caja}
          />
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