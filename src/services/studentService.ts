import { GOOGLE_SERVICE_CONFIG } from '@/config/googleService.config';

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
  ipk: number;
  sksSelesai: number;
  dosenWali: string;
  judulSkripsi: string;
  pembimbingSkripsi: string;
  updatedAt?: string;
}

const FIRESTORE_BASE_URL = `https://firestore.googleapis.com/v1/projects/${GOOGLE_SERVICE_CONFIG.PROJECT_ID}/databases/(default)/documents/mahasiswa`;

/**
 * Membuat data template mahasiswa default berdasarkan akun Google yang masuk
 */
export function getDefaultMahasiswa(email: string, name: string | null, photoUrl: string | null): MahasiswaData {
  // Generate perkiraan NIM dari email atau default
  const emailUsername = email.split('@')[0] || '24060120140000';
  const digitsOnly = emailUsername.replace(/\D/g, '');
  const nim = digitsOnly.length >= 8 ? digitsOnly : '24060121130089';

  return {
    nim: nim,
    nama: name || 'Mahasiswa Undip',
    email: email,
    fotoUrl: photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
    fakultas: 'Sains dan Matematika',
    jurusan: 'Informatika',
    angkatan: '2021',
    semester: 7,
    statusAkademik: 'Aktif',
    ipk: 3.84,
    sksSelesai: 136,
    dosenWali: 'Dr. Aris Sugiharto, S.Si., M.Kom.',
    judulSkripsi: 'Pengembangan Aplikasi Mobile Skripsi dengan Autentikasi Google dan Cloud Firestore',
    pembimbingSkripsi: 'Prof. Dr. Kusworo Adi, S.Si., M.T.',
    updatedAt: new Date().toISOString(),
  };
}

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
 * Konversi Document Firestore REST kembali ke MahasiswaData
 */
function fromFirestoreDocument(doc: any): MahasiswaData | null {
  if (!doc?.fields) return null;
  const f = doc.fields;
  return {
    nim: f.nim?.stringValue || '24060121130089',
    nama: f.nama?.stringValue || 'Mahasiswa',
    email: f.email?.stringValue || '',
    fotoUrl: f.fotoUrl?.stringValue || null,
    fakultas: f.fakultas?.stringValue || 'Sains dan Matematika',
    jurusan: f.jurusan?.stringValue || 'Informatika',
    angkatan: f.angkatan?.stringValue || '2021',
    semester: Number(f.semester?.integerValue || 7),
    statusAkademik: (f.statusAkademik?.stringValue as any) || 'Aktif',
    ipk: Number(f.ipk?.doubleValue || f.ipk?.integerValue || 3.84),
    sksSelesai: Number(f.sksSelesai?.integerValue || 136),
    dosenWali: f.dosenWali?.stringValue || 'Dosen Wali Akademik',
    judulSkripsi: f.judulSkripsi?.stringValue || '',
    pembimbingSkripsi: f.pembimbingSkripsi?.stringValue || '',
    updatedAt: f.updatedAt?.stringValue,
  };
}

/**
 * Sanitasi email untuk dijadikan Document ID Firestore (karena karakter khusus seperti '.' disanitasi)
 */
export function getStudentDocId(email: string): string {
  return email.toLowerCase().replace(/[^a-zA-Z0-9_-]/g, '_');
}

/**
 * Mengambil data mahasiswa dari Firestore
 */
export async function fetchMahasiswaData(
  email: string,
  fallbackName: string | null = null,
  fallbackPhoto: string | null = null
): Promise<MahasiswaData> {
  const docId = getStudentDocId(email);
  const url = `${FIRESTORE_BASE_URL}/${docId}?key=${GOOGLE_SERVICE_CONFIG.API_KEY}`;

  try {
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      const parsed = fromFirestoreDocument(data);
      if (parsed) return parsed;
    }
  } catch (error) {
    console.warn('[Firestore] Gagal mengambil data via REST API:', error);
  }

  // Jika belum ada dokumen di Firestore atau baru pertama login, gunakan default
  const defaultData = getDefaultMahasiswa(email, fallbackName, fallbackPhoto);
  // Coba simpan data default ke Firestore secara background
  saveMahasiswaData(defaultData).catch(() => {});
  return defaultData;
}

/**
 * Menyimpan atau memperbarui data mahasiswa ke Firestore
 */
export async function saveMahasiswaData(data: MahasiswaData): Promise<boolean> {
  const docId = getStudentDocId(data.email);
  const url = `${FIRESTORE_BASE_URL}/${docId}?key=${GOOGLE_SERVICE_CONFIG.API_KEY}`;

  try {
    const payload = toFirestoreFields(data);
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log('[Firestore] Data mahasiswa berhasil disimpan untuk:', data.email);
      return true;
    } else {
      const errText = await response.text();
      console.warn('[Firestore] Response non-OK saat menyimpan:', errText);
    }
  } catch (error) {
    console.warn('[Firestore] Error network saat menyimpan data mahasiswa:', error);
  }
  return false;
}
