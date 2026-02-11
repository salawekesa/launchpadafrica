import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole } from '@/lib/types';

const API_BASE = '';

interface DbUser {
  id: number;
  name: string;
  email: string;
  bio?: string | null;
  role?: string | null;
  created_at?: string;
  verification_level?: string | null;
  wallet_address?: string | null;
}

function dbUserToAppUser(db: DbUser): User {
  const role = (db.role === 'investor' || db.role === 'community' ? db.role : 'builder') as UserRole;
  const verificationLevel = (db.verification_level === 'level1' || db.verification_level === 'level2'
    ? db.verification_level
    : 'unverified') as User['verificationLevel'];
  return {
    id: String(db.id),
    uid: `LP-${String(db.id).padStart(3, '0')}-AFR`,
    email: db.email,
    name: db.name,
    role,
    verificationLevel,
    country: 'Kenya',
    bio: db.bio ?? undefined,
    walletAddress: db.wallet_address ?? undefined,
    hackathonsAttended: [],
    hackathonsWon: [],
    collaborations: [],
    createdAt: db.created_at ?? new Date().toISOString(),
  };
}

export type ActiveProfile = 'builder' | 'investor';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  /** Toggle between viewing as Builder or Investor (defaults to user.role) */
  activeProfile: ActiveProfile;
  setActiveProfile: (profile: ActiveProfile) => void;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      activeProfile: 'builder',
      setActiveProfile: (profile) => set((s) => ({ activeProfile: profile })),
      setUser: (user) => set({ user }),

      login: async (email: string, _password: string) => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch(`${API_BASE}/api/users/by-email?email=${encodeURIComponent(email)}`);
          if (!res.ok) {
            if (res.status === 404) {
              set({ error: 'No account found with this email', isLoading: false });
              return false;
            }
            throw new Error('Login failed');
          }
          const dbUser: DbUser = await res.json();
          const user = dbUserToAppUser(dbUser);
          const activeProfile = (user.role === 'investor' ? 'investor' : 'builder') as ActiveProfile;
          set({ user, isAuthenticated: true, isLoading: false, error: null, activeProfile });
          return true;
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Login failed',
            isLoading: false,
          });
          return false;
        }
      },

      signup: async (email: string, _password: string, name: string, role: UserRole) => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch(`${API_BASE}/api/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, role }),
          });
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            if (res.status === 409) {
              set({ error: data.error || 'Email already registered', isLoading: false });
              return false;
            }
            throw new Error(data.error || 'Signup failed');
          }
          const dbUser: DbUser = await res.json();
          const user = dbUserToAppUser(dbUser);
          const activeProfile = (user.role === 'investor' ? 'investor' : 'builder') as ActiveProfile;
          set({ user, isAuthenticated: true, isLoading: false, error: null, activeProfile });
          return true;
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Signup failed',
            isLoading: false,
          });
          return false;
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false, error: null, activeProfile: 'builder' });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'launch-pad-auth',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated,
        activeProfile: state.activeProfile,
      }),
    }
  )
);
