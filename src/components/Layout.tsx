import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  onLogout?: () => void;
  showLogout?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, onLogout, showLogout = false }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary text-primary-foreground p-4 shadow-md flex justify-between items-center">
        <Link to="/dashboard" className="text-2xl font-bold">
          EMR Contact Lens
        </Link>
        {showLogout && (
          <Button variant="ghost" size="icon" onClick={onLogout} className="text-primary-foreground hover:bg-primary-foreground/20">
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Logout</span>
          </Button>
        )}
      </header>
      <main className="flex-grow container mx-auto p-4">
        {children}
      </main>
    </div>
  );
};

export default Layout;