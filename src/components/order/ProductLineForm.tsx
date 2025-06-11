import { useState, useEffect } from 'react';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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
  const [paletQuantity, setPaletQuantity] = useState<string | number>(1);
  const [selectedCaja, setSelectedCaja] = useState<Caja | null>(null);
  const [cajaQuantity, setCajaQuantity] = useState<string | number>(1);
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

  useEffect(() => {
    // console.log('[ProductLineForm Init Effect]', { 
    //   hasInitialValues: !!initialValues,
    //   productsLength: products.length,
    //   paletsLength: palets.length,
    //   cajasLength: cajas.length 
    // });

    // if (initialValues) {
    //   console.log('[ProductLineForm Init Effect] initialValues.product.id:', initialValues.product.id);
    //   console.log('[ProductLineForm Init Effect] initialValues.product.category:', initialValues.product.category);
    //   console.log('[ProductLineForm Init Effect] initialValues.palet.id:', initialValues.palet.id);
    //   console.log('[ProductLineForm Init Effect] initialValues.caja.id:', initialValues.caja.id);
    // }
    
    if (initialValues && products.length > 0 && palets.length > 0 && cajas.length > 0) {
      // console.log('[ProductLineForm Init Effect] Data ready, processing initialValues.');
      const productToSet = products.find(p => p.id === initialValues.product.id) || null;
      // console.log('[ProductLineForm Init Effect] productToSet:', productToSet);
      setSelectedProduct(productToSet);
      
      const determinedCategory = productToSet?.category || initialValues.product.category || null;
      // console.log('[ProductLineForm Init Effect] determinedCategory:', determinedCategory);
      setSelectedCategory(determinedCategory);

      const paletToSet = palets.find(p => p.id === initialValues.palet.id) || null;
      // console.log('[ProductLineForm Init Effect] paletToSet:', paletToSet);
      setSelectedPalet(paletToSet);

      const cajaToSet = cajas.find(c => c.id === initialValues.caja.id) || null;
      // console.log('[ProductLineForm Init Effect] cajaToSet:', cajaToSet);
      setSelectedCaja(cajaToSet);
      
      setPaletQuantity(initialValues.paletQuantity);
      setCajaQuantity(initialValues.cajaQuantity);
      
      setErrors({
        product: !productToSet,
        palet: !paletToSet,
        paletQuantity: Number(initialValues.paletQuantity) < 1,
        caja: !cajaToSet,
        cajaQuantity: Number(initialValues.cajaQuantity) < 1,
      });

    } else if (!initialValues) { // Modo "Añadir Nueva Línea"
      setSelectedProduct(null);
      setSelectedPalet(null);
      setPaletQuantity(1);
      setSelectedCaja(null);
      setCajaQuantity(1);
      setSelectedCategory(null); 
      setErrors({ product: false, palet: false, paletQuantity: false, caja: false, cajaQuantity: false });
    }
  }, [initialValues, products, palets, cajas]);


  useEffect(() => {
    // Si la categoría cambia y había un producto seleccionado de una categoría diferente,
    // resetear el producto para forzar una nueva selección en la nueva categoría.
    if (selectedProduct && selectedCategory && selectedProduct.category !== selectedCategory) {
      setSelectedProduct(null);
      // No es necesario resetear errores aquí, la validación lo hará al intentar enviar o al cambiar el producto.
    }
  }, [selectedCategory, selectedProduct]);


  const handlePaletQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue === '') {
      setPaletQuantity('');
      setErrors(prev => ({ ...prev, paletQuantity: true }));
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
      setErrors(prev => ({ ...prev, cajaQuantity: true }));
    } else {
      const numValue = parseInt(inputValue, 10);
      if (!isNaN(numValue) && numValue >= 0) {
        setCajaQuantity(numValue);
        setErrors(prev => ({ ...prev, cajaQuantity: numValue < 1 }));
      }
    }
  };

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

    if (!isEditing) {
        setSelectedProduct(null);
        setSelectedPalet(null);
        setPaletQuantity(1);
        setSelectedCaja(null);
        setCajaQuantity(1);
        // setSelectedCategory(null); // Opcional: resetear categoría al añadir nueva línea
        setErrors({
            product: false, palet: false, 
            paletQuantity: false, caja: false, cajaQuantity: false
        });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <CategorySelector
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={(category) => {
          setSelectedCategory(category);
          // No es necesario resetear selectedProduct aquí, el segundo useEffect lo manejará si es necesario.
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="product-select">
            Producto <span className="text-destructive">*</span>
          </Label>
          <Select
            value={selectedProduct?.id || ""}
            onValueChange={(value) => {
              const product = products.find(p => p.id === value); // Buscar en todos los productos
              if (product) {
                setSelectedProduct(product);
                // Si el producto seleccionado tiene una categoría diferente a la actual, actualizar la categoría.
                // Esto es importante si el filtro de categoría estaba en "Todos" o si se selecciona un producto
                // cuya categoría no estaba previamente seleccionada.
                if (product.category !== selectedCategory) {
                  setSelectedCategory(product.category);
                }
                setErrors(prev => ({ ...prev, product: false }));
              } else {
                setSelectedProduct(null);
                setErrors(prev => ({ ...prev, product: true }));
              }
            }}
          >
            <SelectTrigger id="product-select" className={errors.product ? "border-destructive" : ""}>
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
                  {selectedCategory ? "No hay productos en esta categoría" : "Seleccione una categoría primero o no hay productos"}
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
            value={selectedPalet?.id || ""}
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
            min="0"
            value={paletQuantity}
            onChange={handlePaletQuantityChange}
            placeholder="0"
            className={errors.paletQuantity ? 'border-destructive' : ''}
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
            value={selectedCaja?.id || ""}
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
            min="0"
            value={cajaQuantity}
            onChange={handleCajaQuantityChange}
            placeholder="0"
            className={errors.cajaQuantity ? 'border-destructive' : ''}
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
          {isEditing ? 'Actualizar Línea' : 'Añadir Línea'}
        </Button>
      </div>
    </form>
  );
};

export default ProductLineForm;
