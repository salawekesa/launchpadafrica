import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole } from '@/lib/types';
import { mockUsers } from '@/lib/mock-data';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
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

      login: async (email: string, _password: string) => {
        set({ isLoading: true, error: null });
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock: Find user by email or create session for any valid email
        const existingUser = mockUsers.find(u => u.email === email);
        
        if (existingUser) {
          set({ user: existingUser, isAuthenticated: true, isLoading: false });
          return true;
        }
        
        // For demo, accept any email with valid format
        if (email.includes('@')) {
          const newUser: User = {
            id: `user-${Date.now()}`,
            uid: `LP-${Date.now().toString().slice(-3)}-AFR-KE`,
            email,
            name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
            role: 'builder',
            verificationLevel: 'unverified',
            country: 'Kenya',
            hackathonsAttended: [],
            hackathonsWon: [],
            collaborations: [],
            createdAt: new Date().toISOString(),
          };
          set({ user: newUser, isAuthenticated: true, isLoading: false });
          return true;
        }
        
        set({ error: 'Invalid email or password', isLoading: false });
        return false;
      },

      signup: async (email: string, _password: string, name: string, role: UserRole) => {
        set({ isLoading: true, error: null });
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if email already exists
        const existingUser = mockUsers.find(u => u.email === email);
        if (existingUser) {
          set({ error: 'Email already registered', isLoading: false });
          return false;
        }
        
        const newUser: User = {
          id: `user-${Date.now()}`,
          uid: `LP-${Date.now().toString().slice(-3)}-AFR-KE`,
          email,
          name,
          role,
          verificationLevel: 'unverified',
          country: 'Kenya',
          hackathonsAttended: [],
          hackathonsWon: [],
          collaborations: [],
          createdAt: new Date().toISOString(),
        };
        
        set({ user: newUser, isAuthenticated: true, isLoading: false });
        return true;
      },

      logout: () => {
        set({ user: null, isAuthenticated: false, error: null });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'launch-pad-auth',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);
