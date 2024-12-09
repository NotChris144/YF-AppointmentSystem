import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navigation } from 'lucide-react';
import Navbar from './Navbar';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-4 sm:py-8 safe-area-inset-bottom overflow-x-hidden">
        <div className="max-w-3xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;