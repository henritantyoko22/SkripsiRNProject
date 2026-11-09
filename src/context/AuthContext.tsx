import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  AuthUser,
  signInWithGoogle,
  signInWithEmailPassword,
  signUpWithEmailPassword,
  signOutGoogle,
} from '@/services/authService';
import {
  saveUserSession,
  getUserSession,
  getUserSessionAsync,
  clearUserSession,
} from '@/services/storageService';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isInitialLoading: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // MMKV synchronous read: jika MMKV/memory sudah ada, langsung dapat user seketika
  const [user, setUser] = useState<AuthUser | null>(() => {
    return getUserSession();
  });
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(() => !user);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Verifikasi sesi dari MMKV / AsyncStorage saat aplikasi pertama kali dibuka (Cold Start)
  useEffect(() => {
    async function restoreSession() {
      try {
        const savedSession = await getUserSessionAsync();
        if (savedSession) {
          setUser(savedSession);
        }
      } catch (err) {
        console.warn('Gagal memulihkan sesi dari storage:', err);
      } finally {
        setIsInitialLoading(false);
      }
    }
    restoreSession();
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const signIn = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const authenticatedUser = await signInWithGoogle();
      // Simpan token & sesi ke storage agar bypass login saat keluar aplikasi
      saveUserSession(authenticatedUser);
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
      // Simpan token & sesi ke storage agar bypass login saat keluar aplikasi
      saveUserSession(authenticatedUser);
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
      // Simpan token & sesi ke storage agar bypass login saat keluar aplikasi
      saveUserSession(authenticatedUser);
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
    } catch (err: any) {
      console.warn('Error saat sign out:', err);
    } finally {
      // Hapus token dan sesi dari storage
      clearUserSession();
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isInitialLoading,
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
