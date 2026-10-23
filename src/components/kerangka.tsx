import { Link, router, usePathname, type Href } from 'expo-router';
import { useEffect, type ReactNode, type RefObject } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type ScrollViewInstance } from 'react-native';
import { useJarakAman } from '@/lib/aman';
import { useBusa } from '@/lib/store';
import { hurufJudul, sudut, warna } from '@/lib/tema';
import Gambar from './Gambar';
import Ikon from './Ikon';
import { LOGO, type NamaIkon } from './ikon-data';

/** Pembungkus layar: landmark utama + area gulir. */
export function Layar({ children, kepala, bawah, jarak = 14, refGulir }: { children: ReactNode; kepala?: ReactNode; bawah?: ReactNode; jarak?: number; refGulir?: RefObject<ScrollViewInstance | null> }) {
  return (
    <View role="main" nativeID="isi" style={k.layar}>
      {kepala}
      <ScrollView ref={refGulir} style={k.gulir} contentContainerStyle={[k.isi, { gap: jarak }]} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
      {bawah}
    </View>
  );
}

export function kembaliKe(cadangan: Href) {
  if (router.canGoBack()) router.back();
  else router.replace(cadangan);
}

/** Kepala halaman dalam: tombol kembali + judul. */
export function KepalaDalam({ judul, sub, cadangan = '/', kanan }: { judul: string; sub?: string; cadangan?: Href; kanan?: ReactNode }) {
  const { atas } = useJarakAman();
  return (
    <View style={[k.kepala, { paddingTop: 10 + atas }]}>
      <Pressable role="button" aria-label="Kembali" onPress={() => kembaliKe(cadangan)} style={({ pressed }) => [k.bulat, pressed && { opacity: 0.7 }]}>
        <Ikon nama="kembali" warna={warna.tinta} />
      </Pressable>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text role="heading" aria-level={1} numberOfLines={1} style={k.judulKepala}>
          {judul}
        </Text>
        {sub ? (
          <Text numberOfLines={1} style={k.subKepala}>
            {sub}
          </Text>
        ) : null}
      </View>
      {kanan}
    </View>
  );
}

export function Logo({ ukuran = 36 }: { ukuran?: number }) {
  return <Gambar bentuk={LOGO} kotak={64} ukuran={ukuran} />;
}

/** Kepala untuk layar tab: logo, nama merek, lonceng. */
export function KepalaMerek({ judulHalaman }: { judulHalaman?: string }) {
  const { atas } = useJarakAman();
  const { belumDibaca, siap } = useBusa();
  return (
    <View style={[k.kepala, { paddingTop: 10 + atas }]}>
      <Logo />
      <View style={{ flex: 1 }}>
        <Text style={k.merek}>Busa Ungu</Text>
        {judulHalaman ? <Text style={k.subKepala}>{judulHalaman}</Text> : <Text style={k.subKepala}>Laundry kiloan & satuan</Text>}
      </View>
      <Link href="/notifikasi" asChild>
        <Pressable
          aria-label={siap && belumDibaca ? `Notifikasi, ${belumDibaca} belum dibaca` : 'Notifikasi'}
          style={k.bulat}
        >
          <Ikon nama="lonceng" warna={warna.tinta} />
          {siap && belumDibaca > 0 ? (
            <View style={k.titikNotif} aria-hidden>
              <Text style={k.titikTeks}>{belumDibaca > 9 ? '9+' : belumDibaca}</Text>
            </View>
          ) : null}
        </Pressable>
      </Link>
    </View>
  );
}

const TAB: { href: '/' | '/pesan' | '/riwayat' | '/poin'; label: string; ikon: NamaIkon }[] = [
  { href: '/', label: 'Beranda', ikon: 'beranda' },
  { href: '/pesan', label: 'Jemput', ikon: 'jemput' },
  { href: '/riwayat', label: 'Riwayat', ikon: 'nota' },
  { href: '/poin', label: 'Poin', ikon: 'busa' },
];

