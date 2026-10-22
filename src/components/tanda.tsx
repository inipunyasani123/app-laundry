/** Komponen ciri khas Busa Ungu: label perawatan, tiket cucian, busa, tepi nota. */
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { LAYANAN, TAHAP } from '@/lib/katalog';
import { indeksTahap, jamSlot, namaTahapKini, perkiraanSelesai, type Pesanan } from '@/lib/pesanan';
import { hurufAngka, hurufJudul, sudut, warna } from '@/lib/tema';
import { hariKalimat, hariRelatif, jam, sisaWaktu } from '@/lib/waktu';
import Gambar from './Gambar';
import Ikon from './Ikon';

/** Deretan simbol tahap bergaya label perawatan pakaian. */
export function LabelTahap({ p, kini, kecil, style }: { p: Pesanan; kini: number; kecil?: boolean; style?: StyleProp<ViewStyle> }) {
  const i = indeksTahap(p, kini);
  const ukuran = kecil ? 34 : 40;
  const label = i === -1 ? 'Belum masuk tahap cuci' : i === 6 ? 'Semua tahap selesai' : `Tahap ${i + 1} dari 6: ${namaTahapKini(p, kini)}`;
  return (
    <View role="img" aria-label={label} style={[t.label, style]}>
      {TAHAP.map((tp, k) => {
        const lewat = k < i || i === 6;
        const kiniIni = k === i;
        return (
          <View key={tp.kode} style={t.labelSel}>
            <View
              style={[
                t.simbol,
                { width: ukuran, height: ukuran, borderRadius: ukuran / 2 },
                lewat && t.simbolLewat,
                kiniIni && t.simbolKini,
              ]}
            >
              <Ikon nama={tp.simbol} ukuran={kecil ? 18 : 21} warna={kiniIni ? warna.putih : lewat ? warna.unguTua : '#7D7596'} tebal={1.7} />
            </View>
            {k < TAHAP.length - 1 ? <View style={[t.sambung, (lewat || kiniIni) && k < i && t.sambungLewat]} /> : null}
          </View>
        );
      })}
    </View>
  );
}

/** Tiket cucian kuning dengan lubang tali: kartu utama cucian berjalan. */
export function TiketCucian({ p, kini, besar }: { p: Pesanan; kini: number; besar?: boolean }) {
  const i = indeksTahap(p, kini);
  const eta = perkiraanSelesai(p);
  const menunggu = i === -1 && p.jemput;
  return (
    <Link href={{ pathname: '/status', params: { no: p.no } }} asChild>
      <Pressable
        style={StyleSheet.flatten([t.tiket, besar && t.tiketBesar])}
      >
        <View style={t.tiketKiri}>
          <View style={t.lubang} />
          <Text style={t.tiketNoKecil}>NO.</Text>
          <Text style={t.tiketNo}>{p.no.slice(3)}</Text>
        </View>
        <View style={t.sobekan} />
        <View style={{ flex: 1, gap: 8, padding: 14, paddingLeft: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <Text style={t.tiketLayanan} numberOfLines={1}>
              {LAYANAN[p.layanan].singkat} · {p.antar ? 'diantar' : 'ambil sendiri'}
            </Text>
            <Ikon nama="panah" ukuran={18} warna={warna.tinta} />
          </View>
          <Text style={[t.tiketTahap, besar && { fontSize: 26, lineHeight: 31 }]}>{namaTahapKini(p, kini)}</Text>
          <LabelTahap p={p} kini={kini} kecil />
          <View style={t.tiketEta}>
            <Ikon nama="jam" ukuran={16} warna={warna.tinta} />
            <Text style={t.tiketEtaTeks}>
              {menunggu
                ? `Dijemput ${hariKalimat(p.jemput!, kini)} · ${jamSlot(p.jemput!)} WIB`
                : `${p.antar ? 'Tiba' : 'Siap'} ${hariKalimat(eta, kini)} ${jam(eta)} WIB · ${sisaWaktu(eta, kini)}`}
            </Text>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

/** Versi ringkas tiket untuk cucian berjalan berikutnya. */
export function TiketMini({ p, kini }: { p: Pesanan; kini: number }) {
  const i = indeksTahap(p, kini);
  const eta = perkiraanSelesai(p);
  const menunggu = i === -1 && p.jemput;
  return (
    <Link href={{ pathname: '/status', params: { no: p.no } }} asChild>
      <Pressable style={t.mini}>
        <View style={t.miniTag}>
          <View style={t.miniLubang} />
          <Text style={t.miniNo}>{p.no.slice(3)}</Text>
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={t.miniTahap}>{namaTahapKini(p, kini)}</Text>
          <Text style={t.miniEta} numberOfLines={1}>
            {menunggu ? `${hariRelatif(p.jemput!, kini)} ${jamSlot(p.jemput!)} WIB` : `${p.antar ? 'Tiba' : 'Siap'} ${hariKalimat(eta, kini)} ${jam(eta)} WIB`}
          </Text>
        </View>
        <Ikon nama="panah" ukuran={18} warna={warna.redup} />
      </Pressable>
    </Link>
  );
}

/** Gelembung dekoratif (busa) untuk latar kartu. */
export function Busa({ style, warnaBusa = 'rgba(255,255,255,0.18)' }: { style?: StyleProp<ViewStyle>; warnaBusa?: string }) {
  const bola: [number, number, number][] = [
    [74, -18, 64],
    [86, 52, 26],
    [64, 70, 14],
    [92, 20, 10],
  ];
  return (
    <View pointerEvents="none" aria-hidden style={[StyleSheet.absoluteFill, { overflow: 'hidden' }, style]}>
      {bola.map(([x, y, r], k) => (
        <View
          key={k}
          style={{
            position: 'absolute',
            left: `${x}%`,
            top: `${y}%`,
            width: r * 2,
            height: r * 2,
            borderRadius: r,
            borderWidth: 2,
            borderColor: warnaBusa,
            marginLeft: -r,
          }}
        />
      ))}
    </View>
  );
}

/** Tepi bergerigi (nota sobek) — atas atau bawah. */
export function TepiGerigi({ warnaIsi = warna.kartu, terbalik }: { warnaIsi?: string; terbalik?: boolean }) {
  const n = 22;
  let d = `M0 ${terbalik ? 0 : 8}`;
  for (let k = 0; k < n; k++) {
    const x = (k * 100) / n;
    const tengah = x + 50 / n;
    const akhir = ((k + 1) * 100) / n;
    d += terbalik ? ` L${tengah} 8 L${akhir} 0` : ` L${tengah} 0 L${akhir} 8`;
  }
  d += terbalik ? ' L100 0 Z' : ' L100 8 Z';
  return (
    <View aria-hidden style={{ height: 8, width: '100%' }}>
      <Gambar bentuk={[{ t: 'path', d, isi: warnaIsi, garis: 'none' }]} kotak={100} lebar={100} tinggi={8} regang />
    </View>
  );
}

export function AngkaBesar({ children, style }: { children: string; style?: object }) {
  return <Text style={[{ fontFamily: hurufAngka, fontSize: 15, color: warna.tinta }, style]}>{children}</Text>;
}

const t = StyleSheet.create({
  label: { flexDirection: 'row', alignItems: 'center' },
  labelSel: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  simbol: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#B9AEDA',
    backgroundColor: warna.kartu,
  },
  simbolLewat: { backgroundColor: warna.lavender, borderColor: warna.lavender },
  simbolKini: { backgroundColor: warna.ungu, borderColor: warna.ungu },
  sambung: { flex: 1, height: 2, backgroundColor: '#D5CCEE', marginHorizontal: 2 },
  sambungLewat: { backgroundColor: warna.ungu },
  tiket: {
    flexDirection: 'row',
    backgroundColor: warna.kuning,
    borderRadius: sudut.besar,
    overflow: 'hidden',
    minHeight: 150,
  },
  tiketBesar: { minHeight: 176 },
  tiketKiri: { width: 74, alignItems: 'center', paddingTop: 14, backgroundColor: '#FFC21A' },
  lubang: { width: 18, height: 18, borderRadius: 9, backgroundColor: warna.latar, marginBottom: 14, borderWidth: 2, borderColor: '#E0A800' },
  tiketNoKecil: { fontFamily: hurufAngka, fontSize: 11, color: warna.tinta, letterSpacing: 1 },
  tiketNo: { fontFamily: hurufJudul, fontSize: 22, color: warna.tinta, transform: [{ rotate: '-90deg' }], marginTop: 22 },
  sobekan: { width: 0, borderLeftWidth: 2, borderStyle: 'dashed', borderColor: '#B98700', marginVertical: 10 },
  tiketLayanan: { fontSize: 13, fontWeight: '700', color: warna.tinta, flex: 1 },
  tiketTahap: { fontFamily: hurufJudul, fontSize: 23, lineHeight: 27, color: warna.tinta },
  tiketEta: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  tiketEtaTeks: { fontSize: 13, lineHeight: 17, fontWeight: '600', color: warna.tinta, flex: 1 },
  mini: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: warna.kartu, borderRadius: sudut.sedang, borderWidth: 1, borderColor: warna.garis, padding: 10, minHeight: 64 },
  miniTag: { width: 64, height: 44, borderRadius: 10, backgroundColor: warna.kuning, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, gap: 6 },
  miniLubang: { width: 9, height: 9, borderRadius: 5, backgroundColor: warna.kartu, borderWidth: 1.5, borderColor: '#E0A800' },
  miniNo: { fontFamily: hurufJudul, fontSize: 14, color: warna.tinta },
  miniTahap: { fontSize: 15, fontWeight: '800', color: warna.tinta },
  miniEta: { fontSize: 13, color: warna.redup },
});
