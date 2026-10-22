import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Ikon from '@/components/Ikon';
import { KepalaMerek, Layar } from '@/components/kerangka';
import { Busa } from '@/components/tanda';
import { Judul, Kartu, Kerangka, Teks, Tombol } from '@/components/ui';
import { TINGKAT, TUKAR_POIN, ribuan } from '@/lib/katalog';
import { meta } from '@/lib/seo';
import { useBusa } from '@/lib/store';
import { hurufAngka, hurufJudul, sudut, warna } from '@/lib/tema';
import { tglBulan } from '@/lib/waktu';

export function generateMetadata() {
  return meta(
    '/poin',
    'Poin, Promo & Kartu Cap Laundry · Busa Ungu',
    'Kumpulkan 1 poin tiap Rp1.000, naik tingkat member, tukar poin jadi voucher, dan isi kartu cap: 10 cucian kiloan dapat 3 kg gratis.',
  );
}

export default function Poin() {
  const { siap, poin, voucher, tukarPoin } = useBusa();
  const [pesan, setPesan] = useState('');

  return (
    <Layar kepala={<KepalaMerek judulHalaman="Poin & promo" />}>
      <Judul level={1} ukuran={28}>Poin & promo</Judul>

      <View style={st.saldo}>
        <Busa />
        <Text style={st.saldoLabel}>SALDO POIN</Text>
        <Text style={st.saldoAngka}>{siap ? ribuan(poin.saldo) : '···'}</Text>
        <Text style={st.saldoTingkat}>{siap ? `Tingkat ${poin.tingkat}` : 'Tingkat member'}</Text>
        <View style={st.bar} role="progressbar" aria-label="Menuju tingkat berikutnya" aria-valuemin={0} aria-valuemax={100} aria-valuenow={siap ? Math.round(poin.persen * 100) : 0}>
          <View style={[st.barIsi, { width: `${siap ? Math.max(4, Math.round(poin.persen * 100)) : 4}%` }]} />
        </View>
        <Text style={st.saldoKet}>
          {siap ? (poin.berikut ? `${ribuan(poin.kurang)} poin lagi ke ${poin.berikut}` : 'Tingkat tertinggi. Terima kasih!') : '1 poin tiap Rp1.000'}
        </Text>
      </View>

      <Kartu style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Judul level={2} ukuran={18}>Kartu cap</Judul>
          <Text style={st.kecilTebal}>{siap ? `${Math.min(10, poin.cap)}/10` : ''}</Text>
        </View>
        <Teks kecil redup>10 cucian kiloan dalam 90 hari = 3 kg gratis. Cap masuk saat cucian selesai.</Teks>
        <View style={st.cap} role="img" aria-label={siap ? `${poin.cap} dari 10 cap terisi, ${poin.capBerjalan} menunggu cucian selesai` : 'Kartu cap'}>
          {Array.from({ length: 10 }).map((_, i) => {
            const isi = siap && i < poin.cap;
            const tunggu = siap && !isi && i < poin.cap + poin.capBerjalan;
            return (
              <View key={i} style={[st.capBulat, isi && st.capIsi, tunggu && st.capTunggu]}>
                {isi ? <Ikon nama="busa" ukuran={20} warna={warna.putih} /> : <Text style={[st.capNo, tunggu && { color: warna.unguTua }]}>{i + 1}</Text>}
              </View>
            );
          })}
        </View>
        {siap && poin.capBerjalan ? <Teks kecil>{poin.capBerjalan} cap lagi menunggu cucian yang sedang berjalan.</Teks> : null}
      </Kartu>

      <View style={{ gap: 10 }}>
        <Judul level={2} ukuran={18}>Voucher kamu</Judul>
        {!siap ? (
          <Kerangka tinggi={90} />
        ) : (
          voucher.map((v) => (
            <View key={v.kode} style={st.voucher}>
              <View style={st.voucherKiri}>
                <Ikon nama="hadiah" ukuran={22} warna={warna.tinta} />
              </View>
              <View style={st.voucherSobek} />
              <View style={{ flex: 1, padding: 12, gap: 2 }}>
                <Text style={st.voucherJudul}>{v.judul}</Text>
                <Text style={st.voucherKet}>{v.ket}</Text>
                <Text style={st.voucherKode}>
                  {v.kode.split('-')[0]} · s.d. {tglBulan(v.sampai)}
                </Text>
              </View>
            </View>
          ))
        )}
        <Teks kecil redup>Voucher dipakai di halaman bayar. Diskon langsung terpotong dari nota.</Teks>
      </View>

      <Kartu style={{ gap: 10 }}>
        <Judul level={2} ukuran={18}>Tukar poin</Judul>
        {TUKAR_POIN.map((t) => {
          const cukup = siap && poin.saldo >= t.poin;
          return (
            <View key={t.kode} style={st.tukar}>
              <View style={{ flex: 1 }}>
                <Text style={st.voucherJudul}>{t.judul}</Text>
                <Text style={st.voucherKet}>{ribuan(t.poin)} poin</Text>
              </View>
              <Tombol
                label="Tukar"
                kecil
                gaya={cukup ? 'utama' : 'tipis'}
                nonaktif={!cukup}
                labelAria={`Tukar ${ribuan(t.poin)} poin jadi ${t.judul}`}
                onPress={() => {
                  if (tukarPoin(t.kode)) setPesan(`${t.judul} masuk ke daftar voucher (simulasi).`);
                }}
              />
            </View>
          );
        })}
        <View role="status" aria-live="polite">
          {pesan ? <Text style={[st.kecilTebal, { color: warna.hijau }]}>{pesan}</Text> : null}
        </View>
      </Kartu>

      <Kartu warnaLatar={warna.kuningMuda} style={{ gap: 8, borderColor: '#F3DE8A' }}>
        <Judul level={2} ukuran={18}>Tingkat member</Judul>
        {TINGKAT.map((t, i) => (
          <View key={t.nama} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={[st.kecilTebal, siap && poin.tingkat === t.nama && { color: warna.unguTua }]}>
              {t.nama}
              {siap && poin.tingkat === t.nama ? ' (kamu)' : ''}
            </Text>
            <Text style={st.voucherKet}>{i === 0 ? 'Mulai' : `${ribuan(t.min)}+ poin`}</Text>
          </View>
        ))}
        <Teks kecil redup>Busa Lembut: gratis ongkir 3–6 km. Busa Wangi: jemput prioritas dan pewangi premium.</Teks>
      </Kartu>
    </Layar>
  );
}

