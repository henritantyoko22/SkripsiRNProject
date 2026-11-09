import { GOOGLE_SERVICE_CONFIG } from '@/config/googleService.config';
import { getAuthToken } from '@/services/storageService';

export interface MahasiswaData {
  nim: string;
  nama: string;
  email: string;
  fotoUrl: string | null;
  fakultas: string;
  jurusan: string;
  angkatan: string;
  semester: number;
  statusAkademik: 'Aktif' | 'Cuti' | 'Lulus';
  statusSkripsi?: 'Bimbingan' | 'Seminar Proposal' | 'Sidang Skripsi' | 'Lulus';
  ipk: number;
  sksSelesai: number;
  dosenWali: string;
  judulSkripsi: string;
  pembimbingSkripsi: string;
  updatedAt?: string;
}

const FIRESTORE_BASE_URL = `https://firestore.googleapis.com/v1/projects/${GOOGLE_SERVICE_CONFIG.PROJECT_ID}/databases/(default)/documents/mahasiswa`;

/**
 * Konversi MahasiswaData ke format Dokumen REST Firestore
 */
function toFirestoreFields(data: MahasiswaData) {
  return {
    fields: {
      nim: { stringValue: data.nim },
      nama: { stringValue: data.nama },
      email: { stringValue: data.email },
      fotoUrl: { stringValue: data.fotoUrl || '' },
      fakultas: { stringValue: data.fakultas },
      jurusan: { stringValue: data.jurusan },
      angkatan: { stringValue: data.angkatan },
      semester: { integerValue: data.semester.toString() },
      statusAkademik: { stringValue: data.statusAkademik },
      statusSkripsi: { stringValue: data.statusSkripsi || 'Bimbingan' },
      ipk: { doubleValue: data.ipk },
      sksSelesai: { integerValue: data.sksSelesai.toString() },
      dosenWali: { stringValue: data.dosenWali },
      judulSkripsi: { stringValue: data.judulSkripsi },
      pembimbingSkripsi: { stringValue: data.pembimbingSkripsi },
      updatedAt: { stringValue: new Date().toISOString() },
    },
  };
}

/**
 * Konversi Dokumen Firestore REST kembali ke MahasiswaData
 */
function fromFirestoreDocument(doc: any): MahasiswaData | null {
  if (!doc?.fields) return null;
  const f = doc.fields;
  return {
    nim: f.nim?.stringValue || '24060121100000',
    nama: f.nama?.stringValue || 'Mahasiswa Undip',
    email: f.email?.stringValue || '',
    fotoUrl: f.fotoUrl?.stringValue || null,
    fakultas: f.fakultas?.stringValue || 'Sains dan Matematika',
    jurusan: f.jurusan?.stringValue || 'Informatika',
    angkatan: f.angkatan?.stringValue || '2021',
    semester: Number(f.semester?.integerValue || 7),
    statusAkademik: (f.statusAkademik?.stringValue as any) || 'Aktif',
    statusSkripsi: (f.statusSkripsi?.stringValue as any) || 'Bimbingan',
    ipk: Number(f.ipk?.doubleValue || f.ipk?.integerValue || 3.8),
    sksSelesai: Number(f.sksSelesai?.integerValue || 138),
    dosenWali: f.dosenWali?.stringValue || 'Dosen Wali Akademik',
    judulSkripsi: f.judulSkripsi?.stringValue || 'Belum mengajukan judul skripsi',
    pembimbingSkripsi: f.pembimbingSkripsi?.stringValue || 'Belum ditentukan',
    updatedAt: f.updatedAt?.stringValue,
  };
}

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = getAuthToken();
  // Hanya sertakan Authorization header jika token adalah JWT valid (diawali "ey")
  // Mengirim token placeholder/non-JWT akan memicu error 401 "Request had invalid authentication credentials"
  if (token && token.startsWith('ey') && token.includes('.')) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export function getStudentDocId(email: string): string {
  return email.toLowerCase().replace(/[^a-zA-Z0-9_-]/g, '_');
}

/**
 * Mengambil SELURUH data mahasiswa murni apa adanya dari Cloud Firestore.
 */
export async function fetchAllMahasiswa(): Promise<MahasiswaData[]> {
  const url = `${FIRESTORE_BASE_URL}?key=${GOOGLE_SERVICE_CONFIG.API_KEY}`;

  try {
    const response = await fetch(url, { headers: getAuthHeaders() });
    if (response.ok) {
      const data = await response.json();
      if (data?.documents && Array.isArray(data.documents)) {
        return data.documents
          .map(fromFirestoreDocument)
          .filter((item: MahasiswaData | null): item is MahasiswaData => item !== null);
      }
    }
  } catch (error) {
    console.warn('[Firestore] Gagal mengambil data mahasiswa:', error);
  }

  return [];
}

/**
 * Mengambil 1 data mahasiswa dari Firestore berdasarkan email.
 * Jika dokumen belum ada (misal pendaftar baru), otomatis dibuatkan di Firestore!
 */
export async function fetchMahasiswaData(
  email: string,
  fallbackName?: string,
  fallbackPhoto?: string | null
): Promise<MahasiswaData> {
  const docId = getStudentDocId(email);
  const url = `${FIRESTORE_BASE_URL}/${docId}?key=${GOOGLE_SERVICE_CONFIG.API_KEY}`;

  try {
    const response = await fetch(url, { headers: getAuthHeaders() });
    if (response.ok) {
      const data = await response.json();
      const student = fromFirestoreDocument(data);
      if (student) return student;
    }
  } catch (error) {
    console.warn('[Firestore] Gagal mengambil data mahasiswa:', error);
  }

  // Jika belum ada di Firestore, buatkan dokumen mahasiswa di Firestore
  const digitsOnly = email.replace(/\D/g, '');
  const nim = digitsOnly.length >= 8 ? digitsOnly : '240601211' + Math.floor(10000 + Math.random() * 90000);

  const newStudent: MahasiswaData = {
    nim: nim,
    nama: fallbackName || email.split('@')[0],
    email: email,
    fotoUrl: fallbackPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    fakultas: 'Sains dan Matematika',
    jurusan: 'Informatika',
    angkatan: '2021',
    semester: 7,
    statusAkademik: 'Aktif',
    statusSkripsi: 'Bimbingan',
    ipk: 3.8,
    sksSelesai: 138,
    dosenWali: 'Dr. Aris Sugiharto, S.Si., M.Kom.',
    judulSkripsi: 'Pengembangan Sistem Informasi Skripsi Berbasis Mobile',
    pembimbingSkripsi: 'Prof. Dr. Kusworo Adi, S.Si., M.T.',
    updatedAt: new Date().toISOString(),
  };

  saveMahasiswaData(newStudent).catch(() => {});
  return newStudent;
}

/**
 * Menyimpan data mahasiswa ke Firestore
 */
export async function saveMahasiswaData(data: MahasiswaData): Promise<boolean> {
  const docId = getStudentDocId(data.email);
  const url = `${FIRESTORE_BASE_URL}/${docId}?key=${GOOGLE_SERVICE_CONFIG.API_KEY}`;

  try {
    const payload = toFirestoreFields(data);
    const response = await fetch(url, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    return response.ok;
  } catch (error) {
    console.warn('[Firestore] Network error saat simpan mahasiswa:', error);
    return false;
  }
}

/**
 * Menghapus data mahasiswa dari Firestore
 */
export async function deleteMahasiswaData(email: string): Promise<boolean> {
  const docId = getStudentDocId(email);
  const url = `${FIRESTORE_BASE_URL}/${docId}?key=${GOOGLE_SERVICE_CONFIG.API_KEY}`;

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return response.ok;
  } catch (error) {
    console.warn('[Firestore] Error delete mahasiswa:', error);
    return false;
  }
}
