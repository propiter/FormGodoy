import { useTheme } from './theme-provider';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Sun, Moon, Warehouse } from 'lucide-react';

const Navbar = () => {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-semibold">
          <Warehouse className="h-6 w-6" />
          <span>Sistema de Pedidos</span>
        </Link>

        <nav className="flex items-center gap-4">
          <Link to="/new-order">
            <Button variant="outline">Nuevo Pedido</Button>
          </Link>
          <Link to="/update-order">
            <Button variant="outline">Actualizar Pedido</Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;