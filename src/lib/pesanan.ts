import {
  BERAT_MINIMUM, EKSTRA, KURIR, LAYANAN, PEWANGI, PORSI_TAHAP, SATUAN, TAHAP, VOUCHER, rupiah,
  type KodeLayanan, type KodeTahap,
} from './katalog';
import { HARI_MS, JAM, MENIT, bagianWIB, bulatkan, kerja, menitKerjaAntara, outletBuka, padaJam } from './waktu';

export type Metode = 'qris' | 'dompet' | 'va' | 'tunai';

export const METODE: Record<Metode, { nama: string; ket: string }> = {
  qris: { nama: 'QRIS', ket: 'Pindai dari aplikasi bank atau dompet digital' },
  dompet: { nama: 'Dompet digital', ket: 'Saldo dompet digital yang tertaut' },
  va: { nama: 'Transfer virtual account', ket: 'Nomor VA berlaku 1 jam' },
  tunai: { nama: 'Tunai ke kurir', ket: 'Bayar saat cucian diantar' },
};

export interface Pembayaran {
  metode: Metode;
  waktu: number;
  voucher?: string;
  diskon: number;
}

export interface Pesanan {
  no: string;
  layanan: KodeLayanan;
  antar: boolean;
  jemput?: number;
  alamat: string;
  beratPerkiraan: number;
  berat: number;
  satuan: { kode: string; qty: number }[];
  noda: string[];
  catatanNoda?: string;
  pewangi: string;
  pisahWarna: boolean;
  lipat: 'lipat' | 'gantung';
  catatan?: string;
  jadwal: Record<KodeTahap, number> & { tuntas: number };
  bayar?: Pembayaran;
  dibuat: number;
  contoh?: boolean;
}

export const ALAMAT = [
  { label: 'Rumah', isi: 'Jl. Flamboyan Ungu No. 8, RT 02/RW 04 (alamat rekaan)' },
  { label: 'Kantor', isi: 'Gedung Serbaguna Lt. 2, Jl. Pahlawan Rekaan No. 21' },
];

/** Jadwal tahap dari waktu diterima & lama layanan (dihitung dalam jam kerja outlet). */
export function susunJadwal(diterima: number, layanan: KodeLayanan, antar: boolean) {
  const menitKerja = LAYANAN[layanan].jam * 60;
  const j = {} as Record<KodeTahap, number> & { tuntas: number };
  for (const t of TAHAP) j[t.kode] = bulatkan(kerja(diterima, PORSI_TAHAP[t.kode] * menitKerja));
  j.diterima = diterima;
  j.ditimbang = bulatkan(kerja(diterima, Math.max(15, PORSI_TAHAP.ditimbang * menitKerja)));
  j.tuntas = antar ? bulatkan(kerja(j.siap, 75)) : j.siap + 20 * JAM;
  return j;
}

