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

  const fetchRole = async (userId: string, isInitial: boolean = false) => {
    if (isInitial) setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role, is_banned')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn("Profile fetch error:", error.message);
        // If we can't fetch the profile, we default to 'user' but don't overwrite if already set
        setRole(prev => prev || 'user');
      } else if (data) {
        if (data.is_banned) {
          await supabase.auth.signOut();
          return;
        }
        setRole(data.role || 'user');
      }
    } catch (err) {
      console.error("Auth role check failed:", err);
      setRole(prev => prev || 'user');
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  const refreshRole = async () => {
    if (user) {
      await fetchRole(user.id, false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      if (!mounted) return;

      setSession(initialSession);
      const currentUser = initialSession?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        await fetchRole(currentUser.id, true);
      } else {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;

      const newUser = newSession?.user ?? null;
      setSession(newSession);
      setUser(newUser);
      
      if (event === 'SIGNED_IN' && newUser) {
        await fetchRole(newUser.id, true);
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
  }, []); // Removed user?.id and role from dependencies to prevent unnecessary re-runs

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