import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, TextInput, View, type ScrollViewInstance } from 'react-native';
import Ikon from '@/components/Ikon';
import type { NamaIkon } from '@/components/ikon-data';
import { KepalaMerek, Layar } from '@/components/kerangka';
import LembarBawah from '@/components/LembarBawah';
import { Chip, Judul, Kartu, Kerangka, Teks, Tombol } from '@/components/ui';
import {
  BERAT_MINIMUM, EKSTRA, LAYANAN, NODA, PEWANGI, SATUAN, SLOT_JEMPUT, URUTAN_LAYANAN, rupiah, type KodeLayanan,
} from '@/lib/katalog';
import { ALAMAT, jamSlot, namaPewangi, susunJadwal } from '@/lib/pesanan';
import { meta } from '@/lib/seo';
import { useBusa } from '@/lib/store';
import { hurufAngka, hurufJudul, sudut, warna } from '@/lib/tema';
import { HARI_MS, JAM, MENIT, bagianWIB, hariKalimat, hariRelatif, hariSingkat, jam, padaJam, tglBulan } from '@/lib/waktu';

export function generateMetadata() {
  return meta(
    '/pesan',
    'Pesan Jemput-Antar Laundry · Busa Ungu',
    'Tiga langkah: pilih cucian dan item satuan, slot jam jemput dan alamat, lalu catatan noda dan pewangi. Kurir menjemput dan mengantar balik.',
  );
}

const IKON_SATUAN: Record<string, NamaIkon> = {
  'bedcover-b': 'bedcover',
  'bedcover-k': 'bedcoverKecil',
  selimut: 'selimut',
  sprei: 'sprei',
  jas: 'jas',
  kebaya: 'kebaya',
  gamis: 'gamis',
  sepatu: 'sepatu',
  tas: 'tas',
  boneka: 'boneka',
};

/** Perkiraan berat per potong untuk panduan "Berapa kg cucianku?". */
const PANDUAN = [
  { nama: 'Kaos', kg: 0.2 },
  { nama: 'Kemeja', kg: 0.25 },
  { nama: 'Celana jeans', kg: 0.6 },
  { nama: 'Celana kain / rok', kg: 0.4 },
  { nama: 'Daster / piyama', kg: 0.3 },
  { nama: 'Handuk mandi', kg: 0.5 },
  { nama: 'Seprai', kg: 0.8 },
  { nama: 'Pakaian dalam / kaus kaki', kg: 0.05 },
];

const LANGKAH = ['Cucian', 'Jadwal', 'Catatan'];
const koma = (n: number) => n.toFixed(1).replace('.', ',');

