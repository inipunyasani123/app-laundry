import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { KepalaDalam, Layar, Logo } from '@/components/kerangka';
import { TepiGerigi } from '@/components/tanda';
import { JalurKomplain, PenilaianKu } from '@/components/ulasan';
import { Kartu, Kerangka, Teks, Tombol } from '@/components/ui';
import { LAYANAN, MEREK, kg, rupiah } from '@/lib/katalog';
import { METODE, hitungNota, indeksTahap, lunas, namaPewangi, namaTahapKini } from '@/lib/pesanan';
import { meta } from '@/lib/seo';
import { useBusa } from '@/lib/store';
import { hurufAngka, hurufJudul, warna } from '@/lib/tema';
import { jam, tanggalPanjang } from '@/lib/waktu';

export function generateMetadata() {
  return meta(
    '/nota',
    'Nota Digital Laundry · Busa Ungu',
    'Nota digital tiap order: berat hasil timbang, item satuan, perawatan noda, diskon voucher, total, status bayar, dan poin yang didapat.',
  );
}

export default function Nota() {
  const { no } = useLocalSearchParams<{ no?: string }>();
  const { siap, kini, cari, berjalan, selesai } = useBusa();
  const p = siap ? cari(no) ?? berjalan[0] ?? selesai[0] : undefined;

  if (!siap || !p) {
    return (
      <Layar kepala={<KepalaDalam judul="Nota digital" sub={siap ? 'Tidak ditemukan' : 'Memuat…'} cadangan="/riwayat" />}>
        {siap ? (
          <Kartu style={{ gap: 12 }}>
            <Teks>Nota {no ?? ''} tidak ditemukan.</Teks>
            <Tombol label="Lihat riwayat" href="/riwayat" gaya="kedua" />
          </Kartu>
        ) : (
          <Kerangka tinggi={480} />
        )}
      </Layar>
    );
  }

  const n = hitungNota(p, kini);
  const sudahLunas = lunas(p, kini);
  const tunai = p.bayar?.metode === 'tunai';

  return (
    <Layar kepala={<KepalaDalam judul="Nota digital" sub={p.no} cadangan="/riwayat" />}>
      <View style={st.kertasWadah}>
        <TepiGerigi terbalik={false} />
        <View style={st.kertas}>
          <View style={st.kop}>
            <Logo ukuran={40} />
            <View style={{ flex: 1 }}>
              <Text style={st.merek}>{MEREK.nama}</Text>
              <Text style={st.kecil}>{MEREK.outlet}</Text>
            </View>
            {sudahLunas ? (
              <View style={[st.cap, { borderColor: warna.hijau }]} aria-label="Lunas">
                <Text style={[st.capTeks, { color: warna.hijau }]}>LUNAS</Text>
              </View>
            ) : (
              <View style={[st.cap, { borderColor: warna.koral }]} aria-label={tunai ? 'Bayar tunai saat diantar' : 'Belum bayar'}>
                <Text style={[st.capTeks, { color: warna.koral }]}>{tunai ? 'COD' : 'BELUM'}</Text>
              </View>
            )}
          </View>

          <View style={st.garis} />
          <Info label="No. nota" isi={p.no} />
          <Info label="Masuk" isi={`${tanggalPanjang(p.jadwal.diterima)}, ${jam(p.jadwal.diterima)} WIB`} />
          <Info label="Layanan" isi={LAYANAN[p.layanan].nama} />
          <Info label="Berat" isi={n.berat > 0 ? `${kg(n.berat)}${n.sudahTimbang ? '' : ' (perkiraan)'}` : 'Hanya item satuan'} />
          <Info label="Status" isi={namaTahapKini(p, kini)} />
          <View style={st.garis} />

          {n.baris.map((b) => (
            <View key={b.nama} style={st.item}>
              <View style={{ flex: 1 }}>
                <Text style={st.itemNama}>{b.nama}</Text>
                <Text style={st.kecil}>{b.rincian}</Text>
              </View>
              <Text style={st.angka}>{b.jumlah === 0 ? 'Gratis' : rupiah(b.jumlah)}</Text>
            </View>
          ))}
          <View style={st.garis} />
          <View style={st.item}>
            <Text style={[st.itemNama, { flex: 1 }]}>Subtotal</Text>
            <Text style={st.angka}>{rupiah(n.subtotal)}</Text>
          </View>
          {n.diskon ? (
            <View style={st.item}>
              <Text style={[st.itemNama, { flex: 1 }]}>Diskon {p.bayar?.voucher ? `(${p.bayar.voucher.split('-')[0]})` : ''}</Text>
              <Text style={[st.angka, { color: warna.hijau }]}>{rupiah(-n.diskon)}</Text>
            </View>
          ) : null}
          <View style={[st.item, { paddingTop: 6 }]}>
            <Text style={st.totalLabel}>Total{n.sudahTimbang ? '' : ' sementara'}</Text>
            <Text style={st.total}>{rupiah(n.total)}</Text>
          </View>
          <View style={st.garis} />
          <Info label="Pembayaran" isi={p.bayar ? `${METODE[p.bayar.metode].nama} (simulasi)${p.bayar.metode !== 'tunai' ? ` · ${jam(p.bayar.waktu)} WIB` : ''}` : 'Belum dibayar'} />
          <Info label="Poin" isi={sudahLunas ? `+${n.poin} poin masuk` : `+${n.poin} poin setelah lunas`} />
          <Info label="Pewangi" isi={namaPewangi(p.pewangi)} />
          <Text style={[st.kecil, { textAlign: 'center', marginTop: 10 }]}>Simpan nota ini. Komplain maksimal 1×24 jam setelah cucian diterima, lewat tombol di bawah nota.</Text>
          <Text style={[st.kecil, { textAlign: 'center', fontFamily: hurufAngka, letterSpacing: 2, marginTop: 6 }]} aria-hidden>
            ✶ ✶ ✶ {p.no} ✶ ✶ ✶
          </Text>
        </View>
        <TepiGerigi terbalik />
      </View>

      <PenilaianKu p={p} />
      <JalurKomplain p={p} />
      {!p.bayar && indeksTahap(p, kini) < 6 ? (
        <Tombol label={`Bayar ${rupiah(n.total)}`} ikon="dompet" href={{ pathname: '/bayar', params: { no: p.no } }} />
      ) : null}
      <Tombol label="Lihat status cucian" gaya="kedua" ikon="bak" href={{ pathname: '/status', params: { no: p.no } }} />
    </Layar>
  );
}

