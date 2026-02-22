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
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (!mounted) return;

        setSession(initialSession);
        const currentUser = initialSession?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          // Start fetching role but don't block the initial loading state if it takes too long
          fetchRole(currentUser.id).finally(() => {
            if (mounted) setLoading(false);
          });
          
          // Safety timeout: if role fetch takes > 3s, show the app anyway
          setTimeout(() => {
            if (mounted && loading) setLoading(false);
          }, 3000);
        } else {
          setLoading(false);
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
        setLoading(true);
        await fetchRole(newUser.id);
        setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setRole(null);
        setLoading(false);
      } else if (event === 'INITIAL_SESSION' && !newSession) {
        setLoading(false);
      }
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