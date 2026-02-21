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

  const fetchRole = async (userId: string) => {
    try {
      // Add a timeout to the role fetch to prevent endless loading
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
        setRole('user');
      } else if (data) {
        if (data.is_banned) {
          await supabase.auth.signOut();
          alert("Your account has been banned.");
          return;
        }
        setRole(data.role || 'user');
      } else {
        setRole('user');
      }
    } catch (err) {
      console.error("Auth role check failed:", err);
      setRole('user'); // Default to user on failure
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Initial session check
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchRole(session.user.id);
      } else {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;

      setSession(newSession);
      setUser(newSession?.user ?? null);
      
      if (event === 'SIGNED_IN' && newSession?.user) {
        setLoading(true);
        await fetchRole(newSession.user.id);
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