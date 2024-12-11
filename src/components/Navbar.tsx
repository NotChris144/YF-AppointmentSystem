import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { Home, Wrench, Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';

const Navbar: React.FC = () => {
  const location = useLocation();
  const { isDark, toggleTheme } = useThemeStore();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <Wrench className="w-6 h-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">
              Sales Tools
            </span>
          </Link>
          <div className="flex items-center space-x-6 text-sm font-medium">
            <Link
              to="/price-comparison"
              className={cn(
                "transition-colors hover:text-foreground/80",
                isActive('/price-comparison') ? "text-foreground" : "text-foreground/60"
              )}
            >
              Price Comparison
            </Link>
            <button
              onClick={toggleTheme}
              className="p-3 rounded-md touch-manipulation hover:bg-primary/5"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className="flex md:hidden">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <Wrench className="w-6 h-6 text-primary" />
            <span className="font-bold">ST</span>
          </Link>
          <div className="flex items-center space-x-4 text-sm font-medium">
            <Link
              to="/price-comparison"
              className={cn(
                "transition-colors hover:text-foreground/80",
                isActive('/price-comparison') ? "text-foreground" : "text-foreground/60"
              )}
            >
              Prices
            </Link>
            <button
              onClick={toggleTheme}
              className="p-3 rounded-md touch-manipulation hover:bg-primary/5"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;