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
  login: (data: { user_id: string; role: string; profile: UserProfile }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<'owner' | 'worker' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored session
    const stored = localStorage.getItem('staffhub_session');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed.user);
        setRole(parsed.role);
      } catch {
        localStorage.removeItem('staffhub_session');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (data: { user_id: string; role: string; profile: UserProfile }) => {
    const userRole = data.role as 'owner' | 'worker';
    setUser(data.profile);
    setRole(userRole);
    localStorage.setItem('staffhub_session', JSON.stringify({ user: data.profile, role: userRole }));
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    localStorage.removeItem('staffhub_session');
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
