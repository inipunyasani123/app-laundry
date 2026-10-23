import { router } from 'expo-router';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import Ikon from '@/components/Ikon';
import type { NamaIkon } from '@/components/ikon-data';
import { KepalaDalam, Layar } from '@/components/kerangka';
import { Judul, Kartu, Kerangka, Lencana, Teks } from '@/components/ui';
import type { Notifikasi } from '@/lib/pesanan';
import { meta } from '@/lib/seo';
import { useBusa } from '@/lib/store';
import { Kosong } from '@/components/tanda';
import { sudut, warna } from '@/lib/tema';
import { hariRelatif, jam } from '@/lib/waktu';

export function generateMetadata() {
  return meta(
    '/notifikasi',
    'Notifikasi Cucian · Busa Ungu',
    'Kabar tiap tahap cucian, jadwal jemput, pembayaran, dan promo, dikelompokkan per hari dalam WIB. Notifikasi di demo ini simulasi.',
  );
}

const IKON_JENIS: Record<Notifikasi['jenis'], NamaIkon> = { tahap: 'bak', bayar: 'dompet', promo: 'hadiah', jemput: 'motor', komplain: 'komplain' };

export default function HalamanNotifikasi() {
  const { siap, kini, notifikasi, dibaca, tandaiDibaca, tandaiSemua, notifAktif, setNotifAktif, belumDibaca } = useBusa();

  const kelompok: { judul: string; isi: Notifikasi[] }[] = [];
  for (const n of notifikasi) {
    const j = hariRelatif(n.waktu, kini);
    const g = kelompok.find((x) => x.judul === j);
    if (g) g.isi.push(n);
    else kelompok.push({ judul: j, isi: [n] });
  }

  return (
    <Layar
      kepala={
        <KepalaDalam
          judul="Notifikasi"
          sub={siap ? (belumDibaca ? `${belumDibaca} belum dibaca` : 'Semua sudah dibaca') : 'Kabar cucianmu'}
          kanan={
            siap && belumDibaca ? (
              <Pressable role="button" onPress={tandaiSemua} style={st.tandai} aria-label="Baca semua notifikasi">
                <Ikon nama="cek" ukuran={18} warna={warna.unguTua} tebal={2.2} />
                <Text style={st.tandaiTeks}>Baca semua</Text>
              </Pressable>
            ) : null
          }
        />
      }
    >
      <Kartu style={st.saklar}>
        <View style={{ flex: 1 }}>
          <Text style={st.judulKecil}>Notifikasi simulasi</Text>
          <Text style={st.ket}>Muncul di atas layar saat cucian pindah tahap. Di aplikasi asli, ini notifikasi push.</Text>
        </View>
        <Switch
          value={siap ? notifAktif : true}
          onValueChange={setNotifAktif}
          aria-label="Aktifkan notifikasi simulasi"
          trackColor={{ true: warna.ungu, false: '#BDB3D6' }}
          thumbColor={warna.putih}
          {...({ activeThumbColor: warna.putih } as object)}
        />
      </Kartu>

      {!siap ? (
        <>
          <Kerangka tinggi={80} />
          <Kerangka tinggi={80} />
          <Kerangka tinggi={80} />
        </>
      ) : kelompok.length === 0 ? (
        <Kosong judul="Belum ada kabar" isi="Kabar tahap cucian, pembayaran, dan promo akan muncul di sini." aksi={{ label: 'Jadwalkan jemput', href: '/pesan' }} />
      ) : (
        kelompok.map((g) => (
          <View key={g.judul} style={{ gap: 8 }}>
            <Judul level={2} ukuran={16} style={{ color: warna.redup }}>
              {g.judul}
            </Judul>
            {g.isi.map((n) => {
              const baru = !dibaca.has(n.id);
              return (
                <Pressable
                  key={n.id}
                  role="link"
                  onPress={() => {
                    tandaiDibaca(n.id);
                    if (n.no) router.push({ pathname: '/status', params: { no: n.no } });
                    else router.push('/poin');
                  }}
                  style={({ pressed }) => [st.item, baru && st.itemBaru, pressed && { opacity: 0.85 }]}
                >
                  <View style={[st.ikon, n.jenis === 'promo' && { backgroundColor: warna.kuning }, n.jenis === 'bayar' && { backgroundColor: warna.hijauMuda }]}>
                    <Ikon nama={IKON_JENIS[n.jenis]} ukuran={20} warna={n.jenis === 'bayar' ? warna.hijau : warna.unguTua} />
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                      <Text style={st.judulKecil}>{n.judul}</Text>
                      <Text style={st.jam}>{jam(n.waktu)}</Text>
                    </View>
                    <Text style={st.ket}>{n.isi}</Text>
                  </View>
                  {baru ? <Lencana label="Baru" /> : null}
                </Pressable>
              );
            })}
          </View>
        ))
      )}
      <Teks kecil redup style={{ textAlign: 'center' }}>
        Menampilkan kabar 4 hari terakhir.
      </Teks>
    </Layar>
  );
}

const st = StyleSheet.create({
  tandai: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 44, paddingHorizontal: 10, borderRadius: 22, backgroundColor: warna.unguMuda },
  tandaiTeks: { fontSize: 13, fontWeight: '700', color: warna.unguTua },
  saklar: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  judulKecil: { fontSize: 15, fontWeight: '800', color: warna.tinta, flexShrink: 1 },
  ket: { fontSize: 13, lineHeight: 19, color: warna.redup },
  jam: { fontSize: 12, color: warna.redup },
  item: { flexDirection: 'row', gap: 12, padding: 12, borderRadius: sudut.sedang, backgroundColor: warna.kartu, borderWidth: 1, borderColor: warna.garis, alignItems: 'flex-start' },
  itemBaru: { borderColor: warna.lavender, backgroundColor: '#FBF9FF' },
  ikon: { width: 40, height: 40, borderRadius: 20, backgroundColor: warna.unguMuda, alignItems: 'center', justifyContent: 'center' },
  titik: { width: 10, height: 10, borderRadius: 5, backgroundColor: warna.ungu, marginTop: 6 },
});
