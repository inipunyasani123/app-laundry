import { Link, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { hurufAngka, hurufJudul, sudut, warna } from '@/lib/tema';
import Ikon from './Ikon';
import type { NamaIkon } from './ikon-data';

export function Judul({ children, level = 2, style, ukuran }: { children: ReactNode; level?: 1 | 2 | 3; style?: StyleProp<TextStyle>; ukuran?: number }) {
  const besar = ukuran ?? (level === 1 ? 30 : level === 2 ? 21 : 17);
  return (
    <Text role="heading" aria-level={level} style={[s.judul, { fontSize: besar, lineHeight: Math.round(besar * 1.18) }, style]}>
      {children}
    </Text>
  );
}

export function Teks({ children, style, redup, kecil, tebal, angka, numberOfLines }: {
  children: ReactNode; style?: StyleProp<TextStyle>; redup?: boolean; kecil?: boolean; tebal?: boolean; angka?: boolean; numberOfLines?: number;
}) {
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[s.teks, kecil && s.kecil, redup && s.redup, tebal && s.tebal, angka && s.angka, style]}
    >
      {children}
    </Text>
  );
}

export function Kartu({ children, style, warnaLatar }: { children: ReactNode; style?: StyleProp<ViewStyle>; warnaLatar?: string }) {
  return <View style={[s.kartu, warnaLatar ? { backgroundColor: warnaLatar } : null, style]}>{children}</View>;
}

type Gaya = 'utama' | 'kedua' | 'tipis' | 'kuning';

export function Tombol({ label, onPress, href, gaya = 'utama', ikon, style, nonaktif, labelAria, kecil }: {
  label: string; onPress?: () => void; href?: Href; gaya?: Gaya; ikon?: NamaIkon; style?: StyleProp<ViewStyle>;
  nonaktif?: boolean; labelAria?: string; kecil?: boolean;
}) {
  const warnaTeks = gaya === 'utama' ? warna.putih : gaya === 'kuning' ? warna.tinta : warna.unguTua;
  const isi = (
    <>
      {ikon ? <Ikon nama={ikon} ukuran={kecil ? 18 : 20} warna={warnaTeks} /> : null}
      <Text style={[s.labelTombol, kecil && { fontSize: 14 }, { color: warnaTeks }]}>{label}</Text>
    </>
  );
  const gayaTombol = ({ pressed }: { pressed: boolean }) => [
    s.tombol,
    kecil && s.tombolKecil,
    gaya === 'utama' && s.tUtama,
    gaya === 'kedua' && s.tKedua,
    gaya === 'tipis' && s.tTipis,
    gaya === 'kuning' && s.tKuning,
    nonaktif && s.nonaktif,
    pressed && !nonaktif && s.ditekan,
    style,
  ];
  if (href && !nonaktif) {
    return (
      <Link href={href} asChild>
        <Pressable aria-label={labelAria} style={StyleSheet.flatten(gayaTombol({ pressed: false }))}>
          {isi}
        </Pressable>
      </Link>
    );
  }
  return (
    <Pressable
      role="button"
      aria-label={labelAria}
      aria-disabled={nonaktif || undefined}
      disabled={nonaktif}
      onPress={onPress}
      style={gayaTombol}
    >
      {isi}
    </Pressable>
  );
}

export function Chip({ label, aktif, onPress, ikon, peran = 'radio', labelAria }: {
  label: string; aktif: boolean; onPress: () => void; ikon?: NamaIkon; peran?: 'radio' | 'checkbox' | 'tab'; labelAria?: string;
}) {
  const props =
    peran === 'tab' ? { 'aria-selected': aktif } : { 'aria-checked': aktif };
  return (
    <Pressable
      role={peran}
      {...props}
      aria-label={labelAria}
      onPress={onPress}
      style={({ pressed }) => [s.chip, aktif && s.chipAktif, pressed && s.ditekan]}
    >
      {ikon ? <Ikon nama={ikon} ukuran={16} warna={aktif ? warna.putih : warna.unguTua} /> : null}
      <Text style={[s.chipTeks, aktif && { color: warna.putih }]}>{label}</Text>
    </Pressable>
  );
}

export function Lencana({ label, jenis = 'ungu' }: { label: string; jenis?: 'ungu' | 'hijau' | 'koral' | 'kuning' | 'gelap' }) {
  const peta = {
    ungu: [warna.unguMuda, warna.unguTua],
    hijau: [warna.hijauMuda, warna.hijau],
    koral: [warna.koralMuda, warna.koral],
    kuning: [warna.kuning, warna.tinta],
    gelap: [warna.tinta, warna.putih],
  } as const;
  const [bg, fg] = peta[jenis];
  return (
    <View style={[s.lencana, { backgroundColor: bg }]}>
      <Text style={[s.lencanaTeks, { color: fg }]}>{label}</Text>
    </View>
  );
}

/** Garis putus-putus seperti jahitan label pakaian. */
export function Jahitan({ style, warnaGaris = warna.garis }: { style?: StyleProp<ViewStyle>; warnaGaris?: string }) {
  return <View style={[{ borderTopWidth: 1.5, borderStyle: 'dashed', borderColor: warnaGaris }, style]} />;
}

export function Kerangka({ tinggi = 120, style }: { tinggi?: number; style?: StyleProp<ViewStyle> }) {
  return <View aria-hidden style={[s.kerangka, { height: tinggi }, style]} />;
}

export const s = StyleSheet.create({
  judul: { fontFamily: hurufJudul, color: warna.tinta, letterSpacing: -0.2 },
  teks: { fontSize: 15, lineHeight: 22, color: warna.tinta },
  kecil: { fontSize: 13, lineHeight: 18 },
  redup: { color: warna.redup },
  tebal: { fontWeight: '700' },
  angka: { fontFamily: hurufAngka, letterSpacing: -0.2 },
  kartu: {
    backgroundColor: warna.kartu,
    borderRadius: sudut.besar,
    padding: 16,
    borderWidth: 1,
    borderColor: warna.garis,
  },
  tombol: {
    minHeight: 50,
    borderRadius: sudut.bulat,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  tombolKecil: { minHeight: 40, paddingHorizontal: 14 },
  tUtama: { backgroundColor: warna.ungu },
  tKedua: { backgroundColor: warna.unguMuda },
  tTipis: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: warna.lavender },
  tKuning: { backgroundColor: warna.kuning },
  nonaktif: { opacity: 0.45 },
  ditekan: { opacity: 0.82, transform: [{ scale: 0.98 }] },
  labelTombol: { fontSize: 16, fontWeight: '700' },
  chip: {
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: sudut.bulat,
    borderWidth: 1.5,
    borderColor: warna.lavender,
    backgroundColor: warna.kartu,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chipAktif: { backgroundColor: warna.ungu, borderColor: warna.ungu },
  chipTeks: { fontSize: 14, fontWeight: '600', color: warna.unguTua },
  lencana: { alignSelf: 'flex-start', borderRadius: sudut.bulat, paddingHorizontal: 10, paddingVertical: 3 },
  lencanaTeks: { fontSize: 12, fontWeight: '700', letterSpacing: 0.2 },
  kerangka: { backgroundColor: warna.unguMuda, borderRadius: sudut.besar },
});