export function TabBawah() {
  const path = usePathname();
  const { bawah } = useJarakAman();
  if (!TAB.some((t) => t.href === path)) return null;
  return (
    <View role="navigation" aria-label="Menu utama" style={[k.tab, { paddingBottom: 8 + bawah }]}>
      {TAB.map((t) => {
        const aktif = t.href === path;
        return (
          <Link key={t.href} href={t.href} asChild>
            <Pressable aria-current={aktif ? 'page' : undefined} style={k.tabItem}>
              <View style={[k.tabIkon, aktif && k.tabIkonAktif]}>
                <Ikon nama={t.ikon} ukuran={22} warna={aktif ? warna.putih : warna.redup} tebal={aktif ? 2 : 1.8} />
              </View>
              <Text style={[k.tabLabel, aktif && k.tabLabelAktif]}>{t.label}</Text>
            </Pressable>
          </Link>
        );
      })}
    </View>
  );
}

/** Notifikasi simulasi di dalam aplikasi. */
export function Toast() {
  const { toast, tutupToast } = useBusa();
  const { atas } = useJarakAman();
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(tutupToast, 6000);
    return () => clearTimeout(id);
  }, [toast?.id]);
  return (
    <View role="region" aria-label="Pemberitahuan" style={[k.toastWadah, { top: 70 + atas }]} pointerEvents="box-none">
      <View role="status" aria-live="polite">
      {toast ? (
        <View style={k.toast}>
          <View style={k.toastIkon}>
            <Ikon nama="lonceng" ukuran={18} warna={warna.tinta} />
          </View>
          <Pressable
            role="link"
            style={{ flex: 1 }}
            onPress={() => {
              tutupToast();
              if (toast.no) router.push({ pathname: '/status', params: { no: toast.no } });
            }}
          >
            <Text style={k.toastJudul}>{toast.judul}</Text>
            <Text style={k.toastIsi}>{toast.isi}</Text>
          </Pressable>
          <Pressable role="button" aria-label="Tutup notifikasi" onPress={tutupToast} style={k.toastTutup}>
            <Ikon nama="tutup" ukuran={18} warna={warna.putih} />
          </Pressable>
        </View>
      ) : null}
      </View>
    </View>
  );
}

const k = StyleSheet.create({
  layar: { flex: 1, backgroundColor: warna.latar, minHeight: 0 },
  gulir: { flex: 1 },
  isi: { padding: 16, paddingBottom: 28 },
  kepala: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: warna.latar,
  },
  bulat: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: warna.kartu,
    borderWidth: 1,
    borderColor: warna.garis,
  },
  judulKepala: { fontFamily: hurufJudul, fontSize: 21, lineHeight: 26, color: warna.tinta },
  subKepala: { fontSize: 13, color: warna.redup, marginTop: 1 },
  merek: { fontFamily: hurufJudul, fontSize: 21, lineHeight: 25, color: warna.unguTua },
  titikNotif: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 4,
    backgroundColor: warna.koral,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: warna.latar,
  },
  titikTeks: { color: warna.putih, fontSize: 11, fontWeight: '800' },
  tab: {
    flexDirection: 'row',
    backgroundColor: warna.kartu,
    borderTopWidth: 1,
    borderColor: warna.garis,
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  tabItem: { flex: 1, alignItems: 'center', gap: 3, minHeight: 52, justifyContent: 'center' },
  tabIkon: { width: 52, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  tabIkonAktif: { backgroundColor: warna.ungu },
  tabLabel: { fontSize: 12, fontWeight: '600', color: warna.redup },
  tabLabelAktif: { color: warna.unguTua, fontWeight: '800' },
  toastWadah: { position: 'absolute', left: 12, right: 12, zIndex: 50 },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: warna.tinta,
    borderRadius: sudut.besar,
    padding: 12,
    shadowColor: '#21163F',
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  toastIkon: { width: 34, height: 34, borderRadius: 17, backgroundColor: warna.kuning, alignItems: 'center', justifyContent: 'center' },
  toastJudul: { color: warna.putih, fontWeight: '800', fontSize: 14 },
  toastIsi: { color: '#E4DDF7', fontSize: 13, lineHeight: 18 },
  toastTutup: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 18 },
});
