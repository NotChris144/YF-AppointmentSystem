import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Wrench, Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';

const Navbar: React.FC = () => {
  const location = useLocation();
  const { isDark, toggleTheme } = useThemeStore();

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 safe-area-inset-top">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Link 
            to="/" 
            className="flex items-center space-x-2 touch-manipulation"
            aria-label="Home"
          >
            <Wrench className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg hidden sm:inline">Sales Tools</span>
          </Link>
          
          <div className="flex items-center space-x-4">
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