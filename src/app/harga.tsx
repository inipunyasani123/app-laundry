import { StyleSheet, Text, View } from 'react-native';
import Foto from '@/components/Foto';
import Ikon from '@/components/Ikon';
import { KepalaDalam, Layar } from '@/components/kerangka';
import { Jahitan, Judul, Kartu, Lencana, Teks, Tombol } from '@/components/ui';
import { BERAT_MINIMUM, EKSTRA, LAYANAN, MEREK, PEWANGI, SATUAN, URUTAN_LAYANAN, rupiah } from '@/lib/katalog';
import { meta } from '@/lib/seo';
import { hurufAngka, hurufJudul, sudut, warna } from '@/lib/tema';

export function generateMetadata() {
  return meta(
    '/harga',
    'Daftar Harga Laundry Kiloan & Satuan · Busa Ungu',
    'Harga contoh laundry kiloan reguler, sehari jadi, kilat 6 jam, cuci lipat, item satuan seperti bed cover dan sepatu, plus perawatan noda.',
  );
}

export default function Harga() {
  return (
    <Layar kepala={<KepalaDalam judul="Daftar harga" sub="Harga contoh untuk demo" />}>
      <View style={st.foto}>
        <Foto nama="jepit" prioritas />
        <View style={st.fotoTeks}>
          <Text style={st.fotoJudul}>Bayar sesuai timbangan</Text>
          <Text style={st.fotoKecil}>Ditimbang di depanmu saat dijemput, nota langsung masuk aplikasi.</Text>
        </View>
      </View>

      <Kartu style={{ gap: 4 }}>
        <Judul level={2}>Kiloan</Judul>
        <Teks kecil redup>Minimum {BERAT_MINIMUM} kg per order. Sudah termasuk deterjen, pelembut, dan pewangi.</Teks>
        {URUTAN_LAYANAN.map((k, i) => {
          const l = LAYANAN[k];
          return (
            <View key={k}>
              {i > 0 ? <Jahitan /> : null}
              <View style={st.baris}>
                <View style={st.ikon}>
                  <Ikon nama={k === 'kilat' ? 'kilat' : k === 'lipat' ? 'lipatan' : 'bak'} ukuran={20} warna={warna.unguTua} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={st.nama}>{l.nama}</Text>
                  <Text style={st.ket}>{l.ket}</Text>
                  {k === 'kilat' ? <Lencana label="EKSPRES" jenis="kuning" /> : k === 'sehari' ? <Lencana label="EKSPRES" jenis="kuning" /> : null}
                </View>
                <Text style={st.harga}>
                  {rupiah(l.hargaKg)}
                  <Text style={st.per}>/kg</Text>
                </Text>
              </View>
            </View>
          );
        })}
      </Kartu>

      <Kartu style={{ gap: 4 }}>
        <Judul level={2}>Satuan</Judul>
        <Teks kecil redup>Untuk barang besar atau yang perlu perlakuan khusus. Selesai 2 hari.</Teks>
        {SATUAN.map((it, i) => (
          <View key={it.kode}>
            {i > 0 ? <Jahitan /> : null}
            <View style={st.baris}>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={st.nama}>{it.nama}</Text>
                <Text style={st.ket}>{it.ket}</Text>
              </View>
              <Text style={st.harga}>{rupiah(it.harga)}</Text>
            </View>
          </View>
        ))}
      </Kartu>

      <Kartu style={{ gap: 4 }} warnaLatar={warna.kuningMuda}>
        <Judul level={2}>Tambahan</Judul>
        {[
          { nama: EKSTRA.noda.nama, ket: EKSTRA.noda.ket, harga: rupiah(EKSTRA.noda.harga) },
          { nama: EKSTRA.ongkirDekat.nama, ket: 'Kurir menjemput & mengantar', harga: 'Gratis' },
          { nama: EKSTRA.ongkirJauh.nama, ket: 'Sekali jalan', harga: rupiah(EKSTRA.ongkirJauh.harga) },
          { nama: 'Pewangi pilihan', ket: PEWANGI.map((p) => p.nama).join(', '), harga: 'Gratis' },
        ].map((b, i) => (
          <View key={b.nama}>
            {i > 0 ? <Jahitan warnaGaris="#EAD58A" /> : null}
            <View style={st.baris}>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={st.nama}>{b.nama}</Text>
                <Text style={st.ket}>{b.ket}</Text>
              </View>
              <Text style={st.harga}>{b.harga}</Text>
            </View>
          </View>
        ))}
      </Kartu>

      <Teks kecil redup>
        {MEREK.nama} adalah usaha rekaan untuk demo aplikasi. Harga di atas contoh, bukan tarif usaha mana pun.
      </Teks>
      <Tombol label="Jadwalkan jemput" ikon="motor" href="/pesan" />
    </Layar>
  );
}

const st = StyleSheet.create({
  foto: { height: 150, borderRadius: sudut.besar, overflow: 'hidden', backgroundColor: warna.tinta },
  fotoTeks: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 14, paddingTop: 24, backgroundColor: 'rgba(33,22,63,0.78)', gap: 2 },
  fotoJudul: { fontFamily: hurufJudul, fontSize: 21, lineHeight: 25, color: warna.putih },
  fotoKecil: { fontSize: 13, lineHeight: 18, color: '#F1ECFF' },
  baris: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  ikon: { width: 38, height: 38, borderRadius: 19, backgroundColor: warna.unguMuda, alignItems: 'center', justifyContent: 'center' },
  nama: { fontSize: 15, fontWeight: '700', color: warna.tinta },
  ket: { fontSize: 13, lineHeight: 18, color: warna.redup },
  harga: { fontFamily: hurufAngka, fontSize: 15, fontWeight: '700', color: warna.tinta },
  per: { fontSize: 12, color: warna.redup, fontWeight: '400' },
});
