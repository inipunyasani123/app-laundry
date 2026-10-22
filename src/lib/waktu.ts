/** Semua jam di aplikasi ini memakai WIB (UTC+7), apa pun zona waktu perangkat. */
export const MENIT = 60_000;
export const JAM = 60 * MENIT;
export const HARI_MS = 24 * JAM;
const WIB = 7 * JAM;

const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const BULAN_PANJANG = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

const dua = (n: number) => String(n).padStart(2, '0');

export function bagianWIB(ms: number) {
  const d = new Date(ms + WIB);
  return {
    tahun: d.getUTCFullYear(),
    bulan: d.getUTCMonth(),
    tanggal: d.getUTCDate(),
    hari: d.getUTCDay(),
    jam: d.getUTCHours(),
    menit: d.getUTCMinutes(),
  };
}

/** 00.00 WIB pada hari yang memuat `ms`. */
export function awalHari(ms: number) {
  return Math.floor((ms + WIB) / HARI_MS) * HARI_MS - WIB;
}

/** Waktu pada hari `ms` (WIB) pukul jam:menit. */
export function padaJam(ms: number, jam: number, menit = 0) {
  return awalHari(ms) + jam * JAM + menit * MENIT;
}

export const bulatkan = (ms: number, langkah = 5 * MENIT) => Math.round(ms / langkah) * langkah;

export function jam(ms: number) {
  const b = bagianWIB(ms);
  return `${dua(b.jam)}.${dua(b.menit)}`;
}

export function tanggalPendek(ms: number) {
  const b = bagianWIB(ms);
  return `${HARI[b.hari]}, ${b.tanggal} ${BULAN[b.bulan]}`;
}

export function tanggalPanjang(ms: number) {
  const b = bagianWIB(ms);
  return `${b.tanggal} ${BULAN_PANJANG[b.bulan]} ${b.tahun}`;
}

export function tglBulan(ms: number) {
  const b = bagianWIB(ms);
  return `${b.tanggal} ${BULAN[b.bulan]}`;
}

export function namaHari(ms: number) {
  return HARI[bagianWIB(ms).hari];
}

/** "Hari ini", "Besok", "Kemarin", atau "Kamis, 23 Okt". */
export function hariRelatif(ms: number, kini: number) {
  const selisih = Math.round((awalHari(ms) - awalHari(kini)) / HARI_MS);
  if (selisih === 0) return 'Hari ini';
  if (selisih === 1) return 'Besok';
  if (selisih === -1) return 'Kemarin';
  if (selisih === 2) return 'Lusa';
  return tanggalPendek(ms);
}

/** "Hari ini 15.00 WIB" */
export function kapan(ms: number, kini: number) {
  return `${hariRelatif(ms, kini)} ${jam(ms)} WIB`;
}

/** Sisa waktu yang enak dibaca: "45 menit lagi", "±5 jam lagi", "2 hari lagi". */
export function sisaWaktu(ms: number, kini: number) {
  const d = ms - kini;
  if (d <= 0) return 'sekarang';
  if (d < JAM) return `${Math.max(1, Math.round(d / MENIT))} menit lagi`;
  if (d < 24 * JAM) {
    const j = Math.floor(d / JAM);
    const m = Math.round((d - j * JAM) / MENIT / 5) * 5;
    return m > 0 && j < 6 ? `${j} jam ${m} menit lagi` : `±${Math.round(d / JAM)} jam lagi`;
  }
  return `${Math.round(d / HARI_MS)} hari lagi`;
}

export function lalu(ms: number, kini: number) {
  const d = kini - ms;
  if (d < MENIT) return 'baru saja';
  if (d < JAM) return `${Math.round(d / MENIT)} menit lalu`;
  if (d < 24 * JAM) return `${Math.round(d / JAM)} jam lalu`;
  if (d < 7 * HARI_MS) return `${Math.round(d / HARI_MS)} hari lalu`;
  return tglBulan(ms);
}

export function salam(kini: number) {
  const j = bagianWIB(kini).jam;
  if (j < 4) return 'Selamat malam';
  if (j < 11) return 'Selamat pagi';
  if (j < 15) return 'Selamat siang';
  if (j < 18) return 'Selamat sore';
  return 'Selamat malam';
}

/** Seperti hariRelatif, tapi huruf kecil untuk kata relatif ("besok"), tanggal tetap ("Kamis, 23 Okt"). */
export function hariKalimat(ms: number, kini: number) {
  const h = hariRelatif(ms, kini);
  return h.includes(',') ? `${h},` : h.toLowerCase();
}

/** Jam operasional outlet (WIB). */
export const BUKA = 7;
export const TUTUP = 21;

/**
 * Geser waktu sebanyak `menit` MENIT KERJA (hanya dihitung di dalam jam buka 07.00–21.00 WIB).
 * Positif = maju, negatif = mundur. Dipakai agar jadwal contoh tidak jatuh tengah malam.
 */
export function kerja(ms: number, menit: number) {
  let t = ms;
  let sisa = Math.abs(menit) * MENIT;
  if (menit >= 0) {
    for (let i = 0; i < 60 && sisa > 0; i++) {
      const buka = padaJam(t, BUKA);
      const tutup = padaJam(t, TUTUP);
      if (t < buka) t = buka;
      else if (t >= tutup) {
        t = padaJam(t + HARI_MS, BUKA);
        continue;
      }
      const ada = padaJam(t, TUTUP) - t;
      if (sisa <= ada) return t + sisa;
      sisa -= ada;
      t = padaJam(t + HARI_MS, BUKA);
    }
    return t;
  }
  for (let i = 0; i < 60 && sisa > 0; i++) {
    const buka = padaJam(t, BUKA);
    const tutup = padaJam(t, TUTUP);
    if (t > tutup) t = tutup;
    else if (t <= buka) {
      t = padaJam(t - HARI_MS, TUTUP);
      continue;
    }
    const ada = t - padaJam(t, BUKA);
    if (sisa <= ada) return t - sisa;
    sisa -= ada;
    t = padaJam(t - HARI_MS, TUTUP);
  }
  return t;
}
