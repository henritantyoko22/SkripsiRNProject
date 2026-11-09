import { createMMKV } from 'react-native-mmkv';
import { AuthUser } from '@/services/authService';

const AUTH_STORAGE_ID = 'undip-auth-storage';
const TOKEN_KEY = 'auth_id_token';
const USER_KEY = 'auth_user_session';

// Interface abstraksi penyimpanan
interface StorageEngine {
  getString: (key: string) => string | undefined;
  set: (key: string, value: string) => void;
  remove: (key: string) => void;
  clearAll: () => void;
}

let mmkvInstance: any = null;

// Inisialisasi MMKV dengan proteksi aman (fallback memory / localStorage jika di web/simulator)
try {
  mmkvInstance = createMMKV({
    id: AUTH_STORAGE_ID,
  });
} catch (err) {
  console.warn('[MMKV] Native MMKV module tidak tersedia, menggunakan fallback in-memory/localStorage', err);
}

const fallbackMemory = new Map<string, string>();

export const authStorage: StorageEngine = {
  getString: (key: string): string | undefined => {
    if (mmkvInstance) {
      try {
        const val = mmkvInstance.getString(key);
        if (typeof val === 'string') return val;
      } catch (err) {
        console.warn(`[MMKV] Gagal membaca key "${key}":`, err);
      }
    }
    if (typeof localStorage !== 'undefined') {
      try {
        const item = localStorage.getItem(key);
        return item ?? undefined;
      } catch {}
    }
    return fallbackMemory.get(key);
  },

  set: (key: string, value: string): void => {
    if (mmkvInstance) {
      try {
        mmkvInstance.set(key, value);
        return;
      } catch (err) {
        console.warn(`[MMKV] Gagal menyimpan key "${key}":`, err);
      }
    }
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(key, value);
      } catch {}
    }
    fallbackMemory.set(key, value);
  },

  remove: (key: string): void => {
    if (mmkvInstance) {
      try {
        mmkvInstance.remove(key);
        return;
      } catch (err) {
        console.warn(`[MMKV] Gagal menghapus key "${key}":`, err);
      }
    }
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(key);
      } catch {}
    }
    fallbackMemory.delete(key);
  },

  clearAll: (): void => {
    if (mmkvInstance) {
      try {
        mmkvInstance.clearAll();
        return;
      } catch (err) {
        console.warn('[MMKV] Gagal clearAll:', err);
      }
    }
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      } catch {}
    }
    fallbackMemory.clear();
  },
};

/**
 * Menyimpan token autentikasi ke MMKV
 */
export function saveAuthToken(token: string): void {
  if (!token) return;
  authStorage.set(TOKEN_KEY, token);
}

/**
 * Mengambil token autentikasi dari MMKV
 */
export function getAuthToken(): string | null {
  return authStorage.getString(TOKEN_KEY) ?? null;
}

/**
 * Menyimpan seluruh data sesi user dan token ke MMKV agar bypass login saat aplikasi dibuka kembali
 */
export function saveUserSession(user: AuthUser): void {
  try {
    if (user.idToken) {
      saveAuthToken(user.idToken);
    }
    authStorage.set(USER_KEY, JSON.stringify(user));
  } catch (err) {
    console.warn('[MMKV] Gagal menyimpan sesi user:', err);
  }
}

/**
 * Mengambil data sesi user dari MMKV secara sinkron (instant auto-login tanpa jeda/flicker)
 */
export function getUserSession(): AuthUser | null {
  try {
    const raw = authStorage.getString(USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthUser;
    if (parsed && parsed.email && parsed.role) {
      return parsed;
    }
    return null;
  } catch (err) {
    console.warn('[MMKV] Gagal membaca sesi user:', err);
    return null;
  }
}

/**
 * Menghapus data sesi user dan token dari MMKV saat pengguna logout
 */
export function clearUserSession(): void {
  try {
    authStorage.remove(TOKEN_KEY);
    authStorage.remove(USER_KEY);
  } catch (err) {
    console.warn('[MMKV] Gagal membersihkan sesi user:', err);
  }
}
