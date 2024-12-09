import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, Search, Menu, Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();
  const { isDark, toggleTheme } = useThemeStore();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 safe-area-inset-top">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Link 
            to="/" 
            className="flex items-center space-x-2 touch-manipulation"
            aria-label="Home"
          >
            <Calendar className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg hidden sm:inline">AppointmentPro</span>
          </Link>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link 
              to="/" 
              className={`p-3 rounded-md touch-manipulation ${
                isActive('/') ? 'bg-primary/10' : 'hover:bg-primary/5'
              }`}
              aria-label="Home"
            >
              <Home className="w-5 h-5" />
            </Link>
            <button 
              className="p-3 rounded-md touch-manipulation hover:bg-primary/5"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              className="p-3 rounded-md touch-manipulation hover:bg-primary/5"
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
            <button 
              className="p-3 rounded-md touch-manipulation sm:hidden hover:bg-primary/5"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Menu"
              aria-expanded={isMenuOpen}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="sm:hidden border-t border-border py-2">
            <div className="space-y-1">
              <Link
                to="/lead"
                className={`block px-3 py-2 rounded-md ${
                  isActive('/lead') ? 'bg-primary/10' : 'hover:bg-primary/5'
                }`}
              >
                New Lead
              </Link>
              <Link
                to="/revisit"
                className={`block px-3 py-2 rounded-md ${
                  isActive('/revisit') ? 'bg-primary/10' : 'hover:bg-primary/5'
                }`}
              >
                Revisit
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;