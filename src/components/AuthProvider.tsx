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

  const fetchRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role, is_banned')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn("Profile fetch error:", error.message);
        setRole('user');
      } else if (data) {
        if (data.is_banned) {
          await supabase.auth.signOut();
          return;
        }
        setRole(data.role || 'user');
      } else {
        setRole('user');
      }
    } catch (err) {
      console.error("Auth role check failed:", err);
      setRole('user');
    }
  };

  const refreshRole = async () => {
    if (user) {
      await fetchRole(user.id);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        // Get initial session
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        setSession(initialSession);
        const currentUser = initialSession?.user ?? null;
        setUser(currentUser);

        // We have the session, so we can stop the main loading state
        setLoading(false);

        // Fetch role in the background
        if (currentUser) {
          fetchRole(currentUser.id);
        }
      } catch (err) {
        console.error("Init auth failed:", err);
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;

      const newUser = newSession?.user ?? null;
      setSession(newSession);
      setUser(newUser);
      
      if (event === 'SIGNED_IN' && newUser) {
        // Don't set loading to true here to avoid flickering or getting stuck
        fetchRole(newUser.id);
      } else if (event === 'SIGNED_OUT') {
        setRole(null);
      }
      
      // Ensure loading is false after any auth state change event
      setLoading(false);
    });

    // Safety timeout to ensure loading screen always disappears
    const timer = setTimeout(() => {
      if (mounted && loading) setLoading(false);
    }, 5000);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(timer);
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