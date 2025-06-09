import { useState, useEffect } from 'react';
import { useOrder } from '@/context/OrderContext';
import { useData } from '@/context/DataContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Search, Loader2 } from 'lucide-react';

const ClientSearch = () => {
  const { toast } = useToast();
  const { clients, loading } = useData();
  const { client, setClient } = useOrder();
  
  const [cif, setCif] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    // If client is already set (e.g., in edit mode), pre-fill the CIF
    if (client) {
      setCif(client.cif);
    }
  }, [client]);

  const handleSearch = async () => {
    if (!cif.trim()) {
      toast({
        title: "CIF requerido",
        description: "Por favor, introduzca el CIF del cliente",
        variant: "destructive"
      });
      return;
    }
  
    setIsSearching(true);
    
    const foundClient = clients.find(c => c.cif === cif.trim());
    
    if (foundClient) {
      setClient(foundClient);
      toast({
        title: "Cliente encontrado",
        description: `Se ha encontrado a ${foundClient.name}`,
      });
    } else {
      toast({
        title: "Cliente no encontrado",
        description: "No se encontró un cliente con ese CIF",
        variant: "destructive"
      });
    }
    
    setIsSearching(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end gap-3">
        <div className="flex-1 space-y-2">
          <Label htmlFor="cif">CIF del Cliente</Label>
          <Input
            id="cif"
            placeholder="Ej: B12345678"
            value={cif}
            onChange={(e) => setCif(e.target.value)}
            onKeyDown={handleKeyDown}
            className="placeholder:text-muted-foreground/50" 
          />
        </div>
        <Button 
          onClick={handleSearch}
          disabled={isSearching || loading}
          className="flex gap-2 items-center"
        >
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          Buscar
        </Button>
      </div>

      {client && (
        <div className="p-4 border rounded-md bg-muted/30 space-y-3">
          <h3 className="font-medium">Datos del cliente</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Nombre</Label>
              <p className="font-medium">{client.name}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">CIF</Label>
              <p className="font-medium">{client.cif}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Dirección</Label>
              <p className="font-medium">{client.address || "No disponible"}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Teléfono</Label>
              <p className="font-medium">{client.phone || "No disponible"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientSearch;