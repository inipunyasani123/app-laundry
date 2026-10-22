import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import Ikon from '@/components/Ikon';
import { KepalaMerek, Layar } from '@/components/kerangka';
import { Chip, Judul, Kartu, Kerangka, Teks, Tombol } from '@/components/ui';
import {
  BERAT_MINIMUM, EKSTRA, LAYANAN, NODA, PEWANGI, SATUAN, SLOT_JEMPUT, URUTAN_LAYANAN, rupiah, type KodeLayanan,
} from '@/lib/katalog';
import { ALAMAT, jamSlot, susunJadwal } from '@/lib/pesanan';
import { meta } from '@/lib/seo';
import { useBusa } from '@/lib/store';
import { hurufAngka, hurufJudul, sudut, warna } from '@/lib/tema';
import { HARI_MS, JAM, MENIT, hariKalimat, hariRelatif, jam, padaJam, tglBulan } from '@/lib/waktu';

export function generateMetadata() {
  return meta(
    '/pesan',
    'Pesan Jemput-Antar Laundry · Busa Ungu',
    'Pilih layanan kiloan atau satuan, slot jam jemput, alamat, lalu catat noda dan pewangi. Kurir menjemput dan mengantar balik cucianmu.',
  );
}

export default function Pesan() {
  const { siap, kini, cari, buatPesanan } = useBusa();
  const { ulang } = useLocalSearchParams<{ ulang?: string }>();

  const [layanan, setLayanan] = useState<KodeLayanan>('reguler');
  const [berat, setBerat] = useState(4);
  const [satuan, setSatuan] = useState<Record<string, number>>({});
  const [hari, setHari] = useState(0);
  const [slot, setSlot] = useState<number | null>(null);
  const [alamatKe, setAlamatKe] = useState(0);
  const [patokan, setPatokan] = useState('');
  const [antar, setAntar] = useState(true);
  const [noda, setNoda] = useState<string[]>([]);
  const [catatanNoda, setCatatanNoda] = useState('');
  const [pewangi, setPewangi] = useState('lavender');
  const [pisahWarna, setPisahWarna] = useState(true);
  const [lipat, setLipat] = useState<'lipat' | 'gantung'>('lipat');
  const [catatan, setCatatan] = useState('');
  const [semuaSatuan, setSemuaSatuan] = useState(false);

  // Pesan ulang dari riwayat: isi formulir dengan preferensi order lama.
  useEffect(() => {
    if (!siap || !ulang) return;
    const lama = cari(ulang);
    if (!lama) return;
    setLayanan(lama.layanan);
    setBerat(Math.max(0, Math.round(lama.berat)));
    setSatuan(Object.fromEntries(lama.satuan.map((x) => [x.kode, x.qty])));
    setAntar(lama.antar);
    setPewangi(lama.pewangi);
    setPisahWarna(lama.pisahWarna);
    setLipat(lama.lipat);
  }, [siap, ulang]);

  const pilihanHari = useMemo(() => {
    if (!siap) return [];
    return [0, 1, 2].map((h) => {
      const dasar = kini + h * HARI_MS;
      const slots = SLOT_JEMPUT.map((j, k) => {
        const mulai = padaJam(dasar, j);
        const lewat = mulai - kini < JAM;
        // Satu slot besok "penuh" agar terasa nyata.
        const penuh = h === 1 && k === 2;
        return { mulai, bisa: !lewat && !penuh, alasan: lewat ? 'lewat' : penuh ? 'penuh' : '' };
      });
      return { h, dasar, slots };
    });
  }, [siap, kini]);

  // Pilih slot pertama yang tersedia secara otomatis.
  useEffect(() => {
    if (!pilihanHari.length) return;
    const hariIni = pilihanHari[hari];
    if (slot && hariIni.slots.some((x) => x.mulai === slot && x.bisa)) return;
    const pertama = hariIni.slots.find((x) => x.bisa);
    if (pertama) setSlot(pertama.mulai);
    else if (hari === 0) setHari(1);
    else setSlot(null);
  }, [pilihanHari, hari]);

  const daftarSatuan = Object.entries(satuan).filter(([, q]) => q > 0).map(([kode, qty]) => ({ kode, qty }));
  const lay = LAYANAN[layanan];
  const kiloan = berat > 0 ? Math.max(berat, BERAT_MINIMUM) * lay.hargaKg : 0;
  const hargaSatuan = daftarSatuan.reduce((t, x) => t + (SATUAN.find((s) => s.kode === x.kode)?.harga ?? 0) * x.qty, 0);
  const hargaNoda = noda.length * EKSTRA.noda.harga;
  const perkiraan = kiloan + hargaSatuan + hargaNoda;
  const kosong = berat === 0 && daftarSatuan.length === 0;
  const jadwal = slot ? susunJadwal(slot + 50 * MENIT, layanan, antar) : null;
  const selesai = jadwal ? (antar ? jadwal.tuntas : jadwal.siap) : null;

  const kirim = () => {
    if (!slot || kosong) return;
    const no = buatPesanan({
      layanan,
      antar,
      jemput: slot,
      alamat: `${ALAMAT[alamatKe].isi}${patokan ? ` · ${patokan}` : ''}`,
      beratPerkiraan: berat,
      satuan: daftarSatuan,
      noda,
      catatanNoda: catatanNoda || undefined,
      pewangi,
      pisahWarna,
      lipat,
      catatan: catatan || undefined,
    });
    router.replace({ pathname: '/status', params: { no } });
  };

  const bilahBawah = (
    <View style={st.bawah}>
      <View style={{ flex: 1 }}>
        <Text style={st.bawahLabel}>Perkiraan biaya</Text>
        <Text style={st.bawahTotal}>{rupiah(perkiraan)}</Text>
        <Text style={st.bawahKet} numberOfLines={1}>
          {siap && selesai ? `Selesai ${hariRelatif(selesai, kini).includes(',') ? tglBulan(selesai) : hariKalimat(selesai, kini)}, ${jam(selesai)} WIB` : 'Final setelah ditimbang'}
        </Text>
      </View>
      <Tombol label="Pesan jemput" ikon="motor" onPress={kirim} nonaktif={!siap || !slot || kosong} />
    </View>
  );

  return (
    <Layar kepala={<KepalaMerek judulHalaman="Jemput-antar" />} bawah={bilahBawah} jarak={16}>
      <View style={{ gap: 4 }}>
        <Judul level={1} ukuran={28}>Jadwalkan jemput</Judul>
        <Teks redup>Gratis jemput-antar sampai 3 km. Kurir membawa tas cucian ungu bertiket.</Teks>
      </View>

      <Bagian judul="1. Layanan">
        <View role="radiogroup" aria-label="Pilih layanan" style={{ gap: 8 }}>
          {URUTAN_LAYANAN.map((k) => {
            const l = LAYANAN[k];
            const aktif = k === layanan;
            return (
              <Pressable key={k} role="radio" aria-checked={aktif} onPress={() => setLayanan(k)} style={[st.opsi, aktif && st.opsiAktif]}>
                <View style={[st.radio, aktif && st.radioAktif]}>{aktif ? <View style={st.radioIsi} /> : null}</View>
                <View style={{ flex: 1 }}>
                  <Text style={st.opsiJudul}>{l.nama}</Text>
                  <Text style={st.opsiKet}>{l.ket}</Text>
                </View>
                <Text style={st.opsiHarga}>{rupiah(l.hargaKg)}/kg</Text>
              </Pressable>
            );
          })}
        </View>
      </Bagian>

      <Bagian judul="2. Perkiraan berat & item satuan">
        <View style={st.stepperBaris}>
          <View style={{ flex: 1 }}>
            <Text style={st.opsiJudul}>Cucian kiloan</Text>
            <Text style={st.opsiKet}>{berat === 0 ? 'Tidak ada, hanya item satuan' : `Minimum ditagih ${BERAT_MINIMUM} kg. Berat final setelah ditimbang.`}</Text>
          </View>
          <Stepper nilai={berat} satuan="kg" min={0} max={20} onUbah={setBerat} label="Perkiraan berat kiloan" />
        </View>
        <View style={{ gap: 2 }}>
          {(semuaSatuan ? SATUAN : SATUAN.slice(0, 4)).map((it) => (
            <View key={it.kode} style={st.stepperBaris}>
              <View style={{ flex: 1 }}>
                <Text style={st.opsiJudul}>{it.nama}</Text>
                <Text style={st.opsiKet}>
                  {rupiah(it.harga)} · {it.ket}
                </Text>
              </View>
              <Stepper
                nilai={satuan[it.kode] ?? 0}
                min={0}
                max={10}
                label={it.nama}
                onUbah={(n) => setSatuan((x) => ({ ...x, [it.kode]: n }))}
              />
            </View>
          ))}
        </View>
        <Tombol
          label={semuaSatuan ? 'Ringkas daftar' : `Lihat ${SATUAN.length - 4} item satuan lain`}
          gaya="tipis"
          kecil
          onPress={() => setSemuaSatuan((x) => !x)}
        />
      </Bagian>

      <Bagian judul="3. Jadwal jemput (WIB)">
        {!siap ? (
          <Kerangka tinggi={150} />
        ) : (
          <>
            <View role="radiogroup" aria-label="Pilih hari jemput" style={st.barisChip}>
              {pilihanHari.map((d) => (
                <Chip key={d.h} label={`${hariRelatif(d.dasar, kini)} · ${tglBulan(d.dasar)}`} aktif={hari === d.h} onPress={() => setHari(d.h)} />
              ))}
            </View>
            <View role="radiogroup" aria-label="Pilih slot jam jemput" style={st.gridSlot}>
              {pilihanHari[hari]?.slots.map((x) => {
                const aktif = x.mulai === slot;
                return (
                  <Pressable
                    key={x.mulai}
                    role="radio"
                    aria-checked={aktif}
                    aria-disabled={!x.bisa || undefined}
                    disabled={!x.bisa}
                    aria-label={`${jamSlot(x.mulai)} WIB${x.alasan === 'penuh' ? ', penuh' : x.alasan === 'lewat' ? ', sudah lewat' : ''}`}
                    onPress={() => setSlot(x.mulai)}
                    style={[st.slot, aktif && st.slotAktif, !x.bisa && st.slotMati]}
                  >
                    <Text style={[st.slotJam, aktif && { color: warna.putih }, !x.bisa && { color: warna.redup }]}>{jamSlot(x.mulai)}</Text>
                    <Text style={[st.slotKet, aktif && { color: '#E9E2FF' }]}>{x.alasan === 'penuh' ? 'Penuh' : x.alasan === 'lewat' ? 'Lewat' : aktif ? 'Dipilih' : 'Tersedia'}</Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}
      </Bagian>

      <Bagian judul="4. Alamat & pengantaran">
        <View role="radiogroup" aria-label="Pilih alamat" style={st.barisChip}>
          {ALAMAT.map((a, k) => (
            <Chip key={a.label} label={a.label} ikon="lokasi" aktif={alamatKe === k} onPress={() => setAlamatKe(k)} />
          ))}
        </View>
        <Text style={st.alamat}>{ALAMAT[alamatKe].isi}</Text>
        <Masukan label="Patokan untuk kurir (opsional)" nilai={patokan} onUbah={setPatokan} contoh="Pagar hijau, sebelah warung" />
        <View role="radiogroup" aria-label="Setelah selesai" style={st.barisChip}>
          <Chip label="Diantar balik" ikon="motor" aktif={antar} onPress={() => setAntar(true)} />
          <Chip label="Ambil sendiri" ikon="keranjang" aktif={!antar} onPress={() => setAntar(false)} />
        </View>
      </Bagian>

      <Bagian judul="5. Catatan khusus">
        <Text style={st.subLabel}>Ada noda? Tandai supaya dirawat dulu (+{rupiah(EKSTRA.noda.harga)} per titik)</Text>
        <View role="group" aria-label="Jenis noda" style={st.barisChip}>
          {NODA.map((n) => (
            <Chip
              key={n}
              peran="checkbox"
              label={n}
              aktif={noda.includes(n)}
              onPress={() => setNoda((x) => (x.includes(n) ? x.filter((y) => y !== n) : [...x, n]))}
            />
          ))}
        </View>
        {noda.length ? <Masukan label="Letak noda" nilai={catatanNoda} onUbah={setCatatanNoda} contoh="Kemeja putih, kerah belakang" /> : null}
        <Text style={st.subLabel}>Pewangi</Text>
        <View role="radiogroup" aria-label="Pewangi" style={st.barisChip}>
          {PEWANGI.map((p) => (
            <Chip key={p.kode} label={p.nama} ikon="tetes" aktif={pewangi === p.kode} onPress={() => setPewangi(p.kode)} labelAria={`${p.nama}: ${p.ket}`} />
          ))}
        </View>
        <View style={st.saklar}>
          <View style={{ flex: 1 }}>
            <Text style={st.opsiJudul}>Pisahkan putih & warna</Text>
            <Text style={st.opsiKet}>Dicuci di mesin berbeda</Text>
          </View>
          <Switch
            value={pisahWarna}
            onValueChange={setPisahWarna}
            aria-label="Pisahkan putih dan warna"
            trackColor={{ true: warna.ungu, false: '#BDB3D6' }}
            thumbColor={warna.putih}
            {...({ activeThumbColor: warna.putih } as object)}
          />
        </View>
        <View role="radiogroup" aria-label="Hasil akhir" style={st.barisChip}>
          <Chip label="Dilipat" ikon="lipatan" aktif={lipat === 'lipat'} onPress={() => setLipat('lipat')} />
          <Chip label="Digantung" ikon="gantungan" aktif={lipat === 'gantung'} onPress={() => setLipat('gantung')} />
        </View>
        <Masukan label="Pesan lain (opsional)" nilai={catatan} onUbah={setCatatan} contoh="Seragam sekolah dulu, ya" banyak />
      </Bagian>

      <Kartu warnaLatar={warna.unguMuda} style={{ gap: 4, borderColor: warna.lavender }}>
        <Text style={st.opsiJudul}>Ringkasan</Text>
        <Teks kecil>
          {lay.nama}
          {berat > 0 ? ` ± ${berat} kg` : ''}
          {daftarSatuan.length ? ` + ${daftarSatuan.reduce((t, x) => t + x.qty, 0)} item satuan` : ''}
          {noda.length ? ` + ${noda.length} titik noda` : ''}
        </Teks>
        <Teks kecil>
          {siap && slot ? `Jemput ${hariKalimat(slot, kini)} ${jamSlot(slot)} WIB · ${antar ? 'diantar balik' : 'ambil sendiri'}` : 'Pilih slot jemput'}
        </Teks>
        {kosong ? <Teks kecil style={{ color: warna.koral, fontWeight: '700' }}>Isi berat kiloan atau minimal satu item satuan.</Teks> : null}
      </Kartu>
    </Layar>
  );
}

function Bagian({ judul, children }: { judul: string; children: React.ReactNode }) {
  return (
    <Kartu style={{ gap: 12 }}>
      <Judul level={2} ukuran={18}>{judul}</Judul>
      {children}
    </Kartu>
  );
}

function Stepper({ nilai, onUbah, min, max, satuan, label }: { nilai: number; onUbah: (n: number) => void; min: number; max: number; satuan?: string; label: string }) {
  return (
    <View style={st.stepper}>
      <Pressable role="button" aria-label={`Kurangi ${label}`} disabled={nilai <= min} onPress={() => onUbah(Math.max(min, nilai - 1))} style={[st.stepTombol, nilai <= min && { opacity: 0.4 }]}>
        <Ikon nama="kurang" ukuran={18} warna={warna.unguTua} tebal={2.2} />
      </Pressable>
      <Text style={st.stepNilai} aria-live="polite" aria-label={`${label}: ${nilai}${satuan ? ` ${satuan}` : ''}`}>
        {nilai}
        {satuan ? <Text style={{ fontSize: 12, color: warna.redup }}> {satuan}</Text> : null}
      </Text>
      <Pressable role="button" aria-label={`Tambah ${label}`} disabled={nilai >= max} onPress={() => onUbah(Math.min(max, nilai + 1))} style={[st.stepTombol, st.stepTambah, nilai >= max && { opacity: 0.4 }]}>
        <Ikon nama="tambah" ukuran={18} warna={warna.putih} tebal={2.2} />
      </Pressable>
    </View>
  );
}

function Masukan({ label, nilai, onUbah, contoh, banyak }: { label: string; nilai: string; onUbah: (s: string) => void; contoh?: string; banyak?: boolean }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={st.subLabel}>{label}</Text>
      <TextInput
        value={nilai}
        onChangeText={onUbah}
        placeholder={contoh}
        placeholderTextColor="#766E8F"
        aria-label={label}
        multiline={banyak}
        style={[st.masukan, banyak && { minHeight: 76, textAlignVertical: 'top', paddingTop: 12 }]}
      />
    </View>
  );
}

const st = StyleSheet.create({
  opsi: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: sudut.sedang,
    borderWidth: 1.5,
    borderColor: warna.garis,
    minHeight: 56,
  },
  opsiAktif: { borderColor: warna.ungu, backgroundColor: '#F7F4FF' },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#9C92BC', alignItems: 'center', justifyContent: 'center' },
  radioAktif: { borderColor: warna.ungu },
  radioIsi: { width: 10, height: 10, borderRadius: 5, backgroundColor: warna.ungu },
  opsiJudul: { fontSize: 15, fontWeight: '700', color: warna.tinta },
  opsiKet: { fontSize: 13, lineHeight: 18, color: warna.redup },
  opsiHarga: { fontFamily: hurufAngka, fontSize: 13, color: warna.unguTua, fontWeight: '700' },
  stepperBaris: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stepTombol: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: warna.unguMuda },
  stepTambah: { backgroundColor: warna.ungu },
  stepNilai: { minWidth: 44, textAlign: 'center', fontFamily: hurufJudul, fontSize: 20, color: warna.tinta },
  barisChip: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gridSlot: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slot: {
    width: '31.5%',
    flexGrow: 1,
    minHeight: 58,
    borderRadius: sudut.sedang,
    borderWidth: 1.5,
    borderColor: warna.lavender,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: warna.kartu,
  },
  slotAktif: { backgroundColor: warna.ungu, borderColor: warna.ungu },
  slotMati: { backgroundColor: '#F1EEF7', borderColor: '#E4DFEF', borderStyle: 'dashed' },
  slotJam: { fontFamily: hurufAngka, fontSize: 14, fontWeight: '700', color: warna.tinta },
  slotKet: { fontSize: 12, color: warna.redup },
  alamat: { fontSize: 14, lineHeight: 20, color: warna.tinta, backgroundColor: warna.latar, padding: 12, borderRadius: sudut.kecil },
  subLabel: { fontSize: 13, fontWeight: '700', color: warna.redup },
  masukan: {
    minHeight: 48,
    borderWidth: 1.5,
    borderColor: warna.lavender,
    borderRadius: sudut.sedang,
    paddingHorizontal: 14,
    fontSize: 15,
    color: warna.tinta,
    backgroundColor: warna.kartu,
  },
  saklar: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bawah: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: warna.kartu,
    borderTopWidth: 1,
    borderColor: warna.garis,
  },
  bawahLabel: { fontSize: 12, color: warna.redup, fontWeight: '700' },
  bawahTotal: { fontFamily: hurufJudul, fontSize: 22, lineHeight: 26, color: warna.tinta },
  bawahKet: { fontSize: 12, color: warna.redup },
});