const st = StyleSheet.create({
  saldo: { backgroundColor: warna.unguTua, borderRadius: sudut.besar, padding: 18, overflow: 'hidden', gap: 2 },
  saldoLabel: { color: '#E1D8FF', fontSize: 12, fontWeight: '800', letterSpacing: 1.5 },
  saldoAngka: { fontFamily: hurufJudul, color: warna.putih, fontSize: 52, lineHeight: 60 },
  saldoTingkat: { color: warna.kuning, fontWeight: '800', fontSize: 15 },
  bar: { height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.2)', marginTop: 12, overflow: 'hidden' },
  barIsi: { height: 10, borderRadius: 5, backgroundColor: warna.kuning },
  saldoKet: { color: '#ECE6FF', fontSize: 13, marginTop: 6 },
  kecilTebal: { fontSize: 14, fontWeight: '800', color: warna.tinta },
  cap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' },
  capBulat: { width: '17%', aspectRatio: 1, borderRadius: 999, borderWidth: 2, borderStyle: 'dashed', borderColor: '#B9AEDA', alignItems: 'center', justifyContent: 'center' },
  capIsi: { backgroundColor: warna.ungu, borderColor: warna.ungu, borderStyle: 'solid' },
  capTunggu: { borderColor: warna.ungu, backgroundColor: warna.unguMuda },
  capNo: { fontFamily: hurufAngka, fontSize: 13, color: warna.redup },
  voucher: { flexDirection: 'row', backgroundColor: warna.kartu, borderRadius: sudut.sedang, borderWidth: 1, borderColor: warna.garis, overflow: 'hidden' },
  voucherKiri: { width: 56, backgroundColor: warna.kuning, alignItems: 'center', justifyContent: 'center' },
  voucherSobek: { borderLeftWidth: 2, borderStyle: 'dashed', borderColor: '#E0A800' },
  voucherJudul: { fontSize: 15, fontWeight: '800', color: warna.tinta },
  voucherKet: { fontSize: 13, lineHeight: 18, color: warna.redup },
  voucherKode: { fontFamily: hurufAngka, fontSize: 12, color: warna.unguTua, marginTop: 2 },
  tukar: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
});
