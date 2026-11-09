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

export const INITIAL_MAHASISWA_LIST: MahasiswaData[] = [
  {
    nim: '24060121120034',
    nama: 'Dimas Prasetyo',
    email: 'dimas.prasetyo@students.undip.ac.id',
    fotoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    fakultas: 'Sains dan Matematika',
    jurusan: 'Informatika',
    angkatan: '2021',
    semester: 7,
    statusAkademik: 'Aktif',
    statusSkripsi: 'Bimbingan',
    ipk: 3.86,
    sksSelesai: 138,
    dosenWali: 'Dr. Aris Sugiharto, S.Si., M.Kom.',
    judulSkripsi: 'Klasifikasi Kanker Kulit Menggunakan Convolutional Neural Network Berbasis Citra Dermoskopi',
    pembimbingSkripsi: 'Dr. Aris Sugiharto, S.Si., M.Kom.',
    updatedAt: new Date().toISOString(),
  },
  {
    nim: '24060121130078',
    nama: 'Annisa Rahmawati',
    email: 'annisa.rahma@students.undip.ac.id',
    fotoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    fakultas: 'Sains dan Matematika',
    jurusan: 'Informatika',
    angkatan: '2021',
    semester: 7,
    statusAkademik: 'Aktif',
    statusSkripsi: 'Seminar Proposal',
    ipk: 3.92,
    sksSelesai: 140,
    dosenWali: 'Prof. Dr. Kusworo Adi, S.Si., M.T.',
    judulSkripsi: 'Sistem Rekomendasi Pemilihan Topik Skripsi Menggunakan Algoritma Content-Based Filtering',
    pembimbingSkripsi: 'Prof. Dr. Kusworo Adi, S.Si., M.T.',
    updatedAt: new Date().toISOString(),
  },
  {
    nim: '24060121140102',
    nama: 'Budi Santoso',
    email: 'budi.santoso@students.undip.ac.id',
    fotoUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
    fakultas: 'Sains dan Matematika',
    jurusan: 'Informatika',
    angkatan: '2021',
    semester: 8,
    statusAkademik: 'Aktif',
    statusSkripsi: 'Sidang Skripsi',
    ipk: 3.75,
    sksSelesai: 144,
    dosenWali: 'Dr. Retno Kusumaningrum, S.Si., M.Kom.',
    judulSkripsi: 'Implementasi Smart Contract Blockchain untuk Verifikasi Transkrip Akademik Digital',
    pembimbingSkripsi: 'Dr. Retno Kusumaningrum, S.Si., M.Kom.',
    updatedAt: new Date().toISOString(),
  },
  {
    nim: '24060121130055',
    nama: 'Siti Nurhaliza',
    email: 'siti.nurhaliza@students.undip.ac.id',
    fotoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    fakultas: 'Sains dan Matematika',
    jurusan: 'Informatika',
    angkatan: '2021',
    semester: 7,
    statusAkademik: 'Aktif',
    statusSkripsi: 'Bimbingan',
    ipk: 3.81,
    sksSelesai: 136,
    dosenWali: 'Sukmawati Nur Endah, S.Si., M.Kom.',
    judulSkripsi: 'Analisis Sentimen Opini Mahasiswa Mengenai Pembelajaran Hybrid Menggunakan IndoBERT',
    pembimbingSkripsi: 'Sukmawati Nur Endah, S.Si., M.Kom.',
    updatedAt: new Date().toISOString(),
  },
  {
    nim: '24060120140021',
    nama: 'Fajar Ramadhan',
    email: 'fajar.ramadhan@students.undip.ac.id',
    fotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    fakultas: 'Sains dan Matematika',
    jurusan: 'Informatika',
    angkatan: '2020',
    semester: 9,
    statusAkademik: 'Lulus',
    statusSkripsi: 'Lulus',
    ipk: 3.68,
    sksSelesai: 144,
    dosenWali: 'Ragil Saputra, S.Si., M.Cs.',
    judulSkripsi: 'Monitoring Kualitas Udara Laboratorium Berbasis IoT Menggunakan ESP32 dan Cloud Firestore',
    pembimbingSkripsi: 'Ragil Saputra, S.Si., M.Cs.',
    updatedAt: new Date().toISOString(),
  },
  {
    nim: '24060121130012',
    nama: 'Rizky Pratama',
    email: 'rizky.pratama@students.undip.ac.id',
    fotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    fakultas: 'Sains dan Matematika',
    jurusan: 'Informatika',
    angkatan: '2021',
    semester: 7,
    statusAkademik: 'Aktif',
    statusSkripsi: 'Bimbingan',
    ipk: 3.79,
    sksSelesai: 138,
    dosenWali: 'Dr. Indra Waspada, S.T., M.T.',
    judulSkripsi: 'Deteksi Objek Kendaraan pada Kamera CCTV Lalu Lintas Menggunakan Algoritma YOLOv8',
    pembimbingSkripsi: 'Dr. Indra Waspada, S.T., M.T.',
    updatedAt: new Date().toISOString(),
  },
  {
    nim: '24060121140045',
    nama: 'Nabila Putri Santoso',
    email: 'nabila.putri@students.undip.ac.id',
    fotoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
    fakultas: 'Sains dan Matematika',
    jurusan: 'Informatika',
    angkatan: '2021',
    semester: 7,
    statusAkademik: 'Aktif',
    statusSkripsi: 'Seminar Proposal',
    ipk: 3.88,
    sksSelesai: 140,
    dosenWali: 'Khadijah, S.Kom., M.Cs.',
    judulSkripsi: 'Rancang Bangun Aplikasi Mobile Konsultasi Kesehatan Mental Mahasiswa Berbasis React Native',
    pembimbingSkripsi: 'Khadijah, S.Kom., M.Cs.',
    updatedAt: new Date().toISOString(),
  },
  {
    nim: '24060121120067',
    nama: 'Muhammad Alfarizi',
    email: 'm.alfarizi@students.undip.ac.id',
    fotoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    fakultas: 'Sains dan Matematika',
    jurusan: 'Informatika',
    angkatan: '2021',
    semester: 8,
    statusAkademik: 'Aktif',
    statusSkripsi: 'Sidang Skripsi',
    ipk: 3.72,
    sksSelesai: 142,
    dosenWali: 'Panji Wisnu Wirawan, S.T., M.T.',
    judulSkripsi: 'Optimasi Rute Distribusi Logistik Menggunakan Algoritma Genetika dan Google Maps API',
    pembimbingSkripsi: 'Panji Wisnu Wirawan, S.T., M.T.',
    updatedAt: new Date().toISOString(),
  },
  {
    nim: '24060121130089',
    nama: 'Dewi Lestari',
    email: 'dewi.lestari@students.undip.ac.id',
    fotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    fakultas: 'Sains dan Matematika',
    jurusan: 'Informatika',
    angkatan: '2021',
    semester: 7,
    statusAkademik: 'Aktif',
    statusSkripsi: 'Bimbingan',
    ipk: 3.85,
    sksSelesai: 136,
    dosenWali: 'Nurdin Bahtiar, S.Si., M.T.',
    judulSkripsi: 'Pengembangan Sistem Informasi Geografis Pemetaan Daerah Rawan Banjir Kota Semarang',
    pembimbingSkripsi: 'Nurdin Bahtiar, S.Si., M.T.',
    updatedAt: new Date().toISOString(),
  },
  {
    nim: '24060121140090',
    nama: 'Ahmad Fauzan Hidayat',
    email: 'ahmad.fauzan@students.undip.ac.id',
    fotoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
    fakultas: 'Sains dan Matematika',
    jurusan: 'Informatika',
    angkatan: '2021',
    semester: 7,
    statusAkademik: 'Aktif',
    statusSkripsi: 'Seminar Proposal',
    ipk: 3.91,
    sksSelesai: 138,
    dosenWali: 'Dr. Aris Puji Widodo, S.Si., M.T.',
    judulSkripsi: 'Penerapan Algoritma Deep Learning LSTM untuk Prediksi Tren Harga Saham Sektor Teknologi',
    pembimbingSkripsi: 'Dr. Aris Puji Widodo, S.Si., M.T.',
    updatedAt: new Date().toISOString(),
  },
  {
    nim: '24060120140018',
    nama: 'Citra Kirana Wulandari',
    email: 'citra.kirana@students.undip.ac.id',
    fotoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    fakultas: 'Sains dan Matematika',
    jurusan: 'Informatika',
    angkatan: '2020',
    semester: 9,
    statusAkademik: 'Lulus',
    statusSkripsi: 'Lulus',
    ipk: 3.94,
    sksSelesai: 144,
    dosenWali: 'Helmie Arif Wibawa, S.Si., M.Cs.',
    judulSkripsi: 'Sistem Presensi Mahasiswa Berbasis Face Recognition Menggunakan FaceNet pada Android',
    pembimbingSkripsi: 'Helmie Arif Wibawa, S.Si., M.Cs.',
    updatedAt: new Date().toISOString(),
  },
  {
    nim: '24060121120054',
    nama: 'Yoga Saputra Nugroho',
    email: 'yoga.saputra@students.undip.ac.id',
    fotoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
    fakultas: 'Sains dan Matematika',
    jurusan: 'Informatika',
    angkatan: '2021',
    semester: 7,
    statusAkademik: 'Aktif',
    statusSkripsi: 'Bimbingan',
    ipk: 3.74,
    sksSelesai: 136,
    dosenWali: 'Dr. Retno Kusumaningrum, S.Si., M.Kom.',
    judulSkripsi: 'Analisis Keamanan Server Kampus Menggunakan Web Application Firewall (WAF) ModSecurity',
    pembimbingSkripsi: 'Dr. Retno Kusumaningrum, S.Si., M.Kom.',
    updatedAt: new Date().toISOString(),
  },
];

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
 * Konversi Document Firestore REST kembali ke MahasiswaData
 */
function fromFirestoreDocument(doc: any): MahasiswaData | null {
  if (!doc?.fields) return null;
  const f = doc.fields;
  return {
    nim: f.nim?.stringValue || '24060121130000',
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
    sksSelesai: Number(f.sksSelesai?.integerValue || 136),
    dosenWali: f.dosenWali?.stringValue || 'Dosen Wali Akademik',
    judulSkripsi: f.judulSkripsi?.stringValue || '',
    pembimbingSkripsi: f.pembimbingSkripsi?.stringValue || '',
    updatedAt: f.updatedAt?.stringValue,
  };
}

export function getStudentDocId(email: string): string {
  return email.toLowerCase().replace(/[^a-zA-Z0-9_-]/g, '_');
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
 * Menyimpan seluruh data awal (12 mahasiswa) langsung ke Cloud Firestore
 */
export async function syncInitialDataToFirestore(): Promise<void> {
  await Promise.allSettled(
    INITIAL_MAHASISWA_LIST.map((mhs) => saveMahasiswaData(mhs))
  );
}

/**
 * Mengambil SELURUH data mahasiswa dari database Firestore.
 * Jika data di Firestore masih kurang dari 10 (misal baru ada 1), otomatis menyinkronkan
 * daftar lengkap 12 data mahasiswa ke Firestore sehingga tabel selalu lengkap!
 */
export async function fetchAllMahasiswa(): Promise<MahasiswaData[]> {
  const url = `${FIRESTORE_BASE_URL}?key=${GOOGLE_SERVICE_CONFIG.API_KEY}`;

  try {
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      if (data?.documents && Array.isArray(data.documents) && data.documents.length > 0) {
        const list = data.documents
          .map(fromFirestoreDocument)
          .filter((item: MahasiswaData | null): item is MahasiswaData => item !== null);

        // Jika data di Firestore sudah >= 10, kembalikan data tersebut
        if (list.length >= 10) {
          return list;
        }

        // Jika data di Firestore masih kurang dari 10 (misal baru ada 1 akun login),
        // gabungkan dengan data template dan simpan sisanya ke Firestore!
        const existingEmails = new Set(list.map((m: MahasiswaData) => m.email.toLowerCase()));
        const missing = INITIAL_MAHASISWA_LIST.filter(
          (m: MahasiswaData) => !existingEmails.has(m.email.toLowerCase())
        );

        // Upload mahasiswa yang belum ada ke Firestore di background
        missing.forEach((m: MahasiswaData) => saveMahasiswaData(m).catch(() => {}));

        return [...list, ...missing];
      }
    }
  } catch (error) {
    console.warn('[Firestore] Gagal fetch all mahasiswa via REST:', error);
  }

  // Jika Firestore belum terisi sama sekali, upload seluruh 12 data ke Firestore
  syncInitialDataToFirestore().catch(() => {});
  return INITIAL_MAHASISWA_LIST;
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
