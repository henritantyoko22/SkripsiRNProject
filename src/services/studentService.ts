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
    nim: f.nim?.stringValue || '-',
    nama: f.nama?.stringValue || '-',
    email: f.email?.stringValue || '',
    fotoUrl: f.fotoUrl?.stringValue || null,
    fakultas: f.fakultas?.stringValue || 'Sains dan Matematika',
    jurusan: f.jurusan?.stringValue || 'Informatika',
    angkatan: f.angkatan?.stringValue || '2021',
    semester: Number(f.semester?.integerValue || 7),
    statusAkademik: (f.statusAkademik?.stringValue as any) || 'Aktif',
    statusSkripsi: (f.statusSkripsi?.stringValue as any) || 'Bimbingan',
    ipk: Number(f.ipk?.doubleValue || f.ipk?.integerValue || 0),
    sksSelesai: Number(f.sksSelesai?.integerValue || 0),
    dosenWali: f.dosenWali?.stringValue || '-',
    judulSkripsi: f.judulSkripsi?.stringValue || '-',
    pembimbingSkripsi: f.pembimbingSkripsi?.stringValue || '-',
    updatedAt: f.updatedAt?.stringValue,
  };
}

export function getStudentDocId(email: string): string {
  return email.toLowerCase().replace(/[^a-zA-Z0-9_-]/g, '_');
}

/**
 * Mengambil SELURUH data mahasiswa murni apa adanya dari database Cloud Firestore.
 * Jika ada 1 ya tampilkan 1, jika ada 5 ya tampilkan 5, jika kosong ya tampilkan kosong.
 */
export async function fetchAllMahasiswa(): Promise<MahasiswaData[]> {
  const url = `${FIRESTORE_BASE_URL}?key=${GOOGLE_SERVICE_CONFIG.API_KEY}`;

  try {
    const response = await fetch(url);
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
 * Mengambil 1 data mahasiswa berdasarkan email dari Firestore
 */
export async function fetchMahasiswaData(email: string): Promise<MahasiswaData | null> {
  const docId = getStudentDocId(email);
  const url = `${FIRESTORE_BASE_URL}/${docId}?key=${GOOGLE_SERVICE_CONFIG.API_KEY}`;

  try {
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      return fromFirestoreDocument(data);
    }
  } catch (error) {
    console.warn('[Firestore] Gagal mengambil data mahasiswa:', error);
  }

  return null;
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
      headers: {
        'Content-Type': 'application/json',
      },
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
    const response = await fetch(url, { method: 'DELETE' });
    return response.ok;
  } catch (error) {
    console.warn('[Firestore] Error delete mahasiswa:', error);
    return false;
  }
}
