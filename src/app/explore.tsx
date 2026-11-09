import React, { useState, useEffect, useCallback } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { MahasiswaData, fetchAllMahasiswa } from '@/services/studentService';

interface DosenRekap {
  nama: string;
  total: number;
  mahasiswa: MahasiswaData[];
}

export default function RekapitulasiScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };
  const theme = useTheme();

  const [mahasiswaList, setMahasiswaList] = useState<MahasiswaData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    try {
      const data = await fetchAllMahasiswa();
      setMahasiswaList(data);
    } catch (err) {
      console.warn('Gagal memuat data rekapitulasi:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    fetchAllMahasiswa()
      .then((data) => {
        if (isMounted) {
          setMahasiswaList(data);
        }
      })
      .catch((err) => {
        console.warn('Gagal memuat data rekapitulasi:', err);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
          setRefreshing(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // 1. Filter mahasiswa yang sedang ada di tahap Sidang atau Sempro
  const agendaList = mahasiswaList.filter(
    (m) => m.statusSkripsi === 'Seminar Proposal' || m.statusSkripsi === 'Sidang Skripsi'
  );

  // 2. Kelompokkan mahasiswa per Dosen Pembimbing
  const dosenMap: Record<string, DosenRekap> = {};
  mahasiswaList.forEach((m) => {
    const dosen = m.pembimbingSkripsi || 'Belum Ditentukan';
    if (!dosenMap[dosen]) {
      dosenMap[dosen] = { nama: dosen, total: 0, mahasiswa: [] };
    }
    dosenMap[dosen].total += 1;
    dosenMap[dosen].mahasiswa.push(m);
  });
  const dosenList = Object.values(dosenMap).sort((a, b) => b.total - a.total);

  const handleExportText = () => {
    const textLines = [
      '=== REKAPITULASI SKRIPSI MAHASISWA UNDIP ===',
      `Tanggal: ${new Date().toLocaleDateString('id-ID')}`,
      `Total Mahasiswa Skripsi: ${mahasiswaList.length}`,
      '',
      '--- DAFTAR MAHASISWA & PEMBIMBING ---',
      ...mahasiswaList.map(
        (m, idx) =>
          `${idx + 1}. [${m.nim}] ${m.nama}\n   Judul: "${m.judulSkripsi}"\n   Pembimbing: ${m.pembimbingSkripsi} | Status: ${m.statusSkripsi}`
      ),
    ];

    const reportText = textLines.join('\n');
    Alert.alert(
      'Ringkasan Laporan Skripsi',
      `Berhasil membuat format laporan untuk ${mahasiswaList.length} mahasiswa.\n\nContoh data siap dibagikan ke forum dosen atau rapat skripsi.`,
      [{ text: 'Tutup' }]
    );
  };

  const contentPlatformStyle = Platform.select({
    android: {
      paddingTop: insets.top,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      paddingBottom: insets.bottom,
    },
    ios: {
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
    },
    web: {
      paddingTop: Spacing.four,
      paddingBottom: Spacing.four,
    },
  });

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }>
      <View style={styles.container}>
        {/* Header Title */}
        <ThemedView type="backgroundElement" style={styles.headerCard}>
          <View style={styles.badge}>
            <ThemedText type="code" style={styles.badgeText}>
              DEPARTEMEN ILMU KOMPUTER / INFORMATIKA
            </ThemedText>
          </View>
          <ThemedText type="subtitle" style={styles.title}>
            Rekapitulasi &amp; Agenda
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>
            Monitoring Distribusi Pembimbing &amp; Jadwal Ujian Mahasiswa
          </ThemedText>

          <Pressable onPress={handleExportText} style={styles.exportBtn}>
            <ThemedText type="smallBold" style={{ color: '#fff', fontSize: 13 }}>
              📋 Buat Format Laporan Skripsi
            </ThemedText>
          </Pressable>
        </ThemedView>

        {loading ? (
          <View style={styles.loadingWrapper}>
            <ActivityIndicator size="large" color="#3c87f7" />
            <ThemedText type="small" themeColor="textSecondary">
              Memuat data rekapitulasi...
            </ThemedText>
          </View>
        ) : (
          <>
            {/* Bagian 1: Agenda Seminar Proposal & Sidang */}
            <View style={styles.sectionHeader}>
              <ThemedText type="smallBold" style={styles.sectionTitle}>
                📅 Agenda Sempro &amp; Sidang Skripsi ({agendaList.length})
              </ThemedText>
              <ThemedText type="code" themeColor="textSecondary">
                Jadwal Ujian Mahasiswa
              </ThemedText>
            </View>

            {agendaList.length === 0 ? (
              <ThemedView type="backgroundElement" style={styles.emptyCard}>
                <ThemedText type="small">Belum ada agenda ujian yang terjadwal.</ThemedText>
              </ThemedView>
            ) : (
              <View style={styles.agendaGrid}>
                {agendaList.map((mhs, i) => {
                  const isSidang = mhs.statusSkripsi === 'Sidang Skripsi';
                  return (
                    <ThemedView
                      key={mhs.nim + i}
                      type="backgroundElement"
                      style={[
                        styles.agendaCard,
                        { borderLeftColor: isSidang ? '#7C3AED' : '#D97706' },
                      ]}>
                      <View style={styles.agendaTop}>
                        <View style={styles.agendaStatusBadge}>
                          <ThemedText
                            type="code"
                            style={{
                              color: isSidang ? '#7C3AED' : '#D97706',
                              fontWeight: '800',
                            }}>
                            {mhs.statusSkripsi?.toUpperCase()}
                          </ThemedText>
                        </View>
                        <ThemedText type="code" style={styles.agendaRoom}>
                          Ruang Sidang FSM
                        </ThemedText>
                      </View>

                      <ThemedText type="smallBold" style={styles.agendaMhsName}>
                        {mhs.nama}
                      </ThemedText>
                      <ThemedText type="code" themeColor="textSecondary">
                        NIM: {mhs.nim}
                      </ThemedText>

                      <View style={styles.agendaThesisBox}>
                        <ThemedText
                          type="code"
                          style={styles.agendaThesisTitle}
                          numberOfLines={2}>
                          &ldquo;{mhs.judulSkripsi}&rdquo;
                        </ThemedText>
                      </View>

                      <View style={styles.agendaFooter}>
                        <ThemedText type="code" themeColor="textSecondary">
                          Pembimbing:
                        </ThemedText>
                        <ThemedText type="code" style={styles.agendaDosenText}>
                          {mhs.pembimbingSkripsi}
                        </ThemedText>
                      </View>
                    </ThemedView>
                  );
                })}
              </View>
            )}

            {/* Bagian 2: Distribusi Dosen Pembimbing */}
            <View style={[styles.sectionHeader, { marginTop: Spacing.four }]}>
              <ThemedText type="smallBold" style={styles.sectionTitle}>
                👨‍🏫 Distribusi Dosen Pembimbing ({dosenList.length} Dosen)
              </ThemedText>
              <ThemedText type="code" themeColor="textSecondary">
                Beban Bimbingan Mahasiswa
              </ThemedText>
            </View>

            <View style={styles.dosenListWrapper}>
              {dosenList.map((d, index) => {
                const maxQuota = 8;
                const percentage = Math.min(Math.round((d.total / maxQuota) * 100), 100);

                return (
                  <ThemedView key={d.nama + index} type="backgroundElement" style={styles.dosenCard}>
                    <View style={styles.dosenTopRow}>
                      <View style={{ flex: 1 }}>
                        <ThemedText type="smallBold" style={styles.dosenName}>
                          {d.nama}
                        </ThemedText>
                        <ThemedText type="code" themeColor="textSecondary">
                          Departemen Informatika UNDIP
                        </ThemedText>
                      </View>
                      <View style={styles.dosenCountPill}>
                        <ThemedText type="smallBold" style={styles.dosenCountText}>
                          {d.total} Mahasiswa
                        </ThemedText>
                      </View>
                    </View>

                    {/* Progress Bar Kuota */}
                    <View style={styles.progressContainer}>
                      <View style={styles.progressTrack}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${percentage}%`,
                              backgroundColor: d.total >= 4 ? '#3c87f7' : '#10B981',
                            },
                          ]}
                        />
                      </View>
                      <ThemedText type="code" style={styles.progressLabel}>
                        {d.total}/{maxQuota} Kuota Bimbingan Aktif ({percentage}%)
                      </ThemedText>
                    </View>

                    {/* List Mahasiswa Bimbingan */}
                    <View style={styles.bimbinganMiniList}>
                      {d.mahasiswa.map((m, mIdx) => (
                        <View key={m.nim + mIdx} style={styles.miniMhsItem}>
                          <ThemedText type="code" style={styles.miniMhsBullet}>
                            •
                          </ThemedText>
                          <ThemedText type="code" style={styles.miniMhsName} numberOfLines={1}>
                            {m.nama} ({m.nim})
                          </ThemedText>
                          <View style={styles.miniMhsStatus}>
                            <ThemedText type="code" style={styles.miniMhsStatusText}>
                              {m.statusSkripsi || 'Bimbingan'}
                            </ThemedText>
                          </View>
                        </View>
                      ))}
                    </View>
                  </ThemedView>
                );
              })}
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.four,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  container: {
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingVertical: Spacing.four,
    gap: Spacing.three,
  },
  headerCard: {
    padding: Spacing.four,
    borderRadius: 20,
    gap: Spacing.two,
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#3c87f715',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#3c87f7',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
  },
  exportBtn: {
    marginTop: Spacing.two,
    backgroundColor: '#3c87f7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  loadingWrapper: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 12,
  },
  sectionHeader: {
    marginTop: Spacing.two,
    gap: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  emptyCard: {
    padding: Spacing.four,
    borderRadius: 14,
    alignItems: 'center',
  },
  agendaGrid: {
    gap: Spacing.two,
  },
  agendaCard: {
    padding: Spacing.three,
    borderRadius: 14,
    borderLeftWidth: 4,
    gap: 6,
  },
  agendaTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  agendaStatusBadge: {
    backgroundColor: '#8E918F15',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  agendaRoom: {
    fontSize: 11,
    color: '#3c87f7',
  },
  agendaMhsName: {
    fontSize: 14,
  },
  agendaThesisBox: {
    backgroundColor: '#8E918F10',
    padding: 8,
    borderRadius: 8,
    marginVertical: 2,
  },
  agendaThesisTitle: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  agendaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  agendaDosenText: {
    fontSize: 11,
    fontWeight: '700',
  },
  dosenListWrapper: {
    gap: Spacing.three,
  },
  dosenCard: {
    padding: Spacing.four,
    borderRadius: 16,
    gap: Spacing.two,
  },
  dosenTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dosenName: {
    fontSize: 15,
  },
  dosenCountPill: {
    backgroundColor: '#3c87f720',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dosenCountText: {
    fontSize: 12,
    color: '#3c87f7',
    fontWeight: '800',
  },
  progressContainer: {
    gap: 4,
    marginVertical: 4,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8E918F20',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressLabel: {
    fontSize: 10,
    color: '#8E918F',
  },
  bimbinganMiniList: {
    marginTop: 4,
    gap: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#8E918F25',
    paddingTop: 8,
  },
  miniMhsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  miniMhsBullet: {
    color: '#3c87f7',
    fontSize: 14,
  },
  miniMhsName: {
    flex: 1,
    fontSize: 11,
  },
  miniMhsStatus: {
    backgroundColor: '#8E918F15',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  miniMhsStatusText: {
    fontSize: 9,
  },
});
