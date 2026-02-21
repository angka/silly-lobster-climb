import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  role: 'admin' | 'user' | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'admin' | 'user' | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRole = async (userId: string, isInitial: boolean = false) => {
    if (isInitial) setLoading(true);
    
    try {
      const rolePromise = supabase
        .from('profiles')
        .select('role, is_banned')
        .eq('id', userId)
        .single();

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );

      const { data, error } = await Promise.race([rolePromise, timeoutPromise]) as any;

      if (error) {
        console.warn("Profile fetch error:", error.message);
        if (!role) setRole('user');
      } else if (data) {
        if (data.is_banned) {
          await supabase.auth.signOut();
          return;
        }
        setRole(data.role || 'user');
      } else if (!role) {
        setRole('user');
      }
    } catch (err) {
      console.error("Auth role check failed:", err);
      if (!role) setRole('user');
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      if (!mounted) return;

      setSession(initialSession);
      setUser(initialSession?.user ?? null);

      if (initialSession?.user) {
        await fetchRole(initialSession.user.id, true);
      } else {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;

      const prevUser = user?.id;
      setSession(newSession);
      setUser(newSession?.user ?? null);
      
      // Only trigger a loading state if the user has actually changed (new login)
      // Background refreshes (TOKEN_REFRESHED) shouldn't trigger the loading UI
      if (event === 'SIGNED_IN' && newSession?.user && newSession.user.id !== prevUser) {
        await fetchRole(newSession.user.id, true);
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
  }, [user?.id, role]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, role, loading, signOut }}>
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