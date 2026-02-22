import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, Shield, LayoutDashboard, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { showSuccess } from '@/utils/toast';
import { useAuth } from './AuthProvider';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, role, signOut, refreshRole } = useAuth();

  const handleLogout = async () => {
    await signOut();
    showSuccess('Logged out successfully!');
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  ];

  if (role === 'admin') {
    navItems.push({ label: 'Admin', path: '/admin', icon: Shield });
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <header className="bg-primary text-primary-foreground p-4 shadow-md sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="text-2xl font-bold tracking-tight">
              EMR Contact Lens
            </Link>
            
            {session && (
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => (
                  <Link key={item.path} to={item.path}>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={cn(
                        "text-primary-foreground hover:bg-primary-foreground/20",
                        location.pathname === item.path && "bg-primary-foreground/10"
                      )}
                    >
                      <item.icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </nav>
            )}
          </div>

          {session && (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-medium opacity-90">{session.user.email}</span>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={role === 'admin' ? 'secondary' : 'outline'} 
                    className={cn(
                      "text-[10px] uppercase px-1.5 py-0 h-4",
                      role === 'admin' ? "bg-amber-400 text-amber-950 border-none" : "text-primary-foreground border-primary-foreground/30"
                    )}
                  >
                    {role || 'Loading...'}
                  </Badge>
                  <button 
                    onClick={() => refreshRole()} 
                    className="opacity-50 hover:opacity-100 transition-opacity"
                    title="Refresh Role"
                  >
                    <RefreshCw className="h-3 w-3" />
                  </button>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleLogout} 
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Logout</span>
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 md:p-6">
        {children}
      </main>

      <footer className="bg-white border-t p-6 text-center text-sm text-muted-foreground">
        <div className="container mx-auto">
          <p>System made by Matagama Angka (AK)</p>
          <p className="mt-1 text-xs opacity-70">© {new Date().getFullYear()} Contact Lens EMR System</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;