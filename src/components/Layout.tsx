import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { showSuccess } from '@/utils/toast';
import { useAuth } from './AuthProvider';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { session, role, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    showSuccess('Logged out successfully!');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary text-primary-foreground p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-2xl font-bold">
            EMR Contact Lens
          </Link>
          {role === 'admin' && (
            <Link to="/admin">
              <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/20">
                <Shield className="h-4 w-4 mr-2" /> Admin
              </Button>
            </Link>
          )}
        </div>
        {session && (
          <Button variant="ghost" size="icon" onClick={handleLogout} className="text-primary-foreground hover:bg-primary-foreground/20">
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Logout</span>
          </Button>
        )}
      </header>
      <main className="flex-grow container mx-auto p-4">
        {children}
      </main>
      <footer className="bg-primary text-primary-foreground p-4 text-center text-sm">
        System made by Matagama Angka (AK)
      </footer>
    </div>
  );
};

export default Layout;