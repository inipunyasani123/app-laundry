import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import Gambar from '@/components/Gambar';
import Ikon from '@/components/Ikon';
import type { Bentuk, NamaIkon } from '@/components/ikon-data';
import { KepalaDalam, Layar } from '@/components/kerangka';
import { Judul, Kartu, Kerangka, Teks, Tombol } from '@/components/ui';
import { rupiah } from '@/lib/katalog';
import { METODE, hitungNota, nilaiVoucher, type Metode } from '@/lib/pesanan';
import { meta } from '@/lib/seo';
import { useBusa } from '@/lib/store';
import { hurufAngka, hurufJudul, sudut, warna } from '@/lib/tema';
import { jam, tglBulan } from '@/lib/waktu';

export function generateMetadata() {
  return meta('/bayar', 'Pembayaran Simulasi · Busa Ungu', 'Simulasi pembayaran nota laundry: QRIS, dompet digital, virtual account, atau tunai ke kurir. Tidak ada uang sungguhan yang berpindah.', {
    indeks: false,
  });
}

const IKON_METODE: Record<Metode, NamaIkon> = { qris: 'qris', dompet: 'dompet', va: 'bank', tunai: 'uang' };

/** Pola kotak dekoratif mirip QR. Sengaja tidak bisa dipindai. */
function polaQr(benih: string): Bentuk[] {
  let h = 0;
  for (const c of benih) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const acak = () => ((h = (h * 1103515245 + 12345) >>> 0) / 4294967296);
  const out: Bentuk[] = [];
  const n = 25;
  const sudutPos = [[0, 0], [n - 7, 0], [0, n - 7]];
  const diSudut = (x: number, y: number) => sudutPos.some(([a, b]) => x >= a && x < a + 8 && y >= b && y < b + 8);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!diSudut(x, y) && acak() > 0.52) out.push({ t: 'rect', x, y, w: 1, h: 1, isi: '#21163F', garis: 'none' });
  for (const [a, b] of sudutPos) {
    out.push({ t: 'rect', x: a + 0.5, y: b + 0.5, w: 6, h: 6, rx: 1.2, garis: '#21163F', tebal: 1 });
    out.push({ t: 'rect', x: a + 2, y: b + 2, w: 3, h: 3, rx: 0.6, isi: '#5B2FD0', garis: 'none' });
  }
  return out;
}