/** Contoh pesanan yang selalu relatif terhadap `a` (jangkar = saat data contoh dibuat). */
export function pesananContoh(a: number): Pesanan[] {
  /** Geser dalam menit kerja dari jangkar. */
  const k = (menit: number) => bulatkan(kerja(a, menit));
  const dasar = {
    alamat: ALAMAT[0].isi,
    noda: [] as string[],
    pisahWarna: true,
    lipat: 'lipat' as const,
    contoh: true,
  };

  const aktif1: Pesanan = {
    ...dasar,
    no: 'BU-24118',
    layanan: 'reguler',
    antar: true,
    jemput: k(-(26 * 60 + 50)),
    beratPerkiraan: 4,
    berat: 4.6,
    satuan: [{ kode: 'bedcover-b', qty: 1 }],
    noda: ['Kopi / teh'],
    catatanNoda: 'Kemeja putih, ujung lengan kanan',
    pewangi: 'lavender',
    jadwal: {
      diterima: k(-(26 * 60 + 10)),
      ditimbang: k(-(25 * 60 + 45)),
      dicuci: k(-22 * 60),
      dikeringkan: k(-(8 * 60 + 20)),
      disetrika: k(-65),
      siap: k(3 * 60 + 40),
      tuntas: k(4 * 60 + 50),
    },
    dibuat: k(-28 * 60),
  };

  const aktif2: Pesanan = {
    ...dasar,
    no: 'BU-24121',
    layanan: 'kilat',
    antar: false,
    alamat: 'Diambil sendiri di outlet',
    beratPerkiraan: 2,
    berat: 2.3,
    satuan: [],
    pewangi: 'melati',
    lipat: 'gantung',
    catatan: 'Seragam kerja, tolong digantung pakai hanger',
    jadwal: {
      diterima: k(-135),
      ditimbang: k(-125),
      dicuci: k(-105),
      dikeringkan: k(-40),
      disetrika: k(20),
      siap: k(85),
      tuntas: k(85) + 20 * JAM,
    },
    bayar: { metode: 'qris', waktu: k(-120), diskon: 0 },
    dibuat: k(-135),
  };

  // Jemput terjadwal: slot berikutnya yang masih ≥ 3 jam lagi, atau besok pagi.
  let mulai = padaJam(a, 8);
  for (const j of [8, 10, 13, 15, 17]) {
    mulai = padaJam(a, j);
    if (mulai - a >= 3 * JAM) break;
  }
  if (mulai - a < 3 * JAM) mulai = padaJam(a + HARI_MS, 8);
  const jemput3: Pesanan = {
    ...dasar,
    no: 'BU-24124',
    layanan: 'sehari',
    antar: true,
    jemput: mulai,
    beratPerkiraan: 5,
    berat: 5.4,
    satuan: [{ kode: 'sprei', qty: 2 }],
    pewangi: 'lavender',
    catatan: 'Pagar hijau, titip ke satpam kalau saya belum pulang',
    jadwal: susunJadwal(mulai + 50 * MENIT, 'sehari', true),
    dibuat: k(-40),
  };

  const riwayat = (
    no: string, hariLalu: number, jamMasuk: number, layanan: KodeLayanan, berat: number,
    satuan: Pesanan['satuan'], antar: boolean, bayar: Pembayaran['metode'], extra: Partial<Pesanan> = {},
  ): Pesanan => {
    const diterima = padaJam(a - hariLalu * HARI_MS, jamMasuk, 20);
    const jadwal = susunJadwal(diterima, layanan, antar);
    return {
      ...dasar,
      no,
      layanan,
      antar,
      jemput: antar ? diterima - 40 * MENIT : undefined,
      alamat: antar ? ALAMAT[0].isi : 'Diambil sendiri di outlet',
      beratPerkiraan: Math.round(berat),
      berat,
      satuan,
      pewangi: 'lavender',
      jadwal,
      bayar: { metode: bayar, waktu: bulatkan(kerja(jadwal.siap, 30)), diskon: 0 },
      dibuat: diterima - JAM,
      ...extra,
    };
  };

  // Order yang baru saja sampai (±45 menit kerja lalu): untuk penilaian & jalur komplain.
  const baruSampai: Pesanan = {
    ...dasar,
    no: 'BU-24115',
    layanan: 'sehari',
    antar: true,
    jemput: k(-(16 * 60 + 40)),
    beratPerkiraan: 6,
    berat: 5.8,
    satuan: [{ kode: 'selimut', qty: 1 }],
    noda: ['Lumpur'],
    catatanNoda: 'Celana panjang abu, lutut kiri',
    pewangi: 'bayi',
    catatan: 'Baju anak, tolong pewangi yang lembut',
    jadwal: susunJadwal(k(-16 * 60), 'sehari', true),
    bayar: { metode: 'dompet', waktu: k(-(15 * 60 + 30)), diskon: 0 },
    dibuat: k(-17 * 60),
  };

  return [
    aktif1,
    aktif2,
    jemput3,
    baruSampai,
    riwayat('BU-24109', 3, 9, 'reguler', 5.2, [], true, 'dompet'),
    riwayat('BU-24097', 9, 8, 'kilat', 2.0, [{ kode: 'kebaya', qty: 1 }], false, 'tunai', { pewangi: 'melati' }),
    riwayat('BU-24083', 16, 10, 'reguler', 6.1, [{ kode: 'sprei', qty: 1 }], true, 'qris', {
      noda: ['Minyak / saus'],
    }),
    riwayat('BU-24070', 24, 13, 'reguler', 0, [{ kode: 'sepatu', qty: 2 }, { kode: 'tas', qty: 1 }], true, 'va'),
    riwayat('BU-24058', 33, 9, 'lipat', 7.4, [], true, 'dompet', { pewangi: 'tanpa' }),
    riwayat('BU-24041', 47, 15, 'reguler', 4.0, [{ kode: 'bedcover-k', qty: 1 }], true, 'qris'),
  ].map((p) => {
    // Diskon voucher contoh pada satu riwayat
    if (p.no === 'BU-24083' && p.bayar && [2, 3, 4].includes(bagianWIB(p.bayar.waktu).hari)) {
      const n = hitungNota(p, Number.MAX_SAFE_INTEGER);
      p.bayar = { ...p.bayar, voucher: 'HEMATTENGAH', diskon: Math.min(10000, Math.round((n.kiloan * 0.1) / 100) * 100) };
    }
    return p;
  });
}

/* ---------- Turunan ---------- */

/** -1 = menunggu jemput, 0..5 = indeks TAHAP, 6 = tuntas (sudah diantar/diambil). */
export function indeksTahap(p: Pesanan, kini: number) {
  if (kini >= p.jadwal.tuntas) return 6;
  let i = -1;
  TAHAP.forEach((t, k) => {
    if (p.jadwal[t.kode] <= kini) i = k;
  });
  return i;
}

export function namaTahapKini(p: Pesanan, kini: number) {
  const i = indeksTahap(p, kini);
  if (i === -1) return p.jemput ? 'Menunggu dijemput' : 'Menunggu diantar ke outlet';
  if (i === 6) return p.antar ? 'Sudah diterima' : 'Sudah diambil';
  if (i === 5) return p.antar ? (kini >= p.jadwal.siap + 10 * MENIT ? 'Sedang diantar' : 'Siap diantar') : 'Siap diambil';
  if (i === 4 && p.layanan === 'lipat') return 'Dilipat';
  return ['Diterima', 'Ditimbang', 'Sedang dicuci', 'Dikeringkan', 'Disetrika'][i];
}

export function aktif(p: Pesanan, kini: number) {
  return kini < p.jadwal.tuntas;
}

/** Saat cucian bisa dinikmati pelanggan: tiba di rumah (antar) atau siap diambil. */
export function perkiraanSelesai(p: Pesanan) {
  return p.antar ? p.jadwal.tuntas : p.jadwal.siap;
}

export interface BarisNota {
  nama: string;
  rincian: string;
  jumlah: number;
}

export function hitungNota(p: Pesanan, kini: number) {
  const sudahTimbang = kini >= p.jadwal.ditimbang;
  const berat = sudahTimbang ? p.berat : p.beratPerkiraan;
  const lay = LAYANAN[p.layanan];
  const baris: BarisNota[] = [];
  let kiloan = 0;
  if (berat > 0) {
    const ditagih = Math.max(berat, BERAT_MINIMUM);
    kiloan = Math.round(ditagih * lay.hargaKg);
    baris.push({
      nama: lay.nama,
      rincian: `${ditagih.toFixed(1).replace('.', ',')} kg × ${rupiah(lay.hargaKg)}${berat < BERAT_MINIMUM ? ' (minimum 3 kg)' : ''}`,
      jumlah: kiloan,
    });
  }
  for (const s of p.satuan) {
    const it = SATUAN.find((x) => x.kode === s.kode);
    if (!it) continue;
    baris.push({ nama: it.nama, rincian: `${s.qty} × ${rupiah(it.harga)}`, jumlah: s.qty * it.harga });
  }
  if (p.noda.length) {
    baris.push({ nama: EKSTRA.noda.nama, rincian: `${p.noda.length} titik × Rp5.000`, jumlah: p.noda.length * EKSTRA.noda.harga });
  }
  if (p.jemput || p.antar) baris.push({ nama: 'Jemput-antar', rincian: '≤ 3 km dari outlet', jumlah: 0 });
  const subtotal = baris.reduce((s, b) => s + b.jumlah, 0);
  const diskon = p.bayar?.diskon ?? 0;
  const total = Math.max(0, subtotal - diskon);
  return { baris, subtotal, diskon, total, kiloan, berat, sudahTimbang, poin: Math.floor(total / 1000) };
}

export function lunas(p: Pesanan, kini: number) {
  if (!p.bayar) return false;
  if (p.bayar.metode === 'tunai') return kini >= p.jadwal.tuntas;
  return true;
}

export function namaPewangi(kode: string) {
  return PEWANGI.find((x) => x.kode === kode)?.nama ?? kode;
}

export function nilaiVoucher(kode: string, p: Pesanan, kini: number) {
  const n = hitungNota({ ...p, bayar: undefined }, kini);
  const v = VOUCHER.find((x) => x.kode === kode);
  if (v) {
    if (v.hari && !v.hari.includes(bagianWIB(kini).hari)) return 0;
    if (v.jenis === 'persen') return Math.min(v.maks ?? Infinity, Math.round((n.kiloan * v.nilai) / 100 / 100) * 100);
    if (v.jenis === 'potong') return p.satuan.some((s) => s.kode.startsWith('bedcover')) ? v.nilai : 0;
    return 0; // ongkir: jarak contoh ≤ 3 km, jadi tidak mengurangi nota
  }
  const t = kode.match(/^TUKAR(\d+)-/);
  if (t) return Math.min(n.subtotal, Number(t[1]) * 1000);
  return 0;
}

/* ---------- Notifikasi ---------- */

export interface Notifikasi {
  id: string;
  waktu: number;
  judul: string;
  isi: string;
  no?: string;
  jenis: 'tahap' | 'bayar' | 'promo' | 'jemput' | 'komplain';
}

export function notifikasiDari(pesanan: Pesanan[], kini: number, jangkar: number): Notifikasi[] {
  const out: Notifikasi[] = [];
  const batas = kini - 4 * HARI_MS;
  for (const p of pesanan) {
    const push = (n: Notifikasi) => {
      if (n.waktu <= kini && n.waktu >= batas) out.push(n);
    };
    if (p.jemput) {
      push({
        id: `${p.no}:jadwal`, waktu: p.dibuat, jenis: 'jemput', no: p.no,
        judul: 'Jemput terjadwal',
        isi: `Kurir ${KURIR.nama} datang di slot ${jamSlot(p.jemput)} untuk ${p.no}.`,
      });
    }
    const pw = namaPewangi(p.pewangi);
    const teks: Record<KodeTahap, [string, string]> = {
      diterima: ['Cucian diterima', `${p.no} sudah sampai di outlet dan dicatat.`],
      ditimbang: ['Sudah ditimbang', p.berat > 0 ? `Berat ${p.berat.toFixed(1).replace('.', ',')} kg. Nota ${p.no} diperbarui.` : `Item satuan ${p.no} sudah dicek satu per satu.`],
      dicuci: ['Mulai dicuci', `${p.no} dicuci${p.pisahWarna ? ' terpisah putih & warna' : ''}${p.pewangi !== 'tanpa' ? `, pewangi ${pw}` : ', tanpa pewangi'}.`],
      dikeringkan: ['Sedang dikeringkan', `${p.no} masuk pengering suhu rendah.`],
      disetrika: [p.layanan === 'lipat' ? 'Sedang dilipat' : 'Sedang disetrika', `${p.no} dirapikan${p.lipat === 'gantung' ? ' dan digantung' : ' dan dilipat'}.`],
      siap: [p.antar ? 'Siap diantar' : 'Siap diambil', p.antar ? `Kurir ${KURIR.nama} membawa ${p.no} ke alamatmu.` : `${p.no} bisa diambil di ${'outlet'} sampai 21.00 WIB.`],
    };
    const masihJalan = kini < p.jadwal.tuntas;
    for (const t of TAHAP) {
      // Order lama cukup kabar utamanya saja supaya daftar tidak riuh.
      if (!masihJalan && t.kode !== 'diterima' && t.kode !== 'siap') continue;
      push({ id: `${p.no}:${t.kode}`, waktu: p.jadwal[t.kode], jenis: 'tahap', no: p.no, judul: teks[t.kode][0], isi: teks[t.kode][1] });
    }
    if (p.antar) {
      push({ id: `${p.no}:tuntas`, waktu: p.jadwal.tuntas, jenis: 'tahap', no: p.no, judul: 'Cucian sudah sampai', isi: `${p.no} diterima di rumah. Terima kasih sudah mencuci di Busa Ungu.` });
    }
    if (p.bayar && p.bayar.metode !== 'tunai') {
      const n = hitungNota(p, kini);
      push({ id: `${p.no}:bayar`, waktu: p.bayar.waktu, jenis: 'bayar', no: p.no, judul: 'Pembayaran berhasil', isi: `${p.no} lunas lewat ${METODE[p.bayar.metode].nama} (simulasi). +${n.poin} poin.` });
    }
  }
  void jangkar;
  out.push(promoTerkini(kini));
  return out.filter((n) => n.waktu <= kini).sort((x, y) => y.waktu - x.waktu);
}