function Info({ label, isi }: { label: string; isi: string }) {
  return (
    <View style={st.info}>
      <Text style={st.infoLabel}>{label}</Text>
      <Text style={st.infoIsi}>{isi}</Text>
    </View>
  );
}

const st = StyleSheet.create({
  kertasWadah: { marginHorizontal: 2 },
  kertas: { backgroundColor: warna.kartu, paddingHorizontal: 18, paddingVertical: 14 },
  kop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  merek: { fontFamily: hurufJudul, fontSize: 20, color: warna.unguTua },
  kecil: { fontSize: 12, lineHeight: 17, color: warna.redup },
  cap: { borderWidth: 2.5, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, transform: [{ rotate: '-8deg' }] },
  capTeks: { fontFamily: hurufAngka, fontWeight: '800', fontSize: 14, letterSpacing: 2 },
  garis: { borderTopWidth: 1.5, borderStyle: 'dashed', borderColor: '#CFC6E6', marginVertical: 10 },
  info: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 3 },
  infoLabel: { fontSize: 13, color: warna.redup },
  infoIsi: { fontSize: 13, color: warna.tinta, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  item: { flexDirection: 'row', gap: 12, paddingVertical: 5, alignItems: 'flex-start' },
  itemNama: { fontSize: 14, fontWeight: '700', color: warna.tinta },
  angka: { fontFamily: hurufAngka, fontSize: 14, color: warna.tinta, fontVariant: ['tabular-nums'] },
  totalLabel: { flex: 1, fontFamily: hurufJudul, fontSize: 20, color: warna.tinta },
  total: { fontFamily: hurufJudul, fontSize: 24, color: warna.unguTua },
});
