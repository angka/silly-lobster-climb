import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  role: 'admin' | 'user' | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'admin' | 'user' | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRole = async (userId: string, email?: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role, is_banned')
        .eq('id', userId)
        .single();

      if (!error && data) {
        if (data.is_banned) {
          await supabase.auth.signOut();
          return;
        }
        // Update role from DB, but respect the admin email override
        const dbRole = String(data.role).toLowerCase() === 'admin' ? 'admin' : 'user';
        const finalRole = (email === 'angka@gmail.com' || email === 'admin@example.com') ? 'admin' : dbRole;
        setRole(finalRole);
      }
    } catch (err) {
      console.error("[AuthProvider] Background role fetch error:", err);
    }
  };

  const refreshRole = async () => {
    if (user) {
      await fetchRole(user.id, user.email);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (initialSession) {
          setSession(initialSession);
          setUser(initialSession.user);
          
          // Set initial role immediately based on email to prevent flickering and blocking
          const email = initialSession.user.email;
          if (email === 'angka@gmail.com' || email === 'admin@example.com') {
            setRole('admin');
          } else {
            setRole('user');
          }

          // Trigger background DB check without awaiting it
          fetchRole(initialSession.user.id, email);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("[AuthProvider] Init failed:", err);
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!mounted) return;

      if (newSession) {
        setSession(newSession);
        setUser(newSession.user);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          const email = newSession.user.email;
          if (email === 'angka@gmail.com' || email === 'admin@example.com') {
            setRole('admin');
          } else {
            setRole('user');
          }
          fetchRole(newSession.user.id, email);
        }
      } else {
        setSession(null);
        setUser(null);
        setRole(null);
      }
      
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, role, loading, signOut, refreshRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};