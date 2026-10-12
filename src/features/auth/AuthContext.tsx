import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../../lib/supabase/client';
import { UserProfile } from '../../types';
import { DEMO_USERS } from '../../lib/demo/demoData';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isDemoMode: boolean;
  setDemoMode: (enabled: boolean) => void;
  activeDemoUserId: string;
  switchDemoUser: (userId: string) => void;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  resetPasswordForEmail: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check initial demo mode from env or localStorage
  const [isDemoMode, setIsDemoModeState] = useState<boolean>(() => {
    const saved = localStorage.getItem('hisabbhai_demo_mode');
    if (saved !== null) return saved === 'true';
    return import.meta.env.VITE_DEMO_MODE === 'true' || !isSupabaseConfigured();
  });

  const [activeDemoUserId, setActiveDemoUserId] = useState<string>(() => {
    return localStorage.getItem('hisabbhai_demo_user_id') || DEMO_USERS[0].id;
  });

  const setDemoMode = (enabled: boolean) => {
    setIsDemoModeState(enabled);
    localStorage.setItem('hisabbhai_demo_mode', String(enabled));
  };

  const switchDemoUser = (userId: string) => {
    setActiveDemoUserId(userId);
    localStorage.setItem('hisabbhai_demo_user_id', userId);
    const found = DEMO_USERS.find(u => u.id === userId);
    if (found) {
      setProfile(found);
    }
  };

  // Sync demo user profile
  useEffect(() => {
    if (isDemoMode) {
      const demoUser = DEMO_USERS.find(u => u.id === activeDemoUserId) || DEMO_USERS[0];
      setProfile(demoUser);
      setUser({
        id: demoUser.id,
        email: demoUser.email,
        app_metadata: {},
        user_metadata: { full_name: demoUser.full_name },
        aud: 'authenticated',
        created_at: demoUser.created_at,
      } as User);
      setIsLoading(false);
      return;
    }

    // Live Supabase flow
    if (isSupabaseConfigured()) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchLiveProfile(session.user.id);
        } else {
          setIsLoading(false);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchLiveProfile(session.user.id);
        } else {
          setProfile(null);
          setIsLoading(false);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      // Supabase is not configured, fallback to demo mode
      setIsDemoModeState(true);
      setIsLoading(false);
    }
  }, [isDemoMode, activeDemoUserId]);

  const fetchLiveProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      }
      if (data) {
        setProfile(data as UserProfile);
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    if (isDemoMode) {
      return { error: null };
    }
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      return { error: error as Error | null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    if (isDemoMode) {
      return { error: null };
    }
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error as Error | null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    if (isDemoMode) {
      return { error: null };
    }
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      return { error: error as Error | null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const resetPasswordForEmail = async (email: string) => {
    if (isDemoMode) {
      return { error: null };
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return { error: error as Error | null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    if (!isDemoMode && isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (isDemoMode) {
      if (profile) {
        const updated = { ...profile, ...updates };
        setProfile(updated);
      }
      return { error: null };
    }
    if (!user) return { error: new Error('User not logged in') };

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      if (!error && profile) {
        setProfile({ ...profile, ...updates });
      }
      return { error: error as Error | null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        isDemoMode,
        setDemoMode,
        activeDemoUserId,
        switchDemoUser,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        resetPasswordForEmail,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
