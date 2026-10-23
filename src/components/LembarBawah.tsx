import type { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useJarakAman } from '@/lib/aman';
import { hurufJudul, sudut, warna } from '@/lib/tema';
import Ikon from './Ikon';

export interface PropsLembar {
  terbuka: boolean;
  onTutup: () => void;
  judul: string;
  children: ReactNode;
  bawah?: ReactNode;
}

/** Native: Modal transparan dengan lembar di bawah; tombol kembali Android menutup lembar. */
export default function LembarBawah({ terbuka, onTutup, judul, children, bawah }: PropsLembar) {
  const { bawah: aman } = useJarakAman();
  return (
    <Modal visible={terbuka} transparent animationType="slide" onRequestClose={onTutup} statusBarTranslucent>
      <View style={st.lapis}>
        <Pressable accessibilityLabel="Tutup lembar" style={StyleSheet.absoluteFill} onPress={onTutup} />
        <View accessibilityViewIsModal style={[st.lembar, { paddingBottom: 8 + aman }]}>
          <View style={st.pegangan} />
          <View style={st.kepala}>
            <Text role="heading" style={st.judul}>{judul}</Text>
            <Pressable role="button" aria-label="Tutup" onPress={onTutup} style={st.tutup}>
              <Ikon nama="tutup" ukuran={20} warna={warna.tinta} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={st.isi}>{children}</ScrollView>
          {bawah ? <View style={st.bawah}>{bawah}</View> : null}
        </View>
      </View>
    </Modal>
  );
}

const st = StyleSheet.create({
  lapis: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(33,22,63,0.48)' },
  lembar: { backgroundColor: warna.kartu, borderTopLeftRadius: sudut.besar + 6, borderTopRightRadius: sudut.besar + 6, maxHeight: '88%' },
  pegangan: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: '#CFC6E6', marginTop: 8 },
  kepala: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingTop: 8, paddingBottom: 4 },
  judul: { flex: 1, fontFamily: hurufJudul, fontSize: 21, lineHeight: 26, color: warna.tinta },
  tutup: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: warna.unguMuda },
  isi: { paddingHorizontal: 18, paddingTop: 6, paddingBottom: 14, gap: 12 },
  bawah: { paddingHorizontal: 18, paddingTop: 10, borderTopWidth: 1, borderColor: warna.garis },
});
