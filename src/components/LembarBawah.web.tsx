import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { hurufJudul, sudut, warna } from '@/lib/tema';
import Ikon from './Ikon';

export interface PropsLembar {
  terbuka: boolean;
  onTutup: () => void;
  judul: string;
  children: ReactNode;
  bawah?: ReactNode;
}

const FOKUSABEL = 'a[href],button,input,textarea,select,[tabindex]:not([tabindex="-1"])';

/**
 * Web: lembar bawah dirender ke #lapis-lembar (di dalam bingkai ponsel), latar diredupkan,
 * fokus dikurung di dalam lembar, Esc menutup, fokus kembali ke pemicu.
 */
export default function LembarBawah({ terbuka, onTutup, judul, children, bawah }: PropsLembar) {
  const [wadah, setWadah] = useState<HTMLElement | null>(null);
  const lembar = useRef<HTMLElement | null>(null);
  const tutup = useRef<HTMLElement | null>(null);
  const asal = useRef<Element | null>(null);

  useEffect(() => {
    setWadah(document.getElementById('lapis-lembar'));
  }, []);

  useEffect(() => {
    if (!terbuka) return;
    asal.current = document.activeElement;
    const id = setTimeout(() => tutup.current?.focus(), 30);
    const tombol = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onTutup();
        return;
      }
      if (e.key !== 'Tab' || !lembar.current) return;
      const el = Array.from(lembar.current.querySelectorAll<HTMLElement>(FOKUSABEL)).filter((x) => !x.hasAttribute('disabled') && x.offsetParent !== null);
      if (!el.length) return;
      const pertama = el[0];
      const akhir = el[el.length - 1];
      if (e.shiftKey && document.activeElement === pertama) {
        e.preventDefault();
        akhir.focus();
      } else if (!e.shiftKey && document.activeElement === akhir) {
        e.preventDefault();
        pertama.focus();
      } else if (!lembar.current.contains(document.activeElement)) {
        e.preventDefault();
        pertama.focus();
      }
    };
    document.addEventListener('keydown', tombol);
    return () => {
      clearTimeout(id);
      document.removeEventListener('keydown', tombol);
      const a = asal.current as HTMLElement | null;
      if (a && typeof a.focus === 'function') setTimeout(() => a.focus(), 0);
    };
  }, [terbuka]);

  if (!terbuka || !wadah) return null;
  return createPortal(
    <View style={st.lapis}>
      <Pressable aria-hidden style={st.redup} onPress={onTutup} tabIndex={-1} />
      <View ref={(n) => { lembar.current = n as unknown as HTMLElement; }} role="dialog" aria-modal aria-label={judul} style={st.lembar}>
        <View style={st.pegangan} aria-hidden />
        <View style={st.kepala}>
          <Text role="heading" aria-level={2} style={st.judul}>
            {judul}
          </Text>
          <Pressable
            ref={(n) => { tutup.current = n as unknown as HTMLElement; }}
            role="button"
            aria-label="Tutup"
            onPress={onTutup}
            style={st.tutup}
          >
            <Ikon nama="tutup" ukuran={20} warna={warna.tinta} />
          </Pressable>
        </View>
        <ScrollView style={{ flexShrink: 1 }} contentContainerStyle={st.isi}>
          {children}
        </ScrollView>
        {bawah ? <View style={st.bawah}>{bawah}</View> : null}
      </View>
    </View>,
    wadah,
  );
}

const st = StyleSheet.create({
  lapis: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 80, justifyContent: 'flex-end' },
  redup: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(33,22,63,0.48)' },
  lembar: {
    backgroundColor: warna.kartu,
    borderTopLeftRadius: sudut.besar + 6,
    borderTopRightRadius: sudut.besar + 6,
    maxHeight: '88%',
    paddingBottom: 8,
  },
  pegangan: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: '#CFC6E6', marginTop: 8 },
  kepala: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingTop: 8, paddingBottom: 4 },
  judul: { flex: 1, fontFamily: hurufJudul, fontSize: 21, lineHeight: 26, color: warna.tinta },
  tutup: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: warna.unguMuda },
  isi: { paddingHorizontal: 18, paddingTop: 6, paddingBottom: 14, gap: 12 },
  bawah: { paddingHorizontal: 18, paddingTop: 10, borderTopWidth: 1, borderColor: warna.garis },
});
