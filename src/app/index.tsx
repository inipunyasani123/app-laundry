import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Foto from '@/components/Foto';
import { KepalaMerek, Layar } from '@/components/kerangka';
import Ikon from '@/components/Ikon';
import { Busa, TiketCucian, TiketMini } from '@/components/tanda';
import { Judul, Kartu, Kerangka, Teks } from '@/components/ui';
import { LAYANAN, MEREK, SLOT_JEMPUT, ribuan, rupiah } from '@/lib/katalog';
import { jamSlot } from '@/lib/pesanan';
import { meta } from '@/lib/seo';
import { useBusa } from '@/lib/store';
import { hurufJudul, sudut, warna } from '@/lib/tema';
import { JAM, lalu, padaJam, salam, tanggalPendek, jam } from '@/lib/waktu';

export function generateMetadata() {
  return meta(
    '/',
    'Busa Ungu: Demo Aplikasi Pelanggan Laundry | PintuWeb',
    'Demo aplikasi laundry Android & iOS: pantau cucian per tahap, pesan jemput-antar, nota digital, bayar simulasi, poin dan promo. Buatan PintuWeb.',
  );
}

function slotTerdekat(kini: number) {
  for (const h of [0, 1]) {
    for (const j of SLOT_JEMPUT) {
      const m = padaJam(kini + h * 24 * JAM, j);
      if (m - kini >= JAM) return { mulai: m, besok: h === 1 };
    }
  }
  return null;
}

export default function Beranda() {
  const { siap, kini, berjalan, poin, notifikasi, dibaca, voucher } = useBusa();
  const slot = siap ? slotTerdekat(kini) : null;
  const notifBaru = notifikasi.slice(0, 2);

  return (
    <Layar kepala={<KepalaMerek />}>
      <View style={{ gap: 2 }}>
        <Judul level={1} ukuran={30}>
          {siap ? `${salam(kini)}, ${MEREK.pelanggan}` : `Halo, ${MEREK.pelanggan}`}
        </Judul>
        <Teks redup>{siap ? `${tanggalPendek(kini)} · ${jam(kini)} WIB` : 'Cucianmu, dari keranjang sampai lemari.'}</Teks>
      </View>

      <View style={{ gap: 10 }}>
        <View style={st.barisJudul}>
          <Judul level={2} ukuran={19}>Cucian berjalan</Judul>
          {siap ? <Text style={st.hitung}>{berjalan.length} tiket</Text> : null}
        </View>
        {!siap ? (
          <>
            <Kerangka tinggi={200} />
            <Kerangka tinggi={66} />
          </>
        ) : berjalan.length === 0 ? (
          <Kartu>
            <Teks>Belum ada cucian berjalan. Jadwalkan jemput dan kurir kami datang ke rumahmu.</Teks>
          </Kartu>
        ) : (
          <>
            <TiketCucian p={berjalan[0]} kini={kini} besar />
            {berjalan.slice(1).map((p) => (
              <TiketMini key={p.no} p={p} kini={kini} />
            ))}
          </>
        )}
      </View>

      {/* Bento */}
      <View style={st.bento}>
        <Link href="/pesan" asChild>
          <Pressable style={StyleSheet.flatten([st.ubin, st.ubinUngu])}>
            <Busa />
            <View style={st.ikonBulatPutih}>
              <Ikon nama="motor" warna={warna.unguTua} />
            </View>
            <Text style={[st.ubinJudul, { color: warna.putih }]}>Jemput cucian</Text>
            <Text style={[st.ubinIsi, { color: '#E9E2FF' }]}>
              {slot ? `Slot terdekat ${slot.besok ? 'besok ' : ''}${jamSlot(slot.mulai)}` : 'Gratis ≤ 3 km dari outlet'}
            </Text>
          </Pressable>
        </Link>
        <Link href="/poin" asChild>
          <Pressable style={StyleSheet.flatten([st.ubin, st.ubinKuning])}>
            <Text style={st.ubinLabel}>POIN</Text>
            <Text style={st.angkaPoin}>{siap ? ribuan(poin.saldo) : '···'}</Text>
            <Text style={st.ubinIsi}>{siap ? poin.tingkat : 'Tingkat member'}</Text>
            {siap && poin.berikut ? <Text style={[st.ubinIsi, { fontWeight: '700' }]}>{ribuan(poin.kurang)} poin lagi ke {poin.berikut}</Text> : null}
          </Pressable>
        </Link>
      </View>

      <Link href="/harga" asChild>
        <Pressable style={st.ubinFoto}>
          <Foto nama="jepit" />
          <View style={st.fotoTeks}>
            <Text style={st.fotoKecil}>Daftar harga</Text>
            <Text style={st.fotoJudul}>Kiloan mulai {rupiah(LAYANAN.lipat.hargaKg)}/kg</Text>
            <Text style={st.fotoKecil}>Satuan, ekspres 6 jam, dan perawatan noda</Text>
          </View>
        </Pressable>
      </Link>

      <View style={st.bento}>
        <Link href="/poin" asChild>
          <Pressable style={StyleSheet.flatten([st.ubin, st.ubinPutih])}>
            <View style={[st.ikonBulatPutih, { backgroundColor: warna.unguMuda }]}>
              <Ikon nama="hadiah" warna={warna.unguTua} />
            </View>
            <Text style={st.ubinJudul}>Promo</Text>
            <Text style={st.ubinIsi}>{siap ? `${voucher.length} voucher siap dipakai` : 'Voucher & kartu cap'}</Text>
          </Pressable>
        </Link>
        <Link href="/riwayat" asChild>
          <Pressable style={StyleSheet.flatten([st.ubin, st.ubinPutih])}>
            <View style={[st.ikonBulatPutih, { backgroundColor: warna.unguMuda }]}>
              <Ikon nama="nota" warna={warna.unguTua} />
            </View>
            <Text style={st.ubinJudul}>Nota & riwayat</Text>
            <Text style={st.ubinIsi}>Semua order dan pembayaran</Text>
          </Pressable>
        </Link>
      </View>

      <Kartu style={{ gap: 4, paddingVertical: 8 }}>
        <View style={[st.barisJudul, { paddingTop: 6 }]}>
          <Judul level={2} ukuran={17}>Kabar terbaru</Judul>
          <Link href="/notifikasi" style={st.tautan}>
            Semua
          </Link>
        </View>
        {!siap ? (
          <Kerangka tinggi={90} style={{ marginVertical: 8 }} />
        ) : (
          notifBaru.map((n) => (
            <View key={n.id} style={st.notif}>
              <View style={[st.titik, dibaca.has(n.id) && { backgroundColor: warna.garis }]} />
              <View style={{ flex: 1 }}>
                <Text style={st.notifJudul}>{n.judul}</Text>
                <Text style={st.notifIsi} numberOfLines={2}>
                  {n.isi}
                </Text>
              </View>
              <Text style={st.notifWaktu}>{lalu(n.waktu, kini)}</Text>
            </View>
          ))
        )}
      </Kartu>

      <View style={st.outlet}>
        <Ikon nama="lokasi" warna={warna.redup} ukuran={18} />
        <Teks kecil redup style={{ flex: 1 }}>
          {MEREK.outlet} · buka {MEREK.jamBuka}. Usaha dan datanya rekaan untuk demo; waktu mengikuti jam WIB saat ini.
        </Teks>
      </View>
    </Layar>
  );
}

const st = StyleSheet.create({
  barisJudul: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  hitung: { fontSize: 13, fontWeight: '700', color: warna.unguTua },
  bento: { flexDirection: 'row', gap: 12 },
  ubin: { flex: 1, borderRadius: sudut.besar, padding: 14, minHeight: 150, gap: 4, overflow: 'hidden' },
  ubinUngu: { backgroundColor: warna.ungu },
  ubinKuning: { backgroundColor: warna.kuningMuda, borderWidth: 1, borderColor: '#F3DE8A' },
  ubinPutih: { backgroundColor: warna.kartu, borderWidth: 1, borderColor: warna.garis, minHeight: 128 },
  tekan: { opacity: 0.88 },
  ikonBulatPutih: { width: 42, height: 42, borderRadius: 21, backgroundColor: warna.putih, alignItems: 'center', justifyContent: 'center', marginBottom: 'auto' },
  ubinJudul: { fontFamily: hurufJudul, fontSize: 19, lineHeight: 23, color: warna.tinta, marginTop: 10 },
  ubinIsi: { fontSize: 13, lineHeight: 18, color: warna.tinta },
  ubinLabel: { fontSize: 12, fontWeight: '800', letterSpacing: 1.5, color: warna.tinta },
  angkaPoin: { fontFamily: hurufJudul, fontSize: 40, lineHeight: 46, color: warna.unguTua, marginTop: 'auto' },
  ubinFoto: { borderRadius: sudut.besar, overflow: 'hidden', height: 170, backgroundColor: warna.tinta },
  fotoTeks: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 14,
    paddingTop: 30,
    backgroundColor: 'rgba(33,22,63,0.78)',
    gap: 2,
  },
  fotoKecil: { color: '#F1ECFF', fontSize: 13 },
  fotoJudul: { fontFamily: hurufJudul, color: warna.putih, fontSize: 22, lineHeight: 27 },
  tautan: { color: warna.unguTua, fontWeight: '700', fontSize: 14, padding: 6, textDecorationLine: 'underline' },
  notif: { flexDirection: 'row', gap: 10, paddingVertical: 10, borderTopWidth: 1, borderColor: warna.unguMuda, alignItems: 'flex-start' },
  titik: { width: 10, height: 10, borderRadius: 5, backgroundColor: warna.ungu, marginTop: 6 },
  notifJudul: { fontWeight: '700', fontSize: 14, color: warna.tinta },
  notifIsi: { fontSize: 13, lineHeight: 18, color: warna.redup },
  notifWaktu: { fontSize: 12, color: warna.redup },
  outlet: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', paddingHorizontal: 4 },
});