export default function Bayar() {
  const { no } = useLocalSearchParams<{ no?: string }>();
  const { siap, kini, cari, berjalan, voucher, bayar } = useBusa();
  const p = siap ? cari(no) ?? berjalan.find((x) => !x.bayar) : undefined;
  const [metode, setMetode] = useState<Metode>('qris');
  const [kode, setKode] = useState<string | null>(null);
  const [tahap, setTahap] = useState<'pilih' | 'proses' | 'berhasil'>('pilih');
  const pola = useMemo(() => polaQr(p?.no ?? 'BU'), [p?.no]);

  useEffect(() => {
    if (tahap !== 'proses' || !p) return;
    const id = setTimeout(() => {
      bayar(p.no, metode, kode ?? undefined, kode ? nilaiVoucher(kode, p, kini) : 0);
      setTahap('berhasil');
    }, 1400);
    return () => clearTimeout(id);
  }, [tahap]);

  if (!siap) {
    return (
      <Layar kepala={<KepalaDalam judul="Bayar" sub="Simulasi pembayaran" />}>
        <Kerangka tinggi={180} />
        <Kerangka tinggi={260} />
      </Layar>
    );
  }
  if (!p) {
    return (
      <Layar kepala={<KepalaDalam judul="Bayar" sub="Simulasi pembayaran" />}>
        <Kartu style={{ gap: 12 }}>
          <Teks>Tidak ada nota yang menunggu pembayaran.</Teks>
          <Tombol label="Lihat riwayat" href="/riwayat" gaya="kedua" />
        </Kartu>
      </Layar>
    );
  }

  const n = hitungNota({ ...p, bayar: undefined }, kini);
  const diskon = kode ? nilaiVoucher(kode, p, kini) : 0;
  const total = Math.max(0, n.subtotal - diskon);

  if (tahap === 'berhasil' || (p.bayar && tahap === 'pilih')) {
    const b = p.bayar;
    const dibayar = hitungNota(p, kini).total;
    return (
      <Layar kepala={<KepalaDalam judul="Bayar" sub={p.no} />}>
        <View style={st.sukses}>
          <View style={st.suksesIkon}>
            <Ikon nama="cek" ukuran={40} warna={warna.putih} tebal={2.6} />
          </View>
          <Judul level={2} ukuran={26} style={{ color: warna.putih, textAlign: 'center' }}>
            {b?.metode === 'tunai' ? 'Siap bayar tunai' : 'Pembayaran berhasil'}
          </Judul>
          <Text style={st.suksesTeks}>
            {b?.metode === 'tunai'
              ? `Siapkan ${rupiah(dibayar)} saat kurir mengantar ${p.no}.`
              : `${p.no} lunas lewat ${METODE[b?.metode ?? metode].nama}. Ini simulasi: tidak ada uang yang berpindah.`}
          </Text>
          {b && b.metode !== 'tunai' ? <Text style={st.suksesKecil}>{tglBulan(b.waktu)} · {jam(b.waktu)} WIB · +{Math.floor(dibayar / 1000)} poin</Text> : null}
        </View>
        <Tombol label="Lihat nota" ikon="nota" href={{ pathname: '/nota', params: { no: p.no } }} />
        <Tombol label="Kembali ke beranda" gaya="kedua" href="/" />
      </Layar>
    );
  }

  const bisaVoucher = voucher.map((v) => ({ ...v, nilai: nilaiVoucher(v.kode, p, kini) }));

  return (
    <Layar
      kepala={<KepalaDalam judul="Bayar" sub={`${p.no} · simulasi`} />}
      bawah={
        <View style={st.bawah}>
          <View style={{ flex: 1 }}>
            <Text style={st.bawahLabel}>Total dibayar</Text>
            <Text style={st.bawahTotal}>{rupiah(total)}</Text>
          </View>
          {tahap === 'proses' ? (
            <View style={st.proses} role="status" aria-label="Memproses pembayaran">
              <ActivityIndicator color={warna.putih} />
              <Text style={{ color: warna.putih, fontWeight: '700' }}>Memproses…</Text>
            </View>
          ) : (
            <Tombol label={metode === 'tunai' ? 'Pilih bayar tunai' : 'Bayar sekarang'} ikon="dompet" onPress={() => setTahap('proses')} />
          )}
        </View>
      }
    >
      <Kartu style={st.ringkas}>
        <View style={{ flex: 1 }}>
          <Text style={st.kecilLabel}>NOTA {p.no}</Text>
          <Text style={st.ringkasTotal}>{rupiah(n.subtotal)}</Text>
          <Teks kecil redup>{n.sudahTimbang ? 'Sesuai hasil timbang' : 'Berdasarkan perkiraan berat, bisa berubah setelah ditimbang'}</Teks>
        </View>
      </Kartu>

      <Kartu style={{ gap: 10 }}>
        <Judul level={2} ukuran={18}>Metode pembayaran</Judul>
        <View role="radiogroup" aria-label="Metode pembayaran" style={{ gap: 8 }}>
          {(Object.keys(METODE) as Metode[]).map((m) => {
            const aktif = m === metode;
            return (
              <Pressable key={m} role="radio" aria-checked={aktif} onPress={() => setMetode(m)} style={[st.opsi, aktif && st.opsiAktif]}>
                <View style={[st.opsiIkon, aktif && { backgroundColor: warna.ungu }]}>
                  <Ikon nama={IKON_METODE[m]} ukuran={20} warna={aktif ? warna.putih : warna.unguTua} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={st.opsiJudul}>{METODE[m].nama}</Text>
                  <Text style={st.opsiKet}>{METODE[m].ket}</Text>
                </View>
                {aktif ? <Ikon nama="cek" ukuran={20} warna={warna.ungu} tebal={2.4} /> : null}
              </Pressable>
            );
          })}
        </View>
        {metode === 'qris' ? (
          <View style={st.qr}>
            <Gambar bentuk={pola} kotak={25} ukuran={150} />
            <Text style={st.qrKet}>Contoh tampilan QR. Pola ini rekaan dan tidak bisa dipindai untuk membayar.</Text>
          </View>
        ) : metode === 'va' ? (
          <View style={st.qr}>
            <Text style={st.kecilLabel}>NOMOR VA (SIMULASI)</Text>
            <Text style={st.va}>0000 2412 {p.no.slice(3)}</Text>
            <Text style={st.qrKet}>Nomor contoh, bukan rekening sungguhan.</Text>
          </View>
        ) : metode === 'dompet' ? (
          <View style={st.qr}>
            <Text style={st.kecilLabel}>SALDO DOMPET (SIMULASI)</Text>
            <Text style={st.va}>{rupiah(250000)}</Text>
          </View>
        ) : (
          <View style={st.qr}>
            <Text style={st.qrKet}>Bayar ke kurir saat cucian sampai. Poin masuk setelah pembayaran diterima.</Text>
          </View>
        )}
      </Kartu>

      <Kartu style={{ gap: 10 }}>
        <Judul level={2} ukuran={18}>Voucher</Judul>
        <View role="radiogroup" aria-label="Pilih voucher" style={{ gap: 8 }}>
          <Pressable role="radio" aria-checked={kode === null} onPress={() => setKode(null)} style={[st.opsi, kode === null && st.opsiAktif]}>
            <Text style={[st.opsiJudul, { flex: 1 }]}>Tanpa voucher</Text>
          </Pressable>
          {bisaVoucher.map((v) => {
            const aktif = kode === v.kode;
            const bisa = v.nilai > 0;
            return (
              <Pressable
                key={v.kode}
                role="radio"
                aria-checked={aktif}
                aria-disabled={!bisa || undefined}
                disabled={!bisa}
                onPress={() => setKode(v.kode)}
                style={[st.opsi, aktif && st.opsiAktif, !bisa && { backgroundColor: '#F5F2FA' }]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={st.opsiJudul}>{v.judul}</Text>
                  <Text style={st.opsiKet}>{bisa ? v.ket : 'Tidak berlaku untuk nota ini'}</Text>
                </View>
                {bisa ? <Text style={st.hemat}>{rupiah(-v.nilai)}</Text> : null}
              </Pressable>
            );
          })}
        </View>
      </Kartu>
    </Layar>
  );
}

const st = StyleSheet.create({
  ringkas: { flexDirection: 'row', alignItems: 'center', backgroundColor: warna.unguMuda, borderColor: warna.lavender },
  kecilLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1.4, color: warna.redup },
  ringkasTotal: { fontFamily: hurufJudul, fontSize: 30, color: warna.unguTua, lineHeight: 36 },
  opsi: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: sudut.sedang, borderWidth: 1.5, borderColor: warna.garis, minHeight: 56 },
  opsiAktif: { borderColor: warna.ungu, backgroundColor: '#F7F4FF' },
  opsiIkon: { width: 38, height: 38, borderRadius: 19, backgroundColor: warna.unguMuda, alignItems: 'center', justifyContent: 'center' },
  opsiJudul: { fontSize: 15, fontWeight: '700', color: warna.tinta },
  opsiKet: { fontSize: 13, lineHeight: 18, color: warna.redup },
  hemat: { fontFamily: hurufAngka, fontSize: 14, fontWeight: '700', color: warna.hijau },
  qr: { alignItems: 'center', gap: 8, padding: 14, borderRadius: sudut.sedang, backgroundColor: warna.latar },
  qrKet: { fontSize: 13, lineHeight: 18, color: warna.redup, textAlign: 'center' },
  va: { fontFamily: hurufAngka, fontSize: 22, color: warna.tinta, letterSpacing: 1 },
  bawah: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: warna.kartu, borderTopWidth: 1, borderColor: warna.garis },
  bawahLabel: { fontSize: 12, color: warna.redup, fontWeight: '700' },
  bawahTotal: { fontFamily: hurufJudul, fontSize: 22, lineHeight: 26, color: warna.tinta },
  proses: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: warna.unguTua, borderRadius: 999, minHeight: 50, paddingHorizontal: 20 },
  sukses: { backgroundColor: warna.hijau, borderRadius: sudut.besar, padding: 22, alignItems: 'center', gap: 10 },
  suksesIkon: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  suksesTeks: { color: warna.putih, fontSize: 15, lineHeight: 22, textAlign: 'center' },
  suksesKecil: { color: '#D9F2E7', fontSize: 13, fontFamily: hurufAngka },
});
