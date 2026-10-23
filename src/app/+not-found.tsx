import { StyleSheet, Text, View } from 'react-native';
import Gambar from '@/components/Gambar';
import type { Bentuk } from '@/components/ikon-data';
import { Layar } from '@/components/kerangka';
import { Judul, Teks, Tombol } from '@/components/ui';
import { JUDUL, meta } from '@/lib/seo';
import { hurufAngka, warna } from '@/lib/tema';

export function generateMetadata() {
  return meta('/404', JUDUL['/404'], 'Halaman ini hilang seperti kaus kaki sebelah. Kembali ke beranda Busa Ungu untuk memantau cucianmu.', { indeks: false });
}

/** Ilustrasi kaus kaki yang tinggal sebelah (viewBox 120×120). */
const KAUS_KAKI: Bentuk[] = [
  { t: 'circle', cx: 60, cy: 60, r: 58, isi: '#EAE3FC' },
  { t: 'path', d: 'M18 30h84', garis: '#5A5272', tebal: 2 },
  { t: 'rect', x: 34, y: 26, w: 7, h: 14, rx: 2, isi: '#FFD24A' },
  { t: 'rect', x: 78, y: 26, w: 7, h: 14, rx: 2, isi: '#FFD24A' },
  { t: 'path', d: 'M30 36h15v34c0 5 4 8 9 9l8 1c6 1 8 10 1 12l-18 2c-9 1-15-5-15-13z', isi: '#5B2FD0' },
  { t: 'path', d: 'M30 44h15', garis: '#FFFFFF', tebal: 3 },
  { t: 'path', d: 'M30 50h15', garis: '#FFFFFF', tebal: 3 },
  { t: 'path', d: 'M74 38c2 6 8 8 11 4', garis: '#B9AEDA', tebal: 2.5 },
  { t: 'path', d: 'M88 60c0 10-3 17-8 22', garis: '#B9AEDA', tebal: 2.5 },
  { t: 'circle', cx: 92, cy: 92, r: 4, isi: '#FFFFFF' },
  { t: 'circle', cx: 101, cy: 80, r: 2.5, isi: '#FFFFFF' },
];

export default function TidakDitemukan() {
  return (
    <Layar>
      <View style={st.wadah}>
        <Gambar bentuk={KAUS_KAKI} kotak={120} ukuran={180} />
        <Text style={st.kode}>404 · TIKET TIDAK DIKENAL</Text>
        <Judul level={1} ukuran={28} style={{ textAlign: 'center' }}>
          Halaman ini hilang seperti kaus kaki sebelah
        </Judul>
        <Teks redup style={{ textAlign: 'center' }}>
          Sudah kami cari di mesin cuci dan di bawah meja setrika, tapi alamat ini tidak ada. Mungkin tautannya salah ketik.
        </Teks>
        <View style={{ gap: 10, alignSelf: 'stretch', marginTop: 8 }}>
          <Tombol label="Kembali ke beranda" ikon="beranda" href="/" />
          <Tombol label="Lihat daftar harga" gaya="kedua" href="/harga" />
        </View>
      </View>
    </Layar>
  );
}

const st = StyleSheet.create({
  wadah: { alignItems: 'center', gap: 12, paddingTop: 40, paddingHorizontal: 8 },
  kode: { fontFamily: hurufAngka, fontSize: 13, letterSpacing: 2, color: warna.unguTua, fontWeight: '700' },
});
