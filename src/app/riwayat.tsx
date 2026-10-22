import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ikon from '@/components/Ikon';
import { KepalaMerek, Layar } from '@/components/kerangka';
import { Chip, Judul, Kartu, Kerangka, Lencana, Teks, Tombol } from '@/components/ui';
import { LAYANAN, kg, rupiah } from '@/lib/katalog';
import { aktif, hitungNota, lunas, namaTahapKini, type Pesanan } from '@/lib/pesanan';
import { meta } from '@/lib/seo';
import { useBusa } from '@/lib/store';
import { hurufAngka, hurufJudul, sudut, warna } from '@/lib/tema';
import { tanggalPendek } from '@/lib/waktu';

export function generateMetadata() {
  return meta(
    '/riwayat',
    'Riwayat Order & Nota Laundry · Busa Ungu',
    'Semua order laundry dalam satu daftar: tanggal masuk WIB, layanan, berat, total, status bayar, dan tombol pesan lagi dengan catatan yang sama.',
  );
}

type Saring = 'semua' | 'berjalan' | 'selesai';

export default function Riwayat() {
  const { siap, kini, pesanan, aturUlang } = useBusa();
  const [saring, setSaring] = useState<Saring>('semua');
  const [yakin, setYakin] = useState(false);

  const daftar = [...pesanan]
    .filter((p) => (saring === 'semua' ? true : saring === 'berjalan' ? aktif(p, kini) : !aktif(p, kini)))
    .sort((a, b) => b.jadwal.diterima - a.jadwal.diterima);
  const totalBulanIni = pesanan
    .filter((p) => lunas(p, kini) && kini - p.jadwal.diterima < 30 * 86_400_000)
    .reduce((t, p) => t + hitungNota(p, kini).total, 0);

  return (
    <Layar kepala={<KepalaMerek judulHalaman="Riwayat order" />}>
      <View style={{ gap: 4 }}>
        <Judul level={1} ukuran={28}>Riwayat & nota</Judul>
        <Teks redup>{siap ? `${pesanan.length} order · ${rupiah(totalBulanIni)} dibayar 30 hari terakhir` : 'Order dan pembayaranmu'}</Teks>
      </View>

      <View role="tablist" aria-label="Saring order" style={st.saring}>
        {(['semua', 'berjalan', 'selesai'] as Saring[]).map((x) => (
          <Chip key={x} peran="tab" label={x === 'semua' ? 'Semua' : x === 'berjalan' ? 'Berjalan' : 'Selesai'} aktif={saring === x} onPress={() => setSaring(x)} />
        ))}
      </View>

      {!siap ? (
        <>
          <Kerangka tinggi={96} />
          <Kerangka tinggi={96} />
          <Kerangka tinggi={96} />
        </>
      ) : daftar.length === 0 ? (
        <Kartu>
          <Teks>Belum ada order di sini.</Teks>
        </Kartu>
      ) : (
        <View style={{ gap: 10 }}>
          {daftar.map((p) => (
            <BarisOrder key={p.no} p={p} kini={kini} />
          ))}
        </View>
      )}

      <Kartu style={{ gap: 10, marginTop: 8 }} warnaLatar={warna.unguMuda}>
        <Text style={st.judulKecil}>Data demo</Text>
        <Teks kecil>
          Semua order di sini rekaan dan tersimpan di perangkatmu saja. Data contoh menyesuaikan jam sekarang setiap kali kamu kembali setelah beberapa jam.
        </Teks>
        {yakin ? (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Tombol
              label="Ya, atur ulang"
              kecil
              style={{ flex: 1 }}
              onPress={() => {
                aturUlang();
                setYakin(false);
              }}
            />
            <Tombol label="Batal" gaya="tipis" kecil style={{ flex: 1 }} onPress={() => setYakin(false)} />
          </View>
        ) : (
          <Tombol label="Atur ulang data contoh" ikon="ulang" gaya="tipis" kecil onPress={() => setYakin(true)} />
        )}
      </Kartu>
    </Layar>
  );
}

function BarisOrder({ p, kini }: { p: Pesanan; kini: number }) {
  const n = hitungNota(p, kini);
  const jalan = aktif(p, kini);
  const isi = [
    LAYANAN[p.layanan].singkat,
    n.berat > 0 ? kg(n.berat) : null,
    p.satuan.length ? `${p.satuan.reduce((t, x) => t + x.qty, 0)} item satuan` : null,
  ].filter(Boolean).join(' · ');
  return (
    <View style={st.kartu}>
      <Link href={{ pathname: jalan ? '/status' : '/nota', params: { no: p.no } }} asChild>
        <Pressable style={st.atas}>
          <View style={[st.tag, jalan && { backgroundColor: warna.kuning }]}>
            <View style={st.tagLubang} />
            <Text style={st.tagNo}>{p.no.slice(3)}</Text>
          </View>
          <View style={{ flex: 1, gap: 3 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
              <Text style={st.tanggal}>{tanggalPendek(p.jadwal.diterima)}</Text>
              <Text style={st.total}>{rupiah(n.total)}</Text>
            </View>
            <Text style={st.isi} numberOfLines={1}>
              {isi}
            </Text>
            <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
              <Lencana label={namaTahapKini(p, kini)} jenis={jalan ? 'ungu' : 'gelap'} />
              {lunas(p, kini) ? <Lencana label="Lunas" jenis="hijau" /> : <Lencana label={p.bayar?.metode === 'tunai' ? 'Bayar tunai' : 'Belum bayar'} jenis="koral" />}
            </View>
          </View>
          <Ikon nama="panah" ukuran={18} warna={warna.redup} />
        </Pressable>
      </Link>
      {!jalan ? (
        <Link href={{ pathname: '/pesan', params: { ulang: p.no } }} style={st.ulang}>
          Pesan lagi seperti {p.no}
        </Link>
      ) : null}
    </View>
  );
}

const st = StyleSheet.create({
  saring: { flexDirection: 'row', gap: 8 },
  kartu: { backgroundColor: warna.kartu, borderRadius: sudut.besar, borderWidth: 1, borderColor: warna.garis, overflow: 'hidden' },
  atas: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  tag: { width: 54, height: 66, borderRadius: 10, backgroundColor: warna.unguMuda, alignItems: 'center', paddingTop: 8, gap: 8 },
  tagLubang: { width: 10, height: 10, borderRadius: 5, backgroundColor: warna.latar, borderWidth: 1.5, borderColor: '#B9AEDA' },
  tagNo: { fontFamily: hurufJudul, fontSize: 15, color: warna.tinta },
  tanggal: { fontSize: 14, fontWeight: '800', color: warna.tinta },
  total: { fontFamily: hurufAngka, fontSize: 14, fontWeight: '700', color: warna.tinta },
  isi: { fontSize: 13, color: warna.redup },
  ulang: {
    borderTopWidth: 1,
    borderColor: warna.unguMuda,
    paddingVertical: 12,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 14,
    color: warna.unguTua,
  },
  judulKecil: { fontFamily: hurufJudul, fontSize: 17, color: warna.tinta },
});
