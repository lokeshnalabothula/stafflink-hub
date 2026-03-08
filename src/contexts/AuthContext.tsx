import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  user_id: string;
  name: string;
  mobile: string;
  department?: string;
  position?: string;
  salary?: number;
  join_date?: string;
  address?: string;
  profile_photo?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  role: 'owner' | 'worker' | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: { user_id: string; role: string; profile: UserProfile; session: { access_token: string; refresh_token: string } }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<'owner' | 'worker' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Fetch profile and role
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();

        if (profile) {
          setUser({
            user_id: session.user.id,
            name: profile.name,
            mobile: profile.mobile,
            department: profile.department || undefined,
            position: profile.position || undefined,
            salary: profile.salary || undefined,
            join_date: profile.join_date || undefined,
            address: profile.address || undefined,
            profile_photo: profile.profile_photo || undefined,
          });
          setRole((roleData?.role as 'owner' | 'worker') || 'worker');
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setIsLoading(false);
    });

    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setIsLoading(false);
      }
      // onAuthStateChange will handle the rest
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (data: { user_id: string; role: string; profile: UserProfile; session: { access_token: string; refresh_token: string } }) => {
    // Set the Supabase session
    await supabase.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    });
    
    const userRole = data.role as 'owner' | 'worker';
    setUser(data.profile);
    setRole(userRole);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
