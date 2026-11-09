import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthUser } from '@/services/authService';

const AUTH_STORAGE_ID = 'undip-auth-storage';
const TOKEN_KEY = '@undip_auth_token';
const USER_KEY = '@undip_user_session';

let mmkvInstance: any = null;
let isMMKVAvailable = false;

// Inisialisasi MMKV dengan proteksi dinamis (try-catch)
// Mencegah crash "Failed to get NitroModules" jika dijalankan di Expo Go atau environment tanpa NitroModules native linking
try {
  const mmkvModule = require('react-native-mmkv');
  if (mmkvModule && typeof mmkvModule.createMMKV === 'function') {
    const instance = mmkvModule.createMMKV({ id: AUTH_STORAGE_ID });
    // Verifikasi bahwa native JSI/NitroModules benar-benar aktif
    instance.getString('__nitro_check__');
    mmkvInstance = instance;
    isMMKVAvailable = true;
    console.log('[Storage] MMKV Native C++ Engine berhasil diinisialisasi.');
  }
} catch {
  // Ditangkap saat berjalan di Expo Go atau sebelum native prebuild dijalankan
  console.log('[Storage] MMKV NitroModules tidak terpasang di runtime ini (misal Expo Go). Beralih ke AsyncStorage engine.');
  mmkvInstance = null;
  isMMKVAvailable = false;
}

const memoryCache = new Map<string, string>();

/**
 * Simpan token autentikasi ke MMKV dan AsyncStorage
 */
export async function saveAuthTokenAsync(token: string): Promise<void> {
  if (!token) return;
  memoryCache.set(TOKEN_KEY, token);

  if (isMMKVAvailable && mmkvInstance) {
    try {
      mmkvInstance.set(TOKEN_KEY, token);
    } catch {}
  }

  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (err) {
    console.warn('[Storage] Gagal menyimpan token ke AsyncStorage:', err);
  }
}

export function saveAuthToken(token: string): void {
  saveAuthTokenAsync(token).catch(() => {});
}

/**
 * Ambil token autentikasi (sinkron via MMKV / memoryCache)
 */
export function getAuthToken(): string | null {
  if (isMMKVAvailable && mmkvInstance) {
    try {
      const val = mmkvInstance.getString(TOKEN_KEY);
      if (val) return val;
    } catch {}
  }
  return memoryCache.get(TOKEN_KEY) ?? null;
}

/**
 * Simpan seluruh sesi user dan token ke MMKV + AsyncStorage
 * Memastikan bypass login berfungsi ketika keluar aplikasi
 */
export async function saveUserSessionAsync(user: AuthUser): Promise<void> {
  try {
    const raw = JSON.stringify(user);
    memoryCache.set(USER_KEY, raw);

    if (user.idToken) {
      memoryCache.set(TOKEN_KEY, user.idToken);
    }

    if (isMMKVAvailable && mmkvInstance) {
      try {
        mmkvInstance.set(USER_KEY, raw);
        if (user.idToken) {
          mmkvInstance.set(TOKEN_KEY, user.idToken);
        }
      } catch {}
    }

    await AsyncStorage.setItem(USER_KEY, raw);
    if (user.idToken) {
      await AsyncStorage.setItem(TOKEN_KEY, user.idToken);
    }
  } catch (err) {
    console.warn('[Storage] Gagal menyimpan sesi user:', err);
  }
}

export function saveUserSession(user: AuthUser): void {
  saveUserSessionAsync(user).catch(() => {});
}

/**
 * Ambil sesi user secara sinkron (instant auto-login jika tersedia di MMKV / memory)
 */
export function getUserSession(): AuthUser | null {
  if (isMMKVAvailable && mmkvInstance) {
    try {
      const raw = mmkvInstance.getString(USER_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AuthUser;
        if (parsed && parsed.email && parsed.role) return parsed;
      }
    } catch {}
  }

  const inMem = memoryCache.get(USER_KEY);
  if (inMem) {
    try {
      const parsed = JSON.parse(inMem) as AuthUser;
      if (parsed && parsed.email && parsed.role) return parsed;
    } catch {}
  }

  return null;
}

/**
 * Ambil sesi user secara asinkron (membaca dari MMKV atau AsyncStorage saat cold start)
 */
export async function getUserSessionAsync(): Promise<AuthUser | null> {
  // 1. Coba baca sinkron dulu
  const syncData = getUserSession();
  if (syncData) return syncData;

  // 2. Baca dari AsyncStorage (fallback terpercaya di Expo Go)
  try {
    const raw = await AsyncStorage.getItem(USER_KEY);
    if (raw) {
      memoryCache.set(USER_KEY, raw);
      const parsed = JSON.parse(raw) as AuthUser;
      if (parsed && parsed.email && parsed.role) {
        if (parsed.idToken) {
          memoryCache.set(TOKEN_KEY, parsed.idToken);
        }
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[Storage] Gagal memulihkan sesi dari AsyncStorage:', err);
  }

  return null;
}

/**
 * Hapus seluruh sesi user dan token saat logout
 */
export async function clearUserSessionAsync(): Promise<void> {
  memoryCache.delete(USER_KEY);
  memoryCache.delete(TOKEN_KEY);

  if (isMMKVAvailable && mmkvInstance) {
    try {
      mmkvInstance.remove(USER_KEY);
      mmkvInstance.remove(TOKEN_KEY);
    } catch {}
  }

  try {
    await AsyncStorage.removeItem(USER_KEY);
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (err) {
    console.warn('[Storage] Gagal menghapus sesi dari AsyncStorage:', err);
  }
}

export function clearUserSession(): void {
  clearUserSessionAsync().catch(() => {});
}
