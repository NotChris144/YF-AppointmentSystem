import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Calendar, Search } from 'lucide-react';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-card border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Calendar className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg">AppointmentPro</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link to="/" className="p-2 hover:bg-primary/10 rounded-md">
              <Home className="w-5 h-5" />
            </Link>
            <button className="p-2 hover:bg-primary/10 rounded-md">
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;