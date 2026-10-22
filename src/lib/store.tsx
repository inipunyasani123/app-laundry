import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { TAHAP, TINGKAT, TUKAR_POIN, VOUCHER } from './katalog';
import {
  aktif, hitungNota, indeksTahap, lunas, namaTahapKini, notifikasiDari, pesananContoh, susunJadwal,
  type Metode, type Notifikasi, type Pembayaran, type Pesanan,
} from './pesanan';
import { HARI_MS, JAM, MENIT, bulatkan } from './waktu';

const KUNCI = 'busaungu:v1';
const SALDO_AWAL = 640;
/** Data contoh dibuat ulang kalau jangkarnya lebih tua dari ini, supaya selalu ada cucian berjalan. */
const UMUR_CONTOH = 10 * JAM;

interface Simpanan {
  versi: 1;
  jangkar: number;
  baru: Pesanan[];
  bayar: Record<string, Pembayaran>;
  geser: Record<string, number>;
  diambil: Record<string, number>;
  dibaca: string[];
  ditukar: { kode: string; poin: number; waktu: number }[];
  voucherDipakai: string[];
  notifAktif: boolean;
}

const kosong = (kini: number): Simpanan => ({
  versi: 1, jangkar: kini, baru: [], bayar: {}, geser: {}, diambil: {}, dibaca: [], ditukar: [], voucherDipakai: [], notifAktif: true,
});

export interface InputPesanan {
  layanan: Pesanan['layanan'];
  antar: boolean;
  jemput: number;
  alamat: string;
  beratPerkiraan: number;
  satuan: Pesanan['satuan'];
  noda: string[];
  catatanNoda?: string;
  pewangi: string;
  pisahWarna: boolean;
  lipat: Pesanan['lipat'];
  catatan?: string;
}

export interface Toast {
  id: string;
  judul: string;
  isi: string;
  no?: string;
}

export interface VoucherTersedia {
  kode: string;
  judul: string;
  ket: string;
  sampai: number;
}

interface Nilai {
  siap: boolean;
  kini: number;
  pesanan: Pesanan[];
  berjalan: Pesanan[];
  selesai: Pesanan[];
  cari: (no?: string | null) => Pesanan | undefined;
  notifikasi: Notifikasi[];
  belumDibaca: number;
  dibaca: Set<string>;
  poin: { saldo: number; tingkat: string; berikut?: string; kurang: number; persen: number; cap: number; capBerjalan: number };
  voucher: VoucherTersedia[];
  notifAktif: boolean;
  toast: Toast | null;
  tutupToast: () => void;
  buatPesanan: (i: InputPesanan) => string;
  bayar: (no: string, metode: Metode, voucher?: string, diskon?: number) => void;
  majukan: (no: string) => void;
  tandaiDiambil: (no: string) => void;
  tandaiDibaca: (id: string) => void;
  tandaiSemua: () => void;
  tukarPoin: (kode: string) => boolean;
  setNotifAktif: (v: boolean) => void;
  aturUlang: () => void;
}

const Konteks = createContext<Nilai | null>(null);

export function useBusa() {
  const v = useContext(Konteks);
  if (!v) throw new Error('useBusa harus di dalam <PenyediaBusa>');
  return v;
}

function terapkan(s: Simpanan): Pesanan[] {
  const semua = [...pesananContoh(s.jangkar), ...s.baru];
  return semua.map((p) => {
    const g = s.geser[p.no] ?? 0;
    const jadwal = { ...p.jadwal };
    if (g) for (const k of Object.keys(jadwal) as (keyof typeof jadwal)[]) jadwal[k] -= g;
    const ambil = s.diambil[p.no];
    if (ambil && ambil < jadwal.tuntas) jadwal.tuntas = Math.max(ambil, jadwal.siap);
    const jemput = p.jemput && g ? p.jemput - g : p.jemput;
    return { ...p, jadwal, jemput, bayar: s.bayar[p.no] ?? p.bayar };
  });
}

