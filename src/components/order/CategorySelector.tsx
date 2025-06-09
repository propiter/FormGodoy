import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

interface CategorySelectorProps {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

const categoryImages: { [key: string]: string } = {
  "AMARILLO": "https://www.ramiroarnedo.com/wp-content/uploads/2023/04/AR-371122-2-1024x768.jpg",
  "NARANJA": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcToKnrxwbQ-TQ9KBkM-En4JvSem1Er0V42eYQ&s",
  "ROJO": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcStd2ZH95neHDwKY9YYHAAYr1oK73romuZ_4w&s",
  "VERDE": "https://agroactivocol.com/wp-content/uploads/2020/09/pimiento-california-wonder-semillas-ecologicas.jpg",
  "default": "https://blog.aepla.es/wp-content/uploads/2020/11/verduras-frutas-hortalizas-aepla.jpeg"
};

const CategorySelector = ({ categories, selectedCategory, onSelectCategory }: CategorySelectorProps) => {
    const sortedCategories = [...categories].sort((a, b) => {
      const aHasSpecificImage = !!categoryImages[a] && categoryImages[a] !== categoryImages.default;
      const bHasSpecificImage = !!categoryImages[b] && categoryImages[b] !== categoryImages.default;
  
      if (aHasSpecificImage && !bHasSpecificImage) {
        return -1; // a comes first
      }
      if (!aHasSpecificImage && bHasSpecificImage) {
        return 1; // b comes first
      }
      // If both have specific images or both use default, sort alphabetically
      return a.localeCompare(b);
    });
  
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Seleccione una categoría:</h3>
          {selectedCategory && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelectCategory(null)}
              className="text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <XCircle className="h-4 w-4" /> Limpiar filtro
            </Button>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {sortedCategories.map((category) => (
            <Button
            key={category}
            variant="ghost"
            className={cn(
              "relative overflow-hidden rounded-lg p-0 h-24 sm:h-28 md:h-32 transition-all duration-200 group",
              "border border-border hover:ring-2 hover:ring-primary/50",
              selectedCategory === category && "ring-2 ring-primary ring-offset-2 ring-offset-background"
            )}
            onClick={() => onSelectCategory(category)}
          >
            <img
              src={categoryImages[category] || categoryImages.default}
              alt={category}
              className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-white font-semibold text-sm text-center px-4">
                {category}
              </span>
            </div>
          </Button>
          
          ))}
        </div>
      </div>
    );
  };
  
  export default CategorySelector;
  