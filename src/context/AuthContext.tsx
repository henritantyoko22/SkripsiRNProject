import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  AuthUser,
  GoogleAccountOption,
  signInWithGoogle,
  signInWithSelectedAccount,
  signOutGoogle,
} from '@/services/authService';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  signInWithAccount: (account: GoogleAccountOption) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const signIn = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const authenticatedUser = await signInWithGoogle();
      setUser(authenticatedUser);
    } catch (err: any) {
      const errorMessage = err?.message || 'Gagal masuk dengan Google. Silakan coba lagi.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signInWithAccount = useCallback(async (account: GoogleAccountOption) => {
    try {
      setIsLoading(true);
      setError(null);
      const authenticatedUser = await signInWithSelectedAccount(account);
      setUser(authenticatedUser);
    } catch (err: any) {
      const errorMessage = err?.message || 'Gagal masuk dengan akun yang dipilih.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setIsLoading(true);
      await signOutGoogle();
      setUser(null);
    } catch (err: any) {
      console.warn('Error saat sign out:', err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        signIn,
        signInWithAccount,
        signOut,
        clearError,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
