import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '@/types';
import { users } from '@/data/mock';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (mobile: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (mobile: string): boolean => {
    // Mock: find user by mobile
    const found = users.find((u) => u.mobile === mobile);
    if (found) {
      setUser(found);
      return true;
    }
    // Default: log in as first worker for demo
    setUser(users[1]);
    return true;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