export function PenyediaBusa({ children }: { children: ReactNode }) {
  const [s, setS] = useState<Simpanan | null>(null);
  const [kini, setKini] = useState(0);
  const [toast, setToast] = useState<Toast | null>(null);
  const terakhir = useRef(0);

  // Muat sekali setelah mount (HTML statis selalu dirender tanpa data pengguna).
  useEffect(() => {
    let batal = false;
    (async () => {
      const t = Date.now();
      let isi: Simpanan = kosong(t);
      try {
        const mentah = await AsyncStorage.getItem(KUNCI);
        if (mentah) {
          const lama = JSON.parse(mentah) as Simpanan;
          if (lama?.versi === 1) {
            isi = lama;
            if (t - lama.jangkar > UMUR_CONTOH) {
              const contoh = new Set(pesananContoh(lama.jangkar).map((p) => p.no));
              const saring = <T,>(r: Record<string, T>) => Object.fromEntries(Object.entries(r).filter(([k]) => !contoh.has(k)));
              isi = { ...lama, jangkar: t, bayar: saring(lama.bayar), geser: saring(lama.geser), diambil: saring(lama.diambil), dibaca: lama.dibaca.filter((d) => !contoh.has(d.split(':')[0])) };
            }
          }
        }
      } catch {
        /* penyimpanan tidak tersedia: pakai data contoh di memori */
      }
      if (!batal) {
        terakhir.current = t;
        setKini(t);
        setS(isi);
      }
    })();
    return () => {
      batal = true;
    };
  }, []);

  useEffect(() => {
    if (!s) return;
    AsyncStorage.setItem(KUNCI, JSON.stringify(s)).catch(() => {});
  }, [s]);

  useEffect(() => {
    if (!s) return;
    const id = setInterval(() => setKini(Date.now()), 15_000);
    return () => clearInterval(id);
  }, [s ? 1 : 0]);

  const pesanan = useMemo(() => (s ? terapkan(s) : []), [s]);

  const notifikasi = useMemo(() => (s && kini ? notifikasiDari(pesanan, kini, s.jangkar) : []), [pesanan, kini, s]);

  // Notifikasi simulasi: tampilkan peristiwa yang baru saja lewat.
  useEffect(() => {
    if (!s || !kini) return;
    const dari = terakhir.current;
    terakhir.current = kini;
    if (!s.notifAktif || !dari || dari >= kini) return;
    const baru = notifikasi.find((n) => n.waktu > dari && n.waktu <= kini && n.jenis !== 'promo');
    if (baru) setToast({ id: baru.id, judul: baru.judul, isi: baru.isi, no: baru.no });
  }, [kini, notifikasi, s]);

  const ubah = useCallback((f: (x: Simpanan) => Simpanan) => setS((x) => (x ? f(x) : x)), []);

  const nilai = useMemo<Nilai>(() => {
    // Kabar yang lebih tua dari 6 jam sebelum data contoh dibuat dianggap sudah dibaca.
    const batasBaca = (s?.jangkar ?? kini) - 6 * JAM;
    const dibaca = new Set([...(s?.dibaca ?? []), ...notifikasi.filter((n) => n.waktu <= batasBaca).map((n) => n.id)]);
    const urut = [...pesanan];
    const berjalan = urut.filter((p) => aktif(p, kini)).sort((a, b) => a.jadwal.siap - b.jadwal.siap);
    const selesai = urut.filter((p) => !aktif(p, kini)).sort((a, b) => b.jadwal.diterima - a.jadwal.diterima);

    const didapat = pesanan.filter((p) => lunas(p, kini)).reduce((t, p) => t + hitungNota(p, kini).poin, 0);
    const keluar = (s?.ditukar ?? []).reduce((t, d) => t + d.poin, 0);
    const saldo = SALDO_AWAL + didapat - keluar;
    const total = SALDO_AWAL + didapat;
    let ti = 0;
    TINGKAT.forEach((t, i) => {
      if (total >= t.min) ti = i;
    });
    const berikut = TINGKAT[ti + 1];
    const kurang = berikut ? berikut.min - total : 0;
    const persen = berikut ? (total - TINGKAT[ti].min) / (berikut.min - TINGKAT[ti].min) : 1;
    const batas90 = kini - 90 * HARI_MS;
    const cap = selesai.filter((p) => p.berat > 0 && p.jadwal.diterima > batas90).length;
    const capBerjalan = berjalan.filter((p) => p.berat > 0 || p.beratPerkiraan > 0).length;

    const jangkar = s?.jangkar ?? kini;
    const dipakai = new Set(s?.voucherDipakai ?? []);
    const voucher: VoucherTersedia[] = [
      ...VOUCHER.map((v) => ({ kode: v.kode, judul: v.judul, ket: v.ket, sampai: bulatkan(jangkar + v.hariBerlaku * HARI_MS, JAM) })),
      ...(s?.ditukar ?? []).map((d) => {
        const t = TUKAR_POIN.find((x) => x.kode === d.kode.split('-')[0]);
        return { kode: d.kode, judul: t?.judul ?? 'Voucher poin', ket: `Hasil tukar ${d.poin} poin, potong langsung di nota`, sampai: d.waktu + 30 * HARI_MS };
      }),
    ].filter((v) => !dipakai.has(v.kode));

    return {
      siap: !!s && kini > 0,
      kini,
      pesanan,
      berjalan,
      selesai,
      cari: (no) => (no ? pesanan.find((p) => p.no === no) : undefined),
      notifikasi,
      belumDibaca: notifikasi.filter((n) => !dibaca.has(n.id)).length,
      dibaca,
      poin: { saldo, tingkat: TINGKAT[ti].nama, berikut: berikut?.nama, kurang, persen, cap, capBerjalan },
      voucher,
      notifAktif: s?.notifAktif ?? true,
      toast,
      tutupToast: () => setToast(null),
      buatPesanan: (i) => {
        const t = Date.now();
        const nomor = `BU-${24125 + (s?.baru.length ?? 0)}`;
        const geserBerat = ((nomor.charCodeAt(nomor.length - 1) % 5) - 2) / 10;
        const diterima = bulatkan(i.jemput + 50 * MENIT);
        const p: Pesanan = {
          no: nomor,
          layanan: i.layanan,
          antar: i.antar,
          jemput: i.jemput,
          alamat: i.alamat,
          beratPerkiraan: i.beratPerkiraan,
          berat: i.beratPerkiraan > 0 ? Math.max(0.5, i.beratPerkiraan + geserBerat) : 0,
          satuan: i.satuan,
          noda: i.noda,
          catatanNoda: i.catatanNoda,
          pewangi: i.pewangi,
          pisahWarna: i.pisahWarna,
          lipat: i.lipat,
          catatan: i.catatan,
          jadwal: susunJadwal(diterima, i.layanan, i.antar),
          dibuat: t,
        };
        ubah((x) => ({ ...x, baru: [...x.baru, p] }));
        setKini(t);
        if (s?.notifAktif !== false) setToast({ id: `${nomor}:jadwal`, judul: 'Jemput terjadwal', isi: `${nomor} tercatat. Kurir datang sesuai slot yang kamu pilih.`, no: nomor });
        return nomor;
      },
      bayar: (no, metode, voucher, diskon = 0) => {
        const t = Date.now();
        ubah((x) => ({
          ...x,
          bayar: { ...x.bayar, [no]: { metode, waktu: t, voucher, diskon } },
          voucherDipakai: voucher ? [...x.voucherDipakai, voucher] : x.voucherDipakai,
        }));
        setKini(t);
      },
      majukan: (no) => {
        const p = pesanan.find((x) => x.no === no);
        if (!p) return;
        const t = Date.now();
        const i = indeksTahap(p, t);
        if (i >= 6) return;
        const sasaran = i === -1 ? p.jadwal.diterima : i < 5 ? p.jadwal[TAHAP[i + 1].kode] : p.jadwal.tuntas;
        const tambah = Math.max(0, sasaran - t) + 1000;
        ubah((x) => ({ ...x, geser: { ...x.geser, [no]: (x.geser[no] ?? 0) + tambah } }));
        // Toast langsung, tanpa menunggu detak berikutnya.
        const maju = { ...p, jadwal: Object.fromEntries(Object.entries(p.jadwal).map(([k, v]) => [k, v - tambah])) as Pesanan['jadwal'] };
        terakhir.current = t;
        setKini(t);
        if (s?.notifAktif !== false) setToast({ id: `${no}:${i + 1}`, judul: namaTahapKini(maju, t), isi: `${no} pindah ke tahap berikutnya (simulasi).`, no });
      },
      tandaiDiambil: (no) => {
        const t = Date.now();
        ubah((x) => ({ ...x, diambil: { ...x.diambil, [no]: t } }));
        setKini(t);
      },
      tandaiDibaca: (id) => ubah((x) => (x.dibaca.includes(id) ? x : { ...x, dibaca: [...x.dibaca, id] })),
      tandaiSemua: () => ubah((x) => ({ ...x, dibaca: Array.from(new Set([...x.dibaca, ...notifikasi.map((n) => n.id)])) })),
      tukarPoin: (kode) => {
        const t = TUKAR_POIN.find((x) => x.kode === kode);
        if (!t || saldo < t.poin) return false;
        const w = Date.now();
        ubah((x) => ({ ...x, ditukar: [...x.ditukar, { kode: `${t.kode}-${w.toString(36).slice(-4).toUpperCase()}`, poin: t.poin, waktu: w }] }));
        return true;
      },
      setNotifAktif: (v) => ubah((x) => ({ ...x, notifAktif: v })),
      aturUlang: () => {
        const t = Date.now();
        terakhir.current = t;
        setToast(null);
        setKini(t);
        setS(kosong(t));
      },
    };
  }, [s, pesanan, kini, notifikasi, toast, ubah]);

  return <Konteks.Provider value={nilai}>{children}</Konteks.Provider>;
}
