/** Penilaian pribadi (gaya busa) + jalur komplain 1×24 jam. Tanpa rating agregat. */
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { BATAS_KOMPLAIN, hitungNota, indeksTahap, type Pesanan } from '@/lib/pesanan';
import { useBusa } from '@/lib/store';
import { hurufAngka, hurufJudul, sudut, warna } from '@/lib/tema';
import { hariKalimat, jam } from '@/lib/waktu';
import Ikon from './Ikon';
import LembarBawah from './LembarBawah';
import { Chip, Judul, Kartu, Teks, Tombol } from './ui';

const LABEL_SKOR = ['Kurang', 'Lumayan', 'Cukup', 'Bagus', 'Puas sekali'];
const PILIHAN_CEPAT = ['Wangi pas', 'Lipatan rapi', 'Noda hilang', 'Kurir tepat waktu', 'Tepat janji'];
const MASALAH = ['Noda masih ada', 'Ada item kurang', 'Kusut / kurang rapi', 'Bau apek', 'Warna luntur', 'Lainnya'];

export function PenilaianKu({ p }: { p: Pesanan }) {
  const { nilai, beriNilai, siap, kini } = useBusa();
  const ada = nilai[p.no];
  const [ubah, setUbah] = useState(false);
  const [skor, setSkor] = useState(ada?.skor ?? 0);
  const [pilihan, setPilihan] = useState<string[]>(ada?.pilihan ?? []);
  if (!siap || indeksTahap(p, kini) < 6) return null;

  if (ada && !ubah) {
    return (
      <Kartu style={{ gap: 8 }}>
        <View style={st.baris}>
          <Judul level={2} ukuran={18}>Penilaianmu</Judul>
          <Pressable role="button" onPress={() => setUbah(true)} style={st.ubah}>
            <Text style={st.ubahTeks}>Ubah</Text>
          </Pressable>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Busa5 skor={ada.skor} />
          <Text style={st.skorTeks}>
            {ada.skor}/5 · {LABEL_SKOR[ada.skor - 1]}
          </Text>
        </View>
        {ada.pilihan.length ? <Teks kecil redup>{ada.pilihan.join(' · ')}</Teks> : null}
        <Teks kecil redup>Hanya tersimpan di perangkatmu. Terima kasih, masukanmu dibaca tim outlet.</Teks>
      </Kartu>
    );
  }

  return (
    <Kartu style={{ gap: 12 }}>
      <Judul level={2} ukuran={18}>Bagaimana cucianmu?</Judul>
      <View role="radiogroup" aria-label="Penilaian 1 sampai 5" style={st.busaBaris}>
        {[1, 2, 3, 4, 5].map((n) => {
          const aktif = n <= skor;
          const besar = 30 + n * 4;
          return (
            <Pressable key={n} role="radio" aria-checked={n === skor} aria-label={`${n} dari 5, ${LABEL_SKOR[n - 1]}`} onPress={() => setSkor(n)} style={st.busaTombol}>
              <View style={[st.busa, { width: besar, height: besar, borderRadius: besar / 2 }, aktif && st.busaAktif]}>
                <View style={[st.kilap, aktif && { backgroundColor: 'rgba(255,255,255,0.7)' }]} />
              </View>
            </Pressable>
          );
        })}
      </View>
      <Text style={st.skorTeks} aria-live="polite">
        {skor ? `${skor}/5 · ${LABEL_SKOR[skor - 1]}` : 'Ketuk gelembung untuk menilai'}
      </Text>
      <View role="group" aria-label="Yang kamu suka" style={st.chipBaris}>
        {PILIHAN_CEPAT.map((x) => (
          <Chip key={x} peran="checkbox" label={x} aktif={pilihan.includes(x)} onPress={() => setPilihan((a) => (a.includes(x) ? a.filter((y) => y !== x) : [...a, x]))} />
        ))}
      </View>
      <Tombol
        label="Simpan penilaian"
        ikon="cek"
        nonaktif={!skor}
        onPress={() => {
          beriNilai(p.no, skor, pilihan);
          setUbah(false);
        }}
      />
    </Kartu>
  );
}

function Busa5({ skor }: { skor: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }} aria-hidden>
      {[1, 2, 3, 4, 5].map((n) => (
        <View key={n} style={[st.busaKecil, { width: 10 + n * 2, height: 10 + n * 2 }, n <= skor && st.busaAktif]} />
      ))}
    </View>
  );
}

