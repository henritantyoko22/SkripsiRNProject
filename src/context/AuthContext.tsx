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
  clearUserSession,
} from '@/services/storageService';

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
  // MMKV synchronous read: langsung bypass login di frame render pertama tanpa jeda/flicker
  const [user, setUser] = useState<AuthUser | null>(() => {
    return getUserSession();
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Verifikasi dan sinkronisasi sesi dari MMKV saat aplikasi dimuat
  useEffect(() => {
    const savedSession = getUserSession();
    if (savedSession && (!user || user.id !== savedSession.id)) {
      setUser(savedSession);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const signIn = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const authenticatedUser = await signInWithGoogle();
      // Simpan token & sesi ke MMKV agar bypass login saat keluar aplikasi
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
      // Simpan token & sesi ke MMKV agar bypass login saat keluar aplikasi
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
      // Simpan token & sesi ke MMKV agar bypass login saat keluar aplikasi
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
      // Hapus token dan sesi dari MMKV
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
