import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  user_id: string;
  name: string;
  email: string;
  mobile?: string;
  department?: string;
  position?: string;
  salary?: number;
  join_date?: string;
  address?: string;
  profile_photo?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  supabaseUser: User | null;
  role: 'owner' | 'worker' | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [role, setRole] = useState<'owner' | 'worker' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserData = async (session: Session | null) => {
    if (!session?.user) {
      setUser(null);
      setSupabaseUser(null);
      setRole(null);
      setIsLoading(false);
      return;
    }

    const supaUser = session.user;
    setSupabaseUser(supaUser);

    try {
      // Try to fetch existing profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', supaUser.id)
        .maybeSingle();

      if (profile) {
        setUser({
          user_id: supaUser.id,
          name: profile.name,
          email: supaUser.email || '',
          mobile: profile.mobile || undefined,
          department: profile.department || undefined,
          position: profile.position || undefined,
          salary: profile.salary || undefined,
          join_date: profile.join_date || undefined,
          address: profile.address || undefined,
          profile_photo: profile.profile_photo || supaUser.user_metadata?.avatar_url || undefined,
        });
      } else {
        // First login — create profile from Google metadata
        const fullName = supaUser.user_metadata?.full_name || supaUser.email?.split('@')[0] || 'User';
        const avatarUrl = supaUser.user_metadata?.avatar_url || null;

        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            user_id: supaUser.id,
            name: fullName,
            mobile: '',
            profile_photo: avatarUrl,
            status: 'active',
          })
          .select()
          .single();

        if (insertError) {
          console.error('Profile creation error:', insertError);
        } else {
          setUser({
            user_id: supaUser.id,
            name: newProfile.name,
            email: supaUser.email || '',
            profile_photo: avatarUrl || undefined,
          });
        }
      }

      // Fetch role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', supaUser.id)
        .maybeSingle();

      if (roleData?.role) {
        setRole(roleData.role as 'owner' | 'worker');
      } else {
        // No role yet — default to worker, owner must be set manually in DB
        setRole('worker');
      }
    } catch (err) {
      console.error('Error loading user data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsLoading(true);
      await loadUserData(session);
    });

    // Check existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      loadUserData(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}${import.meta.env.BASE_URL}dashboard`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSupabaseUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      supabaseUser,
      role,
      isAuthenticated: !!user,
      isLoading,
      loginWithGoogle,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