/** Tombol + lembar komplain. Muncul sejak cucian siap sampai 24 jam setelah diterima. */
export function JalurKomplain({ p }: { p: Pesanan }) {
  const { komplain, ajukanKomplain, siap, kini } = useBusa();
  const [buka, setBuka] = useState(false);
  const [masalah, setMasalah] = useState<string[]>([]);
  const [item, setItem] = useState<string[]>([]);
  const [catatan, setCatatan] = useState('');
  if (!siap) return null;
  const i = indeksTahap(p, kini);
  if (i < 5) return null;
  const ada = komplain[p.no];
  const batas = p.jadwal.tuntas + BATAS_KOMPLAIN;

  if (ada) {
    return (
      <Kartu style={[st.tiketKomplain, { gap: 6 }]}>
        <View style={st.baris}>
          <Text style={st.kodeKomplain}>{ada.kode}</Text>
          <Text style={st.statusKomplain}>Diproses</Text>
        </View>
        <Text style={st.judulKomplain}>Komplain diterima {hariKalimat(ada.waktu, kini)} {jam(ada.waktu)} WIB</Text>
        <Teks kecil>{ada.masalah.join(', ')}{ada.item.length ? ` · ${ada.item.join(', ')}` : ''}</Teks>
        {ada.catatan ? <Teks kecil redup>“{ada.catatan}”</Teks> : null}
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
          <Ikon nama="wa" ukuran={18} warna={warna.hijau} />
          <Teks kecil style={{ flex: 1 }}>Tim outlet menghubungimu lewat WhatsApp (simulasi) paling lambat 2 jam kerja. Bila perlu, cucian dijemput ulang dan dicuci lagi tanpa biaya.</Teks>
        </View>
      </Kartu>
    );
  }
  if (i === 6 && kini > batas) {
    return <Teks kecil redup style={{ textAlign: 'center' }}>Masa komplain 1×24 jam untuk {p.no} sudah lewat.</Teks>;
  }

  const n = hitungNota(p, kini);
  const daftarItem = n.baris.filter((b) => b.jumlah > 0).map((b) => b.nama);
  const ubah = (x: string, set: (f: (a: string[]) => string[]) => void) => set((a) => (a.includes(x) ? a.filter((y) => y !== x) : [...a, x]));

  return (
    <>
      <Tombol label="Ada masalah dengan cucian?" ikon="komplain" gaya="tipis" onPress={() => setBuka(true)} />
      {i === 6 ? <Teks kecil redup style={{ textAlign: 'center' }}>Komplain bisa diajukan sampai {hariKalimat(batas, kini)} {jam(batas)} WIB.</Teks> : null}
      <LembarBawah
        terbuka={buka}
        onTutup={() => setBuka(false)}
        judul={`Komplain ${p.no}`}
        bawah={
          <Tombol
            label="Kirim komplain"
            ikon="komplain"
            nonaktif={!masalah.length}
            onPress={() => {
              ajukanKomplain(p.no, { masalah, item, catatan: catatan.trim() || undefined });
              setBuka(false);
            }}
          />
        }
      >
        <Teks kecil redup>Pilih masalahnya. Tim outlet akan memeriksa dan menghubungimu. Simulasi: tidak ada pesan sungguhan yang terkirim.</Teks>
        <Text style={st.subLabel}>Masalahnya</Text>
        <View role="group" aria-label="Masalah" style={st.chipBaris}>
          {MASALAH.map((x) => (
            <Chip key={x} peran="checkbox" label={x} aktif={masalah.includes(x)} onPress={() => ubah(x, setMasalah)} />
          ))}
        </View>
        {daftarItem.length ? (
          <>
            <Text style={st.subLabel}>Item terkait (opsional)</Text>
            <View role="group" aria-label="Item terkait" style={st.chipBaris}>
              {daftarItem.map((x) => (
                <Chip key={x} peran="checkbox" label={x} aktif={item.includes(x)} onPress={() => ubah(x, setItem)} />
              ))}
            </View>
          </>
        ) : null}
        <Text style={st.subLabel}>Ceritakan singkat</Text>
        <TextInput
          value={catatan}
          onChangeText={setCatatan}
          multiline
          aria-label="Ceritakan singkat"
          placeholder="Mis. noda kopi di lengan kemeja putih masih terlihat"
          placeholderTextColor="#766E8F"
          style={st.masukan}
        />
      </LembarBawah>
    </>
  );
}

const st = StyleSheet.create({
  baris: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  ubah: { minHeight: 44, minWidth: 44, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: warna.unguMuda },
  ubahTeks: { fontSize: 14, fontWeight: '700', color: warna.unguTua },
  busaBaris: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  busaTombol: { minWidth: 48, minHeight: 56, alignItems: 'center', justifyContent: 'flex-end' },
  busa: { borderWidth: 2, borderColor: '#B9AEDA', backgroundColor: warna.kartu },
  busaAktif: { backgroundColor: warna.ungu, borderColor: warna.ungu },
  kilap: { position: 'absolute', top: '18%', left: '22%', width: '28%', height: '22%', borderRadius: 8, backgroundColor: '#EAE3FC' },
  busaKecil: { borderRadius: 12, borderWidth: 1.5, borderColor: '#B9AEDA' },
  skorTeks: { fontSize: 15, fontWeight: '700', color: warna.tinta, fontVariant: ['tabular-nums'] },
  chipBaris: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  subLabel: { fontSize: 13, fontWeight: '700', color: warna.redup },
  masukan: {
    minHeight: 84,
    borderWidth: 1.5,
    borderColor: warna.lavender,
    borderRadius: sudut.sedang,
    padding: 12,
    fontSize: 15,
    color: warna.tinta,
    textAlignVertical: 'top',
  },
  tiketKomplain: { backgroundColor: warna.kuningMuda, borderColor: '#F3DE8A' },
  kodeKomplain: { fontFamily: hurufAngka, fontSize: 14, fontWeight: '700', color: warna.tinta },
  statusKomplain: { fontSize: 12, fontWeight: '800', color: warna.unguTua, backgroundColor: warna.unguMuda, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, overflow: 'hidden' },
  judulKomplain: { fontFamily: hurufJudul, fontSize: 18, color: warna.tinta },
});
