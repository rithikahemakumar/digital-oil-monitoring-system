import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/lib/types';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  loginDemo: () => void;
  saveCustomProfile: (p: Profile) => void;
}

const DEMO_USER: User = {
  id: '00000000-0000-0000-0000-000000000001',
  app_metadata: {},
  user_metadata: { name: 'Demo User' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  email: 'demo@oilwise.local',
};

const DEMO_SESSION: Session = {
  access_token: 'demo-token',
  refresh_token: 'demo-refresh',
  expires_in: 3600,
  token_type: 'bearer',
  user: DEMO_USER,
};

const DEMO_PROFILE: Profile = {
  id: '00000000-0000-0000-0000-000000000002',
  user_id: '00000000-0000-0000-0000-000000000001',
  name: 'Demo User',
  age: 32,
  bmi: 23.5,
  activity_level: 'Moderate',
  pre_existing_conditions: [],
  household_size: 4,
  state: 'Maharashtra',
  zone: 'West',
  created_at: new Date().toISOString(),
};

function getDemoProfile(): Profile {
  const saved = localStorage.getItem('oilwise_demo_profile');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // ignore
    }
  }
  return DEMO_PROFILE;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (localStorage.getItem('oilwise_demo') === 'true') {
      setSession(DEMO_SESSION);
      setProfile(getDemoProfile());
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      if (data.session?.user) await loadProfile(data.session.user.id);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (localStorage.getItem('oilwise_demo') === 'true') return;
      setSession(newSession);
      setLoading(false);
      (async () => {
        if (newSession?.user) {
          await loadProfile(newSession.user.id);
        } else {
          setProfile(null);
        }
      })();
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function loadProfile(userId: string) {
    if (localStorage.getItem('oilwise_demo') === 'true') {
      setProfile(getDemoProfile());
      return;
    }
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      if (data) {
        setProfile(data as Profile);
      }
    } catch {
      // fallback
    }
  }

  async function refreshProfile() {
    if (localStorage.getItem('oilwise_demo') === 'true') {
      setProfile(getDemoProfile());
      return;
    }
    if (session?.user) await loadProfile(session.user.id);
  }

  function saveCustomProfile(p: Profile) {
    if (localStorage.getItem('oilwise_demo') === 'true') {
      localStorage.setItem('oilwise_demo_profile', JSON.stringify(p));
    }
    setProfile(p);
  }

  function loginDemo() {
    localStorage.setItem('oilwise_demo', 'true');
    setSession(DEMO_SESSION);
    setProfile(getDemoProfile());
  }

  async function signOut() {
    localStorage.removeItem('oilwise_demo');
    localStorage.removeItem('oilwise_demo_profile');
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    setSession(null);
    setProfile(null);
  }

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, profile, loading, signOut, refreshProfile, loginDemo, saveCustomProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
