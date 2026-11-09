import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  AuthUser,
  signInWithGoogle,
  signInWithEmailPassword,
  signUpWithEmailPassword,
  signOutGoogle,
} from '@/services/authService';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (name: string, email: string, password: string) => Promise<void>;
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

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const authenticatedUser = await signInWithEmailPassword(email, password);
      setUser(authenticatedUser);
    } catch (err: any) {
      setError(err?.message || 'Gagal masuk. Periksa kembali email dan password Anda.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signUpWithEmail = useCallback(async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const authenticatedUser = await signUpWithEmailPassword(name, email, password);
      setUser(authenticatedUser);
    } catch (err: any) {
      setError(err?.message || 'Gagal mendaftarkan akun baru.');
      throw err;
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
        signInWithEmail,
        signUpWithEmail,
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
