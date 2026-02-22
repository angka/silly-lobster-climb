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
    // Immediate local check for admin emails
    if (email === 'angka@gmail.com' || email === 'admin@example.com') {
      setRole('admin');
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role, is_banned')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("[AuthProvider] Role fetch error:", error.message);
        if (!role) setRole('user');
      } else if (data) {
        if (data.is_banned) {
          await supabase.auth.signOut();
          return;
        }
        const userRole = String(data.role).toLowerCase() === 'admin' ? 'admin' : 'user';
        setRole(userRole);
      }
    } catch (err) {
      console.error("[AuthProvider] Unexpected error in fetchRole:", err);
      if (!role) setRole('user');
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
          // Fetch role in background, don't await it to prevent blocking the UI
          fetchRole(initialSession.user.id, initialSession.user.email);
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
          fetchRole(newSession.user.id, newSession.user.email);
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