import { useState } from 'react';
import { useTheme } from './theme-provider';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { FiSun, FiMoon } from 'react-icons/fi';
import customLogo from '../assets/logo-godoy.png';
import { MenuIcon } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const closeSheet = () => setIsSheetOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-customBorder bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <Link to="/" className="flex items-center gap-2 text-xl font-semibold text-customText hover:text-customPrimary">
          <img src={customLogo} alt="Sistema de Pedidos Logo" className="h-8 w-auto mr-2" />
          <span>Sistema de Pedidos</span>
        </Link>

        {/* Desktop/Tablet Navigation */}
        <nav className="hidden md:flex items-center gap-4">
          <Link to="/new-order">
            <Button variant="outline" className="text-customText hover:text-customPrimary border-customBorder">Nuevo Pedido</Button>
          </Link>
          <Link to="/update-order">
            <Button variant="outline" className="text-customText hover:text-customPrimary border-customBorder">Actualizar Pedido</Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            aria-label="Toggle theme"
            className="text-customText hover:bg-customSurface hover:text-customPrimary"
          >
            {theme === 'light' ? (
              <FiMoon className="h-5 w-5" />
            ) : (
              <FiSun className="h-5 w-5" />
            )}
          </Button>
        </nav>

        {/* Mobile Hamburger Menu */}
        <div className="md:hidden flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            aria-label="Toggle theme"
            className="text-customText hover:bg-customSurface hover:text-customPrimary"
          >
            {theme === 'light' ? (
              <FiMoon className="h-5 w-5" />
            ) : (
              <FiSun className="h-5 w-5" />
            )}
          </Button>
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <MenuIcon className="h-6 w-6 text-customText" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] sm:w-[300px] bg-background flex flex-col">
              <SheetHeader>
                <SheetTitle className="text-2xl font-bold text-primary">GodoyHortalizas</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-8">
                <Link to="/new-order" onClick={closeSheet}>
                  <Button variant="outline" className="w-full text-lg py-6 text-customText hover:text-customPrimary border-customBorder">Nuevo Pedido</Button>
                </Link>
                <Link to="/update-order" onClick={closeSheet}>
                  <Button variant="outline" className="w-full text-lg py-6 text-customText hover:text-customPrimary border-customBorder">Actualizar Pedido</Button>
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
