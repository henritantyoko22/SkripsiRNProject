import { GOOGLE_SERVICE_CONFIG } from '@/config/googleService.config';
import { getAuthToken } from '@/services/storageService';

export interface UserAccount {
  uid: string;
  nama: string;
  email: string;
  role: 'admin' | 'user';
  nim?: string;
  status: 'Aktif' | 'Nonaktif';
  createdAt: string;
  lastLogin?: string;
}

const FIRESTORE_USERS_URL = `https://firestore.googleapis.com/v1/projects/${GOOGLE_SERVICE_CONFIG.PROJECT_ID}/databases/(default)/documents/users`;

export function getUserDocId(email: string): string {
  return email.toLowerCase().replace(/[^a-zA-Z0-9_-]/g, '_');
}

function getSafeHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = getAuthToken();
  // Hanya sertakan Authorization jika token adalah JWT valid (diawali "ey")
  if (token && token.startsWith('ey') && token.includes('.')) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

function toFirestoreUserFields(user: UserAccount) {
  return {
    fields: {
      uid: { stringValue: user.uid },
      nama: { stringValue: user.nama },
      email: { stringValue: user.email },
      role: { stringValue: user.role },
      nim: { stringValue: user.nim || '' },
      status: { stringValue: user.status || 'Aktif' },
      createdAt: { stringValue: user.createdAt || new Date().toISOString() },
      lastLogin: { stringValue: user.lastLogin || new Date().toISOString() },
    },
  };
}

function fromFirestoreUserDoc(doc: any): UserAccount | null {
  if (!doc?.fields) return null;
  const f = doc.fields;
  return {
    uid: f.uid?.stringValue || doc.name?.split('/').pop() || 'usr_' + Date.now(),
    nama: f.nama?.stringValue || 'Pengguna',
    email: f.email?.stringValue || '',
    role: (f.role?.stringValue === 'admin' ? 'admin' : 'user') as 'admin' | 'user',
    nim: f.nim?.stringValue || undefined,
    status: (f.status?.stringValue === 'Nonaktif' ? 'Nonaktif' : 'Aktif') as 'Aktif' | 'Nonaktif',
    createdAt: f.createdAt?.stringValue || new Date().toISOString(),
    lastLogin: f.lastLogin?.stringValue,
  };
}

/**
 * Menyimpan / memperbarui dokumen user di koleksi 'users' Cloud Firestore
 */
export async function saveUserToFirestore(user: UserAccount): Promise<boolean> {
  const docId = getUserDocId(user.email);
  const url = `${FIRESTORE_USERS_URL}/${docId}?key=${GOOGLE_SERVICE_CONFIG.API_KEY}`;

  try {
    const payload = toFirestoreUserFields(user);
    const response = await fetch(url, {
      method: 'PATCH',
      headers: getSafeHeaders(),
      body: JSON.stringify(payload),
    });
    return response.ok;
  } catch (err) {
    console.warn('[Firestore users] Gagal menyimpan user:', err);
    return false;
  }
}

/**
 * Mengambil data user dari koleksi 'users' Cloud Firestore berdasarkan email.
 * Jika belum ada di Firestore, otomatis diinisialisasi berdasarkan email:
 * - Email admin (henritantyoko@..., admin@..., dosen...) -> role 'admin'
 * - Email mahasiswa lainnya -> role 'user'
 */
export async function fetchUserFromFirestore(email: string, fallbackName?: string): Promise<UserAccount> {
  const docId = getUserDocId(email);
  const url = `${FIRESTORE_USERS_URL}/${docId}?key=${GOOGLE_SERVICE_CONFIG.API_KEY}`;

  try {
    const response = await fetch(url, { headers: getSafeHeaders() });
    if (response.ok) {
      const data = await response.json();
      const existingUser = fromFirestoreUserDoc(data);
      if (existingUser) {
        // Update last login
        existingUser.lastLogin = new Date().toISOString();
        saveUserToFirestore(existingUser).catch(() => {});
        return existingUser;
      }
    }
  } catch (err) {
    console.warn('[Firestore users] Gagal fetch user:', err);
  }

  // Tentukan default role jika belum terdaftar
  const lower = email.toLowerCase().trim();
  const isAdmin =
    lower.startsWith('henritantyoko') ||
    lower.includes('admin') ||
    lower.includes('dosen') ||
    lower.includes('kaprodi');

  const newUser: UserAccount = {
    uid: 'usr_' + Date.now(),
    nama: fallbackName || email.split('@')[0],
    email: email,
    role: isAdmin ? 'admin' : 'user',
    status: 'Aktif',
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  };

  // Simpan ke Firestore koleksi 'users'
  saveUserToFirestore(newUser).catch(() => {});
  return newUser;
}

/**
 * Mengambil SELURUH pengguna dari koleksi 'users' Cloud Firestore untuk User Management
 */
export async function fetchAllUsers(): Promise<UserAccount[]> {
  const url = `${FIRESTORE_USERS_URL}?key=${GOOGLE_SERVICE_CONFIG.API_KEY}`;

  try {
    const response = await fetch(url, { headers: getSafeHeaders() });
    if (response.ok) {
      const data = await response.json();
      if (data?.documents && Array.isArray(data.documents)) {
        return data.documents
          .map(fromFirestoreUserDoc)
          .filter((u: UserAccount | null): u is UserAccount => u !== null && Boolean(u.email));
      }
    }
  } catch (err) {
    console.warn('[Firestore users] Gagal fetch all users:', err);
  }

  return [];
}

/**
 * Memperbarui Role pengguna (Admin dapat mengubah role user lain menjadi admin atau sebaliknya)
 */
export async function updateUserRole(email: string, newRole: 'admin' | 'user'): Promise<boolean> {
  const docId = getUserDocId(email);
  const url = `${FIRESTORE_USERS_URL}/${docId}?updateMask.fieldPaths=role&key=${GOOGLE_SERVICE_CONFIG.API_KEY}`;

  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: getSafeHeaders(),
      body: JSON.stringify({
        fields: {
          role: { stringValue: newRole },
        },
      }),
    });
    return response.ok;
  } catch (err) {
    console.warn('[Firestore users] Gagal update role:', err);
    return false;
  }
}