export default function Pesan() {
  const { siap, kini, cari, buatPesanan } = useBusa();
  const { ulang } = useLocalSearchParams<{ ulang?: string }>();
  const gulir = useRef<ScrollViewInstance | null>(null);

  const [langkah, setLangkah] = useState(1);
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
  const [panduan, setPanduan] = useState(false);
  const [hitung, setHitung] = useState<Record<string, number>>({});

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
        const lewat = mulai <= kini;
        const ditutup = !lewat && mulai - kini < JAM;
        const penuh = h === 1 && k === 2;
        const alasan = lewat ? 'lewat' : ditutup ? 'ditutup' : penuh ? 'penuh' : '';
        return { mulai, bisa: !alasan, alasan };
      });
      return { h, dasar, slots, tersedia: slots.filter((x) => x.bisa).length };
    });
  }, [siap, kini]);

  useEffect(() => {
    if (!pilihanHari.length) return;
    const hariIni = pilihanHari[hari];
    if (slot && hariIni.slots.some((x) => x.mulai === slot && x.bisa)) return;
    const pertama = hariIni.slots.find((x) => x.bisa);
    if (pertama) setSlot(pertama.mulai);
    else if (hari === 0) setHari(1);
    else setSlot(null);
  }, [pilihanHari, hari]);

  useEffect(() => {
    gulir.current?.scrollTo({ y: 0, animated: false });
  }, [langkah]);

  const daftarSatuan = Object.entries(satuan).filter(([, q]) => q > 0).map(([kode, qty]) => ({ kode, qty }));
  const lay = LAYANAN[layanan];
  const kiloan = berat > 0 ? Math.max(berat, BERAT_MINIMUM) * lay.hargaKg : 0;
  const hargaSatuan = daftarSatuan.reduce((t, x) => t + (SATUAN.find((s) => s.kode === x.kode)?.harga ?? 0) * x.qty, 0);
  const perkiraan = kiloan + hargaSatuan + noda.length * EKSTRA.noda.harga;
  const kosong = berat === 0 && daftarSatuan.length === 0;
  const jadwal = slot ? susunJadwal(slot + 50 * MENIT, layanan, antar) : null;
  const selesai = jadwal ? (antar ? jadwal.tuntas : jadwal.siap) : null;
  const jumlahSatuan = daftarSatuan.reduce((t, x) => t + x.qty, 0);
  const perkiraanPanduan = PANDUAN.reduce((t, x) => t + (hitung[x.nama] ?? 0) * x.kg, 0);

  const ringkasCucian = [
    lay.singkat,
    berat > 0 ? `± ${berat} kg` : null,
    jumlahSatuan ? `${jumlahSatuan} item satuan` : null,
  ].filter(Boolean).join(' · ');
  const ringkasJadwal = siap && slot ? `${hariRelatif(slot, kini)} ${jamSlot(slot)} · ${ALAMAT[alamatKe].label} · ${antar ? 'diantar balik' : 'ambil sendiri'}` : 'Pilih slot jemput';

  const bisaLanjut = langkah === 1 ? !kosong : langkah === 2 ? !!slot : siap && !!slot && !kosong;

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
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={st.bawahLabel}>Perkiraan biaya</Text>
        <Text style={st.bawahTotal}>{rupiah(perkiraan)}</Text>
        <Text style={st.bawahKet} numberOfLines={1}>
          {siap && selesai ? `Selesai ${hariRelatif(selesai, kini).includes(',') ? `${hariSingkat(selesai)} ${tglBulan(selesai)}` : hariKalimat(selesai, kini)}, ${jam(selesai)} WIB` : 'Final setelah ditimbang'}
        </Text>
      </View>
      {langkah > 1 ? (
        <Pressable role="button" aria-label="Kembali ke langkah sebelumnya" onPress={() => setLangkah(langkah - 1)} style={st.kembali}>
          <Ikon nama="kembali" ukuran={20} warna={warna.unguTua} />
        </Pressable>
      ) : null}
      {langkah < 3 ? (
        <Tombol label="Lanjut" ikon="panah" onPress={() => setLangkah(langkah + 1)} nonaktif={!bisaLanjut} labelAria={`Lanjut ke langkah ${langkah + 1}: ${LANGKAH[langkah]}`} />
      ) : (
        <Tombol label="Pesan jemput" ikon="motor" onPress={kirim} nonaktif={!bisaLanjut} />
      )}
    </View>
  );

  return (
    <Layar kepala={<KepalaMerek judulHalaman="Jemput-antar" />} bawah={bilahBawah} jarak={14} refGulir={gulir}>
      <View style={{ gap: 4 }}>
        <Judul level={1} ukuran={28}>Jadwalkan jemput</Judul>
        <Teks redup>Gratis jemput-antar sampai 3 km. Ditimbang di depanmu saat dijemput.</Teks>
      </View>

      {/* Penunjuk langkah */}
      <View style={st.langkah} aria-label={`Langkah ${langkah} dari 3: ${LANGKAH[langkah - 1]}`} role="group">
        {LANGKAH.map((n, k) => {
          const no = k + 1;
          const lewat = no < langkah;
          const kiniIni = no === langkah;
          return (
            <Pressable
              key={n}
              role="button"
              aria-current={kiniIni ? 'step' : undefined}
              aria-label={`Langkah ${no}: ${n}${lewat ? ', selesai' : ''}`}
              disabled={!lewat}
              onPress={() => setLangkah(no)}
              style={[st.langkahSel, kiniIni && st.langkahKini, lewat && st.langkahLewat]}
            >
              <View style={[st.langkahNo, kiniIni && { backgroundColor: warna.putih }, lewat && { backgroundColor: warna.ungu }]}>
                {lewat ? <Ikon nama="cek" ukuran={14} warna={warna.putih} tebal={2.6} /> : <Text style={[st.langkahNoTeks, kiniIni && { color: warna.ungu }]}>{no}</Text>}
              </View>
              <Text style={[st.langkahTeks, kiniIni && { color: warna.putih }]}>{n}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Ringkasan langkah yang sudah selesai */}
      {langkah > 1 ? <Ringkas label="Cucian" isi={ringkasCucian} onUbah={() => setLangkah(1)} /> : null}
      {langkah > 2 ? <Ringkas label="Jadwal" isi={ringkasJadwal} onUbah={() => setLangkah(2)} /> : null}

      {langkah === 1 ? (
        <>
          <Bagian judul="Layanan">
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

          <Bagian judul="Perkiraan berat">
            <View style={st.stepperBaris}>
              <View style={{ flex: 1 }}>
                <Text style={st.opsiJudul}>Cucian kiloan</Text>
                <Text style={st.opsiKet}>{berat === 0 ? 'Tidak ada, hanya item satuan' : `Minimum ditagih ${BERAT_MINIMUM} kg`}</Text>
              </View>
              <Stepper nilai={berat} satuan="kg" min={0} max={20} onUbah={setBerat} label="Perkiraan berat kiloan" />
            </View>
            <Pressable role="button" onPress={() => setPanduan(true)} style={st.tautanPanduan}>
              <Ikon nama="timbang" ukuran={18} warna={warna.unguTua} />
              <Text style={st.tautanTeks}>Berapa kg cucianku?</Text>
            </Pressable>
          </Bagian>

          <Bagian judul="Item satuan">
            <Teks kecil redup>Ketuk untuk menambah. Barang besar dicuci terpisah, selesai 2 hari.</Teks>
            <View style={st.grid}>
              {SATUAN.map((it) => {
                const q = satuan[it.kode] ?? 0;
                return (
                  <View key={it.kode} style={[st.selItem, q > 0 && st.selItemAktif]}>
                    <Pressable
                      role="button"
                      aria-label={`Tambah ${it.nama}, ${rupiah(it.harga)}${q ? `, sekarang ${q}` : ''}`}
                      onPress={() => setSatuan((x) => ({ ...x, [it.kode]: Math.min(10, (x[it.kode] ?? 0) + 1) }))}
                      style={st.selItemTekan}
                    >
                      <Ikon nama={IKON_SATUAN[it.kode] ?? 'kaos'} ukuran={30} warna={q > 0 ? warna.ungu : warna.unguTua} tebal={1.6} />
                      <Text style={st.selItemNama} numberOfLines={2}>
                        {it.nama}
                      </Text>
                      <Text style={st.selItemHarga}>{rupiah(it.harga)}</Text>
                    </Pressable>
                    {q > 0 ? (
                      <>
                        <View style={st.lencanaQty} aria-hidden>
                          <Text style={st.lencanaQtyTeks}>{q}</Text>
                        </View>
                        <Pressable role="button" aria-label={`Kurangi ${it.nama}`} onPress={() => setSatuan((x) => ({ ...x, [it.kode]: Math.max(0, (x[it.kode] ?? 0) - 1) }))} style={st.kurangItem}>
                          <Ikon nama="kurang" ukuran={16} warna={warna.unguTua} tebal={2.4} />
                        </Pressable>
                      </>
                    ) : null}
                  </View>
                );
              })}
            </View>
            {kosong ? <Teks kecil style={{ color: warna.koral, fontWeight: '700' }}>Isi berat kiloan atau minimal satu item satuan.</Teks> : null}
          </Bagian>
        </>
      ) : null}

      {langkah === 2 ? (
        <>
          <Bagian judul="Hari & slot jemput (WIB)">
            {!siap ? (
              <Kerangka tinggi={150} />
            ) : (
              <>
                <View role="radiogroup" aria-label="Pilih hari jemput" style={st.stripHari}>
                  {pilihanHari.map((d) => {
                    const aktif = hari === d.h;
                    return (
                      <Pressable
                        key={d.h}
                        role="radio"
                        aria-checked={aktif}
                        aria-label={`${hariRelatif(d.dasar, kini)}, ${d.tersedia} slot tersedia`}
                        onPress={() => setHari(d.h)}
                        style={[st.hari, aktif && st.hariAktif]}
                      >
                        <Text style={[st.hariNama, aktif && { color: '#E9E2FF' }]}>{d.h === 0 ? 'Hari ini' : hariSingkat(d.dasar)}</Text>
                        <Text style={[st.hariTgl, aktif && { color: warna.putih }]}>{bagianWIB(d.dasar).tanggal}</Text>
                        <Text style={[st.hariSlot, aktif && { color: '#E9E2FF' }]}>{d.tersedia ? `${d.tersedia} slot` : 'Habis'}</Text>
                      </Pressable>
                    );
                  })}
                </View>
                <View role="radiogroup" aria-label="Pilih slot jam jemput" style={st.gridSlot}>
                  {pilihanHari[hari]?.slots.map((x) => {
                    const aktif = x.mulai === slot;
                    const ket = x.alasan === 'penuh' ? 'Penuh' : x.alasan === 'lewat' ? 'Lewat' : x.alasan === 'ditutup' ? 'Ditutup' : aktif ? 'Dipilih' : 'Tersedia';
                    return (
                      <Pressable
                        key={x.mulai}
                        role="radio"
                        aria-checked={aktif}
                        aria-disabled={!x.bisa || undefined}
                        disabled={!x.bisa}
                        aria-label={`${jamSlot(x.mulai)} WIB, ${ket.toLowerCase()}${x.alasan === 'ditutup' ? ', pesan paling lambat 1 jam sebelum slot' : ''}`}
                        onPress={() => setSlot(x.mulai)}
                        style={[st.slot, aktif && st.slotAktif, !x.bisa && st.slotMati]}
                      >
                        <Text style={[st.slotJam, aktif && { color: warna.putih }, !x.bisa && { color: warna.redup }]}>{jamSlot(x.mulai)}</Text>
                        <Text style={[st.slotKet, aktif && { color: '#E9E2FF' }]}>{ket}</Text>
                      </Pressable>
                    );
                  })}
                </View>
                <Teks kecil redup>Pesan paling lambat 1 jam sebelum slot dimulai. Outlet buka 07.00–21.00 WIB.</Teks>
              </>
            )}
          </Bagian>

          <Bagian judul="Alamat & pengantaran">
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
        </>
      ) : null}

      {langkah === 3 ? (
        <>
          <Bagian judul="Noda">
            <Text style={st.subLabel}>Tandai supaya dirawat dulu (+{rupiah(EKSTRA.noda.harga)} per titik)</Text>
            <View role="group" aria-label="Jenis noda" style={st.barisChip}>
              {NODA.map((n) => (
                <Chip key={n} peran="checkbox" label={n} aktif={noda.includes(n)} onPress={() => setNoda((x) => (x.includes(n) ? x.filter((y) => y !== n) : [...x, n]))} />
              ))}
            </View>
            {noda.length ? <Masukan label="Letak noda" nilai={catatanNoda} onUbah={setCatatanNoda} contoh="Kemeja putih, kerah belakang" /> : null}
          </Bagian>

          <Bagian judul="Pewangi">
            <View role="radiogroup" aria-label="Pewangi" style={st.barisChip}>
              {PEWANGI.map((p) => (
                <Chip key={p.kode} label={p.nama} ikon="tetes" aktif={pewangi === p.kode} onPress={() => setPewangi(p.kode)} />
              ))}
            </View>
            <Teks kecil redup>{PEWANGI.find((p) => p.kode === pewangi)?.ket}</Teks>
          </Bagian>

          <Bagian judul="Penyelesaian">
            <View style={st.saklar}>
              <View style={{ flex: 1 }}>
                <Text style={st.opsiJudul} nativeID="label-pisah">Pisahkan putih & warna</Text>
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

          <Kartu warnaLatar={warna.unguMuda} style={{ gap: 6, borderColor: warna.lavender }}>
            <Judul level={2} ukuran={18}>Periksa lagi</Judul>
            <BarisRingkas label="Cucian" isi={ringkasCucian} />
            <BarisRingkas label="Jemput" isi={ringkasJadwal} />
            <BarisRingkas label="Catatan" isi={`${noda.length ? `${noda.length} titik noda · ` : ''}${namaPewangi(pewangi)} · ${pisahWarna ? 'pisah warna' : 'campur'} · ${lipat === 'gantung' ? 'digantung' : 'dilipat'}`} />
            <Teks kecil redup>Bayar setelah ditimbang, lewat aplikasi atau tunai ke kurir.</Teks>
          </Kartu>
        </>
      ) : null}

      <LembarBawah
        terbuka={panduan}
        onTutup={() => setPanduan(false)}
        judul="Berapa kg cucianku?"
        bawah={
          <Tombol
            label={perkiraanPanduan > 0 ? `Pakai ± ${Math.max(1, Math.round(perkiraanPanduan))} kg` : 'Hitung jumlah potong dulu'}
            nonaktif={perkiraanPanduan <= 0}
            onPress={() => {
              setBerat(Math.min(20, Math.max(1, Math.round(perkiraanPanduan))));
              setPanduan(false);
            }}
          />
        }
      >
        <Teks kecil>Hitung jumlah potong, kami kira-kira beratnya. Ini hanya perkiraan; berat final ditimbang di depanmu saat kurir datang.</Teks>
        {PANDUAN.map((x) => (
          <View key={x.nama} style={st.stepperBaris}>
            <View style={{ flex: 1 }}>
              <Text style={st.opsiJudul}>{x.nama}</Text>
              <Text style={st.opsiKet}>± {koma(x.kg)} kg per potong</Text>
            </View>
            <Stepper nilai={hitung[x.nama] ?? 0} min={0} max={40} label={x.nama} onUbah={(n) => setHitung((h) => ({ ...h, [x.nama]: n }))} />
          </View>
        ))}
        <View style={st.hasilPanduan} aria-live="polite">
          <Text style={st.opsiKet}>Perkiraan</Text>
          <Text style={st.hasilAngka}>± {koma(perkiraanPanduan)} kg</Text>
        </View>
      </LembarBawah>
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

function Ringkas({ label, isi, onUbah }: { label: string; isi: string; onUbah: () => void }) {
  return (
    <View style={st.ringkas}>
      <Ikon nama="cek" ukuran={18} warna={warna.hijau} tebal={2.4} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={st.ringkasLabel}>{label}</Text>
        <Text style={st.ringkasIsi} numberOfLines={1}>
          {isi}
        </Text>
      </View>
      <Pressable role="button" aria-label={`Ubah ${label.toLowerCase()}`} onPress={onUbah} style={st.ubah}>
        <Text style={st.ubahTeks}>Ubah</Text>
      </Pressable>
    </View>
  );
}

function BarisRingkas({ label, isi }: { label: string; isi: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 10 }}>
      <Text style={[st.ringkasLabel, { width: 62 }]}>{label}</Text>
      <Text style={[st.opsiKet, { flex: 1, color: warna.tinta }]}>{isi}</Text>
    </View>
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
  langkah: { flexDirection: 'row', gap: 6 },
  langkahSel: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44, paddingHorizontal: 8, borderRadius: sudut.sedang, backgroundColor: warna.kartu, borderWidth: 1, borderColor: warna.garis },
  langkahKini: { backgroundColor: warna.ungu, borderColor: warna.ungu },
  langkahLewat: { borderColor: warna.lavender },
  langkahNo: { width: 24, height: 24, borderRadius: 12, backgroundColor: warna.unguMuda, alignItems: 'center', justifyContent: 'center' },
  langkahNoTeks: { fontSize: 13, fontWeight: '800', color: warna.unguTua },
  langkahTeks: { fontSize: 13, fontWeight: '700', color: warna.tinta, flexShrink: 1 },
  ringkas: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: warna.kartu, borderRadius: sudut.sedang, borderWidth: 1, borderColor: warna.garis, paddingLeft: 12, paddingVertical: 4, paddingRight: 4 },
  ringkasLabel: { fontSize: 12, fontWeight: '800', color: warna.redup },
  ringkasIsi: { fontSize: 14, fontWeight: '600', color: warna.tinta },
  ubah: { minHeight: 44, minWidth: 56, alignItems: 'center', justifyContent: 'center', borderRadius: 22 },
  ubahTeks: { fontSize: 14, fontWeight: '700', color: warna.unguTua, textDecorationLine: 'underline' },
  opsi: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: sudut.sedang, borderWidth: 1.5, borderColor: warna.garis, minHeight: 56 },
  opsiAktif: { borderColor: warna.ungu, backgroundColor: '#F7F4FF' },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#9C92BC', alignItems: 'center', justifyContent: 'center' },
  radioAktif: { borderColor: warna.ungu },
  radioIsi: { width: 10, height: 10, borderRadius: 5, backgroundColor: warna.ungu },
  opsiJudul: { fontSize: 15, fontWeight: '700', color: warna.tinta },
  opsiKet: { fontSize: 13, lineHeight: 18, color: warna.redup },
  opsiHarga: { fontFamily: hurufAngka, fontSize: 13, color: warna.unguTua, fontWeight: '700', fontVariant: ['tabular-nums'] },
  stepperBaris: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stepTombol: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: warna.unguMuda },
  stepTambah: { backgroundColor: warna.ungu },
  stepNilai: { minWidth: 40, textAlign: 'center', fontFamily: hurufJudul, fontSize: 20, color: warna.tinta, fontVariant: ['tabular-nums'] },
  tautanPanduan: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44, alignSelf: 'flex-start', paddingHorizontal: 12, borderRadius: 22, backgroundColor: warna.unguMuda },
  tautanTeks: { fontSize: 14, fontWeight: '700', color: warna.unguTua },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  selItem: { width: '31.6%', flexGrow: 1, borderRadius: sudut.sedang, borderWidth: 1.5, borderColor: warna.garis, backgroundColor: warna.kartu, minHeight: 116 },
  selItemAktif: { borderColor: warna.ungu, backgroundColor: '#F7F4FF' },
  selItemTekan: { flex: 1, alignItems: 'center', paddingTop: 12, paddingBottom: 10, paddingHorizontal: 6, gap: 4 },
  selItemNama: { fontSize: 13, lineHeight: 17, fontWeight: '700', color: warna.tinta, textAlign: 'center' },
  selItemHarga: { fontFamily: hurufAngka, fontSize: 12, color: warna.redup, fontVariant: ['tabular-nums'] },
  lencanaQty: { position: 'absolute', top: 6, left: 6, minWidth: 24, height: 24, borderRadius: 12, backgroundColor: warna.ungu, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  lencanaQtyTeks: { fontFamily: hurufJudul, fontSize: 14, color: warna.putih },
  kurangItem: { position: 'absolute', top: 0, right: 0, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  barisChip: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stripHari: { flexDirection: 'row', gap: 8 },
  hari: { flex: 1, minHeight: 72, borderRadius: sudut.sedang, borderWidth: 1.5, borderColor: warna.lavender, alignItems: 'center', justifyContent: 'center', backgroundColor: warna.kartu },
  hariAktif: { backgroundColor: warna.ungu, borderColor: warna.ungu },
  hariNama: { fontSize: 12, fontWeight: '700', color: warna.redup },
  hariTgl: { fontFamily: hurufJudul, fontSize: 24, lineHeight: 28, color: warna.tinta, fontVariant: ['tabular-nums'] },
  hariSlot: { fontSize: 12, color: warna.redup },
  gridSlot: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slot: { width: '31.5%', flexGrow: 1, minHeight: 58, borderRadius: sudut.sedang, borderWidth: 1.5, borderColor: warna.lavender, alignItems: 'center', justifyContent: 'center', backgroundColor: warna.kartu },
  slotAktif: { backgroundColor: warna.ungu, borderColor: warna.ungu },
  slotMati: { backgroundColor: '#F1EEF7', borderColor: '#E4DFEF', borderStyle: 'dashed' },
  slotJam: { fontFamily: hurufAngka, fontSize: 14, fontWeight: '700', color: warna.tinta, fontVariant: ['tabular-nums'] },
  slotKet: { fontSize: 12, color: warna.redup },
  alamat: { fontSize: 14, lineHeight: 20, color: warna.tinta, backgroundColor: warna.latar, padding: 12, borderRadius: sudut.kecil },
  subLabel: { fontSize: 13, fontWeight: '700', color: warna.redup },
  masukan: { minHeight: 48, borderWidth: 1.5, borderColor: warna.lavender, borderRadius: sudut.sedang, paddingHorizontal: 14, fontSize: 15, color: warna.tinta, backgroundColor: warna.kartu },
  saklar: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  hasilPanduan: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', backgroundColor: warna.kuningMuda, borderRadius: sudut.sedang, padding: 12 },
  hasilAngka: { fontFamily: hurufJudul, fontSize: 24, color: warna.tinta, fontVariant: ['tabular-nums'] },
  bawah: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: warna.kartu, borderTopWidth: 1, borderColor: warna.garis },
  kembali: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', backgroundColor: warna.unguMuda },
  bawahLabel: { fontSize: 12, color: warna.redup, fontWeight: '700' },
  bawahTotal: { fontFamily: hurufJudul, fontSize: 22, lineHeight: 26, color: warna.tinta, fontVariant: ['tabular-nums'] },
  bawahKet: { fontSize: 12, color: warna.redup },
});
