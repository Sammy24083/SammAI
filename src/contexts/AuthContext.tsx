import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { supabase, isLiveSupabaseConfigured } from '../lib/supabase';

interface RegisteredUserRecord {
  profile: UserProfile;
  passwordHash?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isAdmin: boolean;
  login: (email: string, password?: string, role?: UserRole) => Promise<{ success: boolean; error?: string }>;
  signup: (fullName: string, email: string, phone: string, whatsapp: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

const DEFAULT_CUSTOMER: UserProfile = {
  id: 'cust-demo',
  full_name: 'Samuel Amaechi',
  email: 'amaechisamuelugo@gmail.com',
  phone: '07036192301',
  whatsapp_number: '07036192301',
  role: 'customer',
  country: 'Nigeria',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  created_at: '2026-01-10T12:00:00Z',
  updated_at: '2026-03-30T10:00:00Z',
};

const DEFAULT_ADMIN: UserProfile = {
  id: 'admin-1',
  full_name: 'Samuel Amaechi (Admin)',
  email: 'amaechisamuelugo@gmail.com',
  phone: '07036192301',
  whatsapp_number: '07036192301',
  role: 'admin',
  country: 'Nigeria',
  avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-03-30T10:00:00Z',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getSavedUserRegistry(): RegisteredUserRecord[] {
  try {
    const raw = localStorage.getItem('samm_registered_users');
    if (!raw) return [{ profile: DEFAULT_CUSTOMER }, { profile: DEFAULT_ADMIN }];
    return JSON.parse(raw);
  } catch {
    return [{ profile: DEFAULT_CUSTOMER }, { profile: DEFAULT_ADMIN }];
  }
}

function saveUserRegistry(registry: RegisteredUserRecord[]) {
  try {
    localStorage.setItem('samm_registered_users', JSON.stringify(registry));
  } catch {}
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('samm_user');
      return saved ? JSON.parse(saved) : DEFAULT_CUSTOMER;
    } catch {
      return DEFAULT_CUSTOMER;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('samm_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('samm_user');
    }
  }, [user]);

  const login = async (
    email: string,
    password?: string,
    roleOverride?: UserRole
  ): Promise<{ success: boolean; error?: string }> => {
    const normalizedEmail = email.trim().toLowerCase();

    // Check if admin login
    if (
      normalizedEmail === 'amaechisamuelugo@gmail.com' ||
      normalizedEmail === 'admin@sammai.store' ||
      normalizedEmail.includes('admin') ||
      roleOverride === 'admin'
    ) {
      const adminUser: UserProfile = { ...DEFAULT_ADMIN, email: normalizedEmail };
      setUser(adminUser);
      return { success: true };
    }

    // Try Supabase auth if live connection is configured
    if (isLiveSupabaseConfigured && supabase && password) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });
        if (!error && data.user) {
          const profile: UserProfile = {
            id: data.user.id,
            full_name: data.user.user_metadata?.full_name || normalizedEmail.split('@')[0],
            email: normalizedEmail,
            phone: data.user.user_metadata?.phone || '',
            whatsapp_number: data.user.user_metadata?.whatsapp || '',
            role: 'customer',
            country: 'Nigeria',
            created_at: data.user.created_at,
            updated_at: new Date().toISOString(),
          };
          setUser(profile);
          return { success: true };
        }
      } catch (e) {
        console.warn('Supabase auth login fallback to local:', e);
      }
    }

    // Local user registry lookup
    const registry = getSavedUserRegistry();
    const existing = registry.find((r) => r.profile.email.toLowerCase() === normalizedEmail);

    if (existing) {
      setUser(existing.profile);
      return { success: true };
    }

    // If new customer signs in without existing record, create profile smoothly
    const newProfile: UserProfile = {
      id: 'cust-' + Date.now(),
      full_name: normalizedEmail.split('@')[0],
      email: normalizedEmail,
      phone: '07036192301',
      whatsapp_number: '07036192301',
      role: 'customer',
      country: 'Nigeria',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    registry.push({ profile: newProfile });
    saveUserRegistry(registry);
    setUser(newProfile);
    return { success: true };
  };

  const signup = async (
    fullName: string,
    email: string,
    phone: string,
    whatsapp: string,
    password?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const normalizedEmail = email.trim().toLowerCase();

    // Supabase auth attempt if configured
    if (isLiveSupabaseConfigured && supabase && password) {
      try {
        await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: { full_name: fullName, phone, whatsapp },
          },
        });
      } catch (err) {
        console.warn('Supabase signUp fallback:', err);
      }
    }

    const newUser: UserProfile = {
      id: 'cust-' + Date.now(),
      full_name: fullName.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      whatsapp_number: whatsapp.trim(),
      role: 'customer',
      country: 'Nigeria',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const registry = getSavedUserRegistry();
    const filtered = registry.filter((r) => r.profile.email.toLowerCase() !== normalizedEmail);
    filtered.push({ profile: newUser });
    saveUserRegistry(filtered);

    setUser(newUser);
    return { success: true };
  };

  const logout = () => {
    if (isLiveSupabaseConfigured && supabase) {
      supabase.auth.signOut().catch(() => {});
    }
    setUser(null);
  };

  const switchRole = (newRole: UserRole) => {
    if (newRole === 'admin' || newRole === 'super_admin') {
      setUser(DEFAULT_ADMIN);
    } else {
      setUser(DEFAULT_CUSTOMER);
    }
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates, updated_at: new Date().toISOString() };
    setUser(updated);

    const registry = getSavedUserRegistry();
    const idx = registry.findIndex((r) => r.profile.id === user.id || r.profile.email === user.email);
    if (idx !== -1) {
      registry[idx].profile = updated;
      saveUserRegistry(registry);
    }
  };

  const role = user?.role || 'customer';
  const isAdmin = role === 'admin' || role === 'super_admin' || role === 'staff';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAdmin,
        login,
        signup,
        logout,
        switchRole,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
