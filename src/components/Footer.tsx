import { Heart } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-customBorder py-6 bg-background">
      <div className="container flex flex-col items-center justify-center gap-2 md:flex-row md:justify-between mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <p className="text-center text-sm text-customTextSecondary md:text-left">
          &copy; {currentYear} Sistema de Gestión de Pedidos. Todos los derechos reservados.
        </p>
        <p className="flex items-center gap-1 text-sm text-customTextSecondary">
          <span>Hecho con</span>
          <Heart className="h-4 w-4 text-customError fill-customError" />
          <span>para mejorar la gestión de inventario por GodoyHortalizas</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
