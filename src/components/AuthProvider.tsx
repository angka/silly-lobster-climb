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
      console.log("[AuthProvider] Fetching role for user:", userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('role, is_banned, email')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("[AuthProvider] Profile fetch error:", error.message);
        // Fallback for the primary admin email if the profile record is missing or inaccessible
        if (user?.email === 'angka@gmail.com' || user?.email === 'admin@example.com') {
          console.log("[AuthProvider] Applying admin fallback based on email");
          setRole('admin');
        } else {
          setRole('user');
        }
      } else if (data) {
        console.log("[AuthProvider] Profile data received:", data);
        if (data.is_banned) {
          console.warn("[AuthProvider] User is banned, signing out");
          await supabase.auth.signOut();
          return;
        }
        
        // Ensure we handle the role string correctly
        const userRole = String(data.role).toLowerCase() === 'admin' ? 'admin' : 'user';
        setRole(userRole);
      } else {
        setRole('user');
      }
    } catch (err) {
      console.error("[AuthProvider] Auth role check failed:", err);
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
          await fetchRole(currentUser.id);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("[AuthProvider] Init auth failed:", err);
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;

      const newUser = newSession?.user ?? null;
      setSession(newSession);
      setUser(newUser);
      
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') && newUser) {
        await fetchRole(newUser.id);
      } else if (event === 'SIGNED_OUT') {
        setRole(null);
      }
      
      setLoading(false);
    });

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