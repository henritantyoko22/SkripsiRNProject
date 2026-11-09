import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import { useAuth } from '@/context/AuthContext';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, MaxContentWidth } from '@/constants/theme';
import {
  MahasiswaData,
  fetchMahasiswaData,
  saveMahasiswaData,
} from '@/services/studentService';

export function MahasiswaHomeView() {
  const { user, signOut, isLoading: isAuthLoading } = useAuth();
  const [studentData, setStudentData] = useState<MahasiswaData | null>(null);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  // Edit form state
  const [editNim, setEditNim] = useState('');
  const [editNama, setEditNama] = useState('');
  const [editJurusan, setEditJurusan] = useState('');
  const [editFakultas, setEditFakultas] = useState('');
  const [editJudul, setEditJudul] = useState('');

  const loadData = useCallback(async () => {
    if (!user?.email) return;
    try {
      const data = await fetchMahasiswaData(user.email, user.name || undefined, user.photoUrl);
      setStudentData(data);
      setEditNim(data.nim);
      setEditNama(data.nama);
      setEditJurusan(data.jurusan);
      setEditFakultas(data.fakultas);
      setEditJudul(data.judulSkripsi);
    } catch (err) {
      console.warn('Gagal memuat data mahasiswa:', err);
    } finally {
      setLoadingData(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleSaveEdit = async () => {
    if (!studentData) return;
    try {
      setSaving(true);
      const updated: MahasiswaData = {
        ...studentData,
        nim: editNim.trim() || studentData.nim,
        nama: editNama.trim() || studentData.nama,
        jurusan: editJurusan.trim() || studentData.jurusan,
        fakultas: editFakultas.trim() || studentData.fakultas,
        judulSkripsi: editJudul.trim() || studentData.judulSkripsi,
        updatedAt: new Date().toISOString(),
      };

      await saveMahasiswaData(updated);
      setStudentData(updated);
      setIsEditing(false);
      Alert.alert('Sukses', 'Data skripsi Anda berhasil diperbarui di database Cloud Firestore.');
    } catch {
      Alert.alert('Error', 'Gagal menyimpan perubahan data.');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Konfirmasi Keluar',
      'Keluar dari akun mahasiswa ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Keluar',
          style: 'destructive',
          onPress: () => signOut(),
        },
      ]
    );
  };

  if (loadingData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <ThemedText type="small" style={styles.loadingText}>
          Memuat data Anda dari koleksi mahasiswa Firestore...
        </ThemedText>
      </View>
    );
  }

  const data = studentData!;

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }>
      <View style={styles.container}>
        {/* User Role Banner */}
        <View style={styles.headerBar}>
          <View>
            <View style={styles.roleBadge}>
              <ThemedText type="code" style={styles.roleBadgeText}>
                ROLE: MAHASISWA
              </ThemedText>
            </View>
            <ThemedText type="subtitle" style={styles.headerTitle}>
              Portal Mahasiswa
            </ThemedText>
          </View>

          <Pressable
            onPress={handleSignOut}
            disabled={isAuthLoading}
            style={styles.signOutBtn}>
            <ThemedText type="code" style={styles.signOutBtnText}>
              Keluar
            </ThemedText>
          </Pressable>
        </View>

        {/* Kartu Tanda Mahasiswa Digital (KTM) */}
        <View style={styles.ktmCard}>
          <View style={styles.ktmTopBar}>
            <View>
              <ThemedText type="code" style={styles.ktmUni}>
                UNIVERSITAS DIPONEGORO
              </ThemedText>
              <ThemedText type="smallBold" style={styles.ktmCardTitle}>
                KARTU TANDA MAHASISWA
              </ThemedText>
            </View>
            <View style={styles.activeBadge}>
              <View style={styles.activeDot} />
              <ThemedText type="code" style={styles.activeBadgeText}>
                {data.statusAkademik.toUpperCase()}
              </ThemedText>
            </View>
          </View>

          <View style={styles.ktmBody}>
            <View style={styles.ktmPhotoWrapper}>
              {data.fotoUrl ? (
                <Image
                  source={{ uri: data.fotoUrl }}
                  style={styles.ktmPhoto}
                  contentFit="cover"
                />
              ) : (
                <View style={styles.ktmPhotoFallback}>
                  <ThemedText type="subtitle" style={styles.photoInitial}>
                    {data.nama.charAt(0)}
                  </ThemedText>
                </View>
              )}
            </View>

            <View style={styles.ktmInfo}>
              <ThemedText type="smallBold" style={styles.ktmNama} numberOfLines={2}>
                {data.nama}
              </ThemedText>
              <ThemedText type="code" style={styles.ktmNim}>
                NIM: {data.nim}
              </ThemedText>
              <ThemedText type="small" style={styles.ktmProdi}>
                {data.jurusan}
              </ThemedText>
              <ThemedText type="small" style={styles.ktmFakultas}>
                Fak. {data.fakultas}
              </ThemedText>
            </View>
          </View>

          <View style={styles.ktmFooter}>
            <ThemedText type="code" style={styles.ktmEmail}>
              {data.email}
            </ThemedText>
            <ThemedText type="code" style={styles.ktmAngkatan}>
              Angkatan {data.angkatan}
            </ThemedText>
          </View>
        </View>

        {/* Ringkasan Statistik Akademik */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <ThemedText type="code" style={styles.statLabel}>
              IPK
            </ThemedText>
            <ThemedText type="subtitle" style={styles.statValueHighlight}>
              {data.ipk.toFixed(2)}
            </ThemedText>
            <ThemedText type="code" style={styles.statSub}>
              Skala 4.00
            </ThemedText>
          </View>

          <View style={styles.statBox}>
            <ThemedText type="code" style={styles.statLabel}>
              SKS SELESAI
            </ThemedText>
            <ThemedText type="subtitle" style={styles.statValue}>
              {data.sksSelesai}
            </ThemedText>
            <ThemedText type="code" style={styles.statSub}>
              Total 144 SKS
            </ThemedText>
          </View>

          <View style={styles.statBox}>
            <ThemedText type="code" style={styles.statLabel}>
              SEMESTER
            </ThemedText>
            <ThemedText type="subtitle" style={styles.statValue}>
              {data.semester}
            </ThemedText>
            <ThemedText type="code" style={styles.statSub}>
              Ganjil 2026/2027
            </ThemedText>
          </View>
        </View>

        {/* Informasi Skripsi & Dosen Pembimbing */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <ThemedText type="smallBold" style={styles.cardTitle}>
              Informasi Tugas Akhir / Skripsi
            </ThemedText>
            <View style={styles.skripsiBadge}>
              <ThemedText type="code" style={styles.skripsiBadgeText}>
                {data.statusSkripsi || 'BIMBINGAN'}
              </ThemedText>
            </View>
          </View>

          <View style={styles.skripsiContent}>
            <ThemedText type="code" style={styles.fieldLabel}>
              JUDUL SKRIPSI ANDA
            </ThemedText>
            <ThemedText type="default" style={styles.judulSkripsi}>
              &ldquo;{data.judulSkripsi}&rdquo;
            </ThemedText>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <ThemedText type="small" style={styles.fieldLabel}>
              Dosen Pembimbing
            </ThemedText>
            <ThemedText type="smallBold" style={styles.dosenText}>
              {data.pembimbingSkripsi}
            </ThemedText>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <ThemedText type="small" style={styles.fieldLabel}>
              Dosen Wali
            </ThemedText>
            <ThemedText type="smallBold" style={styles.dosenText}>
              {data.dosenWali}
            </ThemedText>
          </View>

          {/* Tombol Ajukan / Edit Judul Skripsi */}
          <Pressable onPress={() => setIsEditing(true)} style={styles.editSkripsiButton}>
            <ThemedText type="smallBold" style={styles.editSkripsiButtonText}>
              ✏️ Ajukan / Edit Judul Skripsi
            </ThemedText>
          </Pressable>
        </View>
      </View>

      {/* Modal Edit Skripsi Mahasiswa */}
      <Modal
        visible={isEditing}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditing(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText type="subtitle" style={styles.modalTitle}>
              Edit Judul Skripsi
            </ThemedText>
            <ThemedText type="small" style={styles.modalSubtitle}>
              Data akan diperbarui langsung di koleksi mahasiswa Cloud Firestore
            </ThemedText>

            <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <ThemedText type="smallBold" style={styles.inputLabel}>
                  NIM
                </ThemedText>
                <TextInput
                  value={editNim}
                  onChangeText={setEditNim}
                  style={styles.textInput}
                  placeholder="24060121130089"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText type="smallBold" style={styles.inputLabel}>
                  Nama Mahasiswa
                </ThemedText>
                <TextInput
                  value={editNama}
                  onChangeText={setEditNama}
                  style={styles.textInput}
                  placeholder="Nama Lengkap"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText type="smallBold" style={styles.inputLabel}>
                  Program Studi
                </ThemedText>
                <TextInput
                  value={editJurusan}
                  onChangeText={setEditJurusan}
                  style={styles.textInput}
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText type="smallBold" style={styles.inputLabel}>
                  Judul Skripsi
                </ThemedText>
                <TextInput
                  value={editJudul}
                  onChangeText={setEditJudul}
                  multiline
                  numberOfLines={3}
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Tuliskan judul tugas akhir atau skripsi Anda..."
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => setIsEditing(false)}
                disabled={saving}
                style={styles.modalCancelButton}>
                <ThemedText type="smallBold" style={{ color: '#64748B' }}>
                  Batal
                </ThemedText>
              </Pressable>
              <Pressable
                onPress={handleSaveEdit}
                disabled={saving}
                style={styles.modalSaveButton}>
                {saving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <ThemedText type="smallBold" style={styles.modalSaveText}>
                    Simpan ke Firestore
                  </ThemedText>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    backgroundColor: '#F8FAFC',
  },
  container: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    gap: Spacing.three,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  roleBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 2,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  signOutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F87171',
    backgroundColor: '#FEF2F2',
  },
  signOutBtnText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '700',
  },
  ktmCard: {
    backgroundColor: '#1E3A8A',
    borderRadius: 20,
    padding: Spacing.four,
    gap: Spacing.three,
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  ktmTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#FFFFFF33',
    paddingBottom: Spacing.two,
  },
  ktmUni: {
    color: '#93C5FD',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  ktmCardTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  activeBadge: {
    backgroundColor: '#065F46',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
  },
  activeBadgeText: {
    color: '#D1FAE5',
    fontSize: 10,
    fontWeight: '800',
  },
  ktmBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  ktmPhotoWrapper: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  ktmPhoto: {
    width: 72,
    height: 90,
  },
  ktmPhotoFallback: {
    width: 72,
    height: 90,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoInitial: {
    color: '#FFFFFF',
    fontSize: 28,
  },
  ktmInfo: {
    flex: 1,
    gap: 3,
  },
  ktmNama: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  ktmNim: {
    color: '#FCD34D',
    fontSize: 13,
    fontWeight: '700',
  },
  ktmProdi: {
    color: '#E0E7FF',
    fontSize: 13,
  },
  ktmFakultas: {
    color: '#BFDBFE',
    fontSize: 12,
  },
  ktmFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#FFFFFF22',
    paddingTop: Spacing.two,
  },
  ktmEmail: {
    color: '#BFDBFE',
    fontSize: 11,
  },
  ktmAngkatan: {
    color: '#93C5FD',
    fontSize: 11,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  statBox: {
    flex: 1,
    padding: Spacing.three,
    borderRadius: 16,
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statLabel: {
    color: '#64748B',
    fontSize: 10,
  },
  statValueHighlight: {
    fontSize: 24,
    fontWeight: '800',
    color: '#059669',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  statSub: {
    fontSize: 10,
    color: '#94A3B8',
  },
  card: {
    padding: Spacing.four,
    borderRadius: 18,
    gap: Spacing.two,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 15,
    color: '#0F172A',
  },
  skripsiBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  skripsiBadgeText: {
    color: '#1D4ED8',
    fontSize: 10,
    fontWeight: '800',
  },
  skripsiContent: {
    gap: 4,
    marginTop: 2,
  },
  fieldLabel: {
    color: '#64748B',
    fontSize: 11,
  },
  judulSkripsi: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    fontStyle: 'italic',
    color: '#0F172A',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dosenText: {
    fontSize: 13,
    textAlign: 'right',
    maxWidth: '60%',
    color: '#0F172A',
  },
  editSkripsiButton: {
    marginTop: Spacing.two,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editSkripsiButtonText: {
    color: '#2563EB',
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000080',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.four,
    maxHeight: '85%',
    gap: Spacing.two,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 13,
    marginBottom: Spacing.two,
    color: '#64748B',
  },
  modalForm: {
    marginBottom: Spacing.three,
  },
  inputGroup: {
    marginBottom: Spacing.three,
    gap: 6,
  },
  inputLabel: {
    color: '#334155',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingTop: Spacing.two,
  },
  modalCancelButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSaveButton: {
    flex: 2,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSaveText: {
    color: '#FFFFFF',
  },
});
