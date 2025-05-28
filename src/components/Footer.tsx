import { Heart } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full border-t py-6 bg-background">
      <div className="container flex flex-col items-center justify-center gap-2 md:flex-row md:justify-between">
        <p className="text-center text-sm text-muted-foreground md:text-left">
          &copy; {currentYear} Sistema de Gestión de Pedidos. Todos los derechos reservados.
        </p>
        <p className="flex items-center gap-1 text-sm text-muted-foreground">
          <span>Hecho con</span> 
          <Heart className="h-4 w-4 text-red-500 fill-red-500" /> 
          <span>para mejorar la gestión de inventario</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;