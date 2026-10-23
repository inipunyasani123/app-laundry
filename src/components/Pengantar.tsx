import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useBusa } from '@/lib/store';
import { hurufJudul, warna } from '@/lib/tema';
import Ikon from './Ikon';
import type { NamaIkon } from './ikon-data';
import LembarBawah from './LembarBawah';
import { Tombol } from './ui';

// Kalimat dibuat pendek (satu baris per blok) supaya lembar ini tidak menggeser LCP halaman.
const KARTU: { ikon: NamaIkon[]; judul: string; isi: string[] }[] = [
  { ikon: ['motor', 'timbangan'], judul: 'Dijemput & ditimbang di depanmu', isi: ['Pilih hari dan slot jam jemput.', 'Kurir Bayu datang membawa tas ungu bertiket.', 'Berat langsung masuk nota di aplikasi.'] },
  { ikon: ['bak', 'pengering', 'setrika'], judul: 'Pantau tiap tahap cucian', isi: ['Diterima, ditimbang, dicuci, sampai disetrika.', 'Lengkap dengan persen dan jam WIB.', 'Di demo ini tahap bisa dimajukan (simulasi).'] },
  { ikon: ['nota', 'busa'], judul: 'Nota, poin, dan kartu cap', isi: ['Bayar simulasi, poin masuk otomatis.', 'Nilai cucianmu atau ajukan komplain.', 'Data rekaan, tersimpan di perangkatmu saja.'] },
];

/** Pengantar sekali tampil (bisa dilewati, bisa diputar ulang dari Riwayat). */
export default function Pengantar() {
  const { siap, pengantar, setPengantar } = useBusa();
  const [k, setK] = useState(0);
  const tutup = () => {
    setPengantar(true);
    setK(0);
  };
  const kartu = KARTU[k];
  return (
    <LembarBawah
      terbuka={siap && !pengantar}
      onTutup={tutup}
      judul="Selamat datang di Busa Ungu"
      bawah={
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Tombol label="Lewati" gaya="tipis" onPress={tutup} style={{ flex: 1 }} />
          {k < KARTU.length - 1 ? (
            <Tombol label="Lanjut" ikon="panah" onPress={() => setK(k + 1)} style={{ flex: 1.4 }} labelAria={`Lanjut, kartu ${k + 2} dari 3`} />
          ) : (
            <Tombol label="Mulai" ikon="cek" onPress={tutup} style={{ flex: 1.4 }} />
          )}
        </View>
      }
    >
      <View style={st.gambar} aria-hidden>
        {kartu.ikon.map((n, i) => (
          <View key={n} style={[st.bulat, i === 1 && { backgroundColor: warna.ungu }]}>
            <Ikon nama={n} ukuran={34} warna={i === 1 ? warna.putih : warna.unguTua} tebal={1.6} />
          </View>
        ))}
      </View>
      <Text style={st.hitung}>{k + 1} / 3</Text>
      <Text style={st.judul}>{kartu.judul}</Text>
      <View style={{ gap: 2 }}>
        {kartu.isi.map((x) => (
          <Text key={x} style={st.isi}>
            {x}
          </Text>
        ))}
      </View>
      <View style={st.titik} aria-hidden>
        {KARTU.map((_, i) => (
          <View key={i} style={[st.t, i === k && st.tAktif]} />
        ))}
      </View>
    </LembarBawah>
  );
}

const st = StyleSheet.create({
  gambar: { flexDirection: 'row', justifyContent: 'center', gap: 12, paddingVertical: 14, backgroundColor: warna.latar, borderRadius: 22 },
  bulat: { width: 68, height: 68, borderRadius: 34, backgroundColor: warna.unguMuda, alignItems: 'center', justifyContent: 'center' },
  hitung: { fontSize: 12, fontWeight: '800', letterSpacing: 1.4, color: warna.redup },
  judul: { fontFamily: hurufJudul, fontSize: 20, lineHeight: 25, color: warna.tinta },
  isi: { fontSize: 15, lineHeight: 22, color: warna.redup },
  titik: { flexDirection: 'row', gap: 6, justifyContent: 'center' },
  t: { width: 8, height: 8, borderRadius: 4, backgroundColor: warna.garis },
  tAktif: { width: 22, backgroundColor: warna.ungu },
});