/** Kabar promo pagi (07.10 WIB) yang isinya sesuai hari, bukan promo "tengah pekan" di hari Jumat. */
export function promoTerkini(kini: number): Notifikasi {
  let w = padaJam(kini, 7, 10);
  if (w > kini) w = padaJam(kini - HARI_MS, 7, 10);
  const h = bagianWIB(w).hari;
  if (h >= 2 && h <= 4) {
    return { id: `promo:${w}`, waktu: w, jenis: 'promo', judul: 'Hemat tengah pekan', isi: 'Diskon 10% semua kiloan dengan kode HEMATTENGAH, berlaku Selasa–Kamis.' };
  }
  if (h === 1) {
    return { id: `promo:${w}`, waktu: w, jenis: 'promo', judul: 'Ongkir jauh gratis', isi: 'Rumah 3–6 km dari outlet? Pakai ANTARJAUH, jemput-antar gratis sekali pakai.' };
  }
  return { id: `promo:${w}`, waktu: w, jenis: 'promo', judul: 'Bed cover akhir pekan', isi: 'Cuci bed cover lebih ringan Rp5.000 dengan kode BEDCOVER5. Cek di menu Poin.' };
}

export function jamSlot(mulai: number) {
  const f = (ms: number) => {
    const d = new Date(ms + 7 * JAM);
    return `${String(d.getUTCHours()).padStart(2, '0')}.${String(d.getUTCMinutes()).padStart(2, '0')}`;
  };
  return `${f(mulai)}–${f(mulai + 2 * JAM)}`;
}

/* ---------- Kemajuan tahap (untuk kepala Status) ---------- */

export interface Kemajuan {
  i: number;
  persen: number;
  sisaMenit: number;
  akhir: number;
  tutup: boolean;
}

/** Seberapa jauh tahap aktif berjalan, dihitung dalam menit kerja (outlet 07.00–21.00 WIB). */
export function kemajuanTahap(p: Pesanan, kini: number): Kemajuan {
  const i = indeksTahap(p, kini);
  const tutup = !outletBuka(kini);
  if (i === 6) return { i, persen: 1, sisaMenit: 0, akhir: p.jadwal.tuntas, tutup };
  if (i === -1) {
    const akhir = p.jemput ?? p.jadwal.diterima;
    return { i, persen: 0, sisaMenit: Math.max(0, (akhir - kini) / MENIT), akhir, tutup };
  }
  const mulai = p.jadwal[TAHAP[i].kode];
  const akhir = i < 5 ? p.jadwal[TAHAP[i + 1].kode] : p.antar ? p.jadwal.tuntas : p.jadwal.siap;
  if (i === 5 && !p.antar) return { i, persen: 1, sisaMenit: 0, akhir, tutup };
  const total = Math.max(1, menitKerjaAntara(mulai, akhir));
  const jalan = menitKerjaAntara(mulai, kini);
  return { i, persen: Math.min(0.99, jalan / total), sisaMenit: Math.max(1, Math.round(menitKerjaAntara(kini, akhir))), akhir, tutup };
}

export function teksSisa(menit: number) {
  if (menit < 60) return `±${Math.max(1, Math.round(menit / 5) * 5 || 1)} menit`;
  const j = Math.floor(menit / 60);
  const m = Math.round((menit - j * 60) / 5) * 5;
  return m && j < 5 ? `±${j} jam ${m} menit` : `±${Math.round(menit / 60)} jam`;
}

/** Jendela antar 2 jam yang memuat perkiraan tiba. */
export function slotAntar(p: Pesanan) {
  const mulai = Math.floor((p.jadwal.tuntas - 60 * MENIT + 7 * JAM) / JAM) * JAM - 7 * JAM;
  return mulai;
}

export const BATAS_KOMPLAIN = 24 * JAM;
