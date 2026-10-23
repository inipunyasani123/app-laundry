/** Katalog Busa Ungu. Usaha, alamat, nama, dan harga di sini rekaan untuk demo. */

export const MEREK = {
  nama: 'Busa Ungu',
  sebutan: 'Laundry kiloan & satuan',
  outlet: 'Outlet Kenanga (alamat rekaan)',
  jamBuka: '07.00–21.00 WIB',
  pelanggan: 'Rani',
  url: 'https://app-laundry.pintuweb.id',
  kontakPintuWeb: 'https://www.pintuweb.id/kontak?demo=laundry',
};

export type KodeLayanan = 'reguler' | 'sehari' | 'kilat' | 'lipat';

export interface Layanan {
  kode: KodeLayanan;
  nama: string;
  singkat: string;
  hargaKg: number;
  /** Lama pengerjaan dalam JAM KERJA (outlet buka 07.00–21.00 WIB). */
  jam: number;
  ket: string;
}

export const LAYANAN: Record<KodeLayanan, Layanan> = {
  reguler: { kode: 'reguler', nama: 'Cuci setrika reguler', singkat: 'Reguler', hargaKg: 7000, jam: 28, ket: 'Selesai 2 hari' },
  sehari: { kode: 'sehari', nama: 'Cuci setrika sehari jadi', singkat: 'Sehari jadi', hargaKg: 10000, jam: 14, ket: 'Selesai 24 jam' },
  kilat: { kode: 'kilat', nama: 'Cuci setrika kilat', singkat: 'Kilat 6 jam', hargaKg: 14000, jam: 6, ket: 'Selesai 6 jam kerja' },
  lipat: { kode: 'lipat', nama: 'Cuci kering lipat', singkat: 'Cuci lipat', hargaKg: 5500, jam: 14, ket: 'Tanpa setrika, dilipat rapi' },
};

export const URUTAN_LAYANAN: KodeLayanan[] = ['reguler', 'sehari', 'kilat', 'lipat'];

export const BERAT_MINIMUM = 3;

export interface ItemSatuan {
  kode: string;
  nama: string;
  harga: number;
  ket: string;
}

export const SATUAN: ItemSatuan[] = [
  { kode: 'bedcover-b', nama: 'Bed cover besar', harga: 30000, ket: 'Ukuran 180–200 cm' },
  { kode: 'bedcover-k', nama: 'Bed cover kecil', harga: 22000, ket: 'Ukuran 100–160 cm' },
  { kode: 'selimut', nama: 'Selimut tebal', harga: 15000, ket: 'Per lembar' },
  { kode: 'sprei', nama: 'Sprei + 2 sarung bantal', harga: 12000, ket: 'Satu set' },
  { kode: 'jas', nama: 'Jas / blazer', harga: 25000, ket: 'Dicuci kering, digantung' },
  { kode: 'kebaya', nama: 'Kebaya / gaun pesta', harga: 30000, ket: 'Dicek payet & renda dulu' },
  { kode: 'gamis', nama: 'Gamis / batik halus', harga: 15000, ket: 'Dicuci tangan' },
  { kode: 'sepatu', nama: 'Sepatu kanvas', harga: 30000, ket: 'Per pasang, 2 hari' },
  { kode: 'tas', nama: 'Tas ransel', harga: 25000, ket: 'Per buah' },
  { kode: 'boneka', nama: 'Boneka sedang', harga: 15000, ket: 'Tinggi s.d. 50 cm' },
];

export const EKSTRA = {
  noda: { nama: 'Perawatan noda', harga: 5000, ket: 'Per titik noda yang ditandai' },
  ongkirDekat: { nama: 'Jemput-antar ≤ 3 km', harga: 0 },
  ongkirJauh: { nama: 'Jemput-antar 3–6 km', harga: 5000 },
};

export const PEWANGI = [
  { kode: 'lavender', nama: 'Lavender Ungu', ket: 'Ciri khas kami, lembut' },
  { kode: 'melati', nama: 'Melati', ket: 'Segar, tidak menyengat' },
  { kode: 'bayi', nama: 'Bedak bayi', ket: 'Manis dan hangat' },
  { kode: 'tanpa', nama: 'Tanpa pewangi', ket: 'Untuk kulit sensitif' },
];

export const NODA = ['Kopi / teh', 'Tinta', 'Minyak / saus', 'Lumpur', 'Kuning keringat', 'Lipstik'];

/** Slot jemput (jam mulai WIB). Masing-masing 2 jam. */
export const SLOT_JEMPUT = [8, 10, 13, 15, 17, 19];

export type KodeTahap = 'diterima' | 'ditimbang' | 'dicuci' | 'dikeringkan' | 'disetrika' | 'siap';

export interface Tahap {
  kode: KodeTahap;
  nama: string;
  simbol: 'keranjang' | 'timbangan' | 'bak' | 'pengering' | 'setrika' | 'lipatan';
}

export const TAHAP: Tahap[] = [
  { kode: 'diterima', nama: 'Diterima', simbol: 'keranjang' },
  { kode: 'ditimbang', nama: 'Ditimbang', simbol: 'timbangan' },
  { kode: 'dicuci', nama: 'Dicuci', simbol: 'bak' },
  { kode: 'dikeringkan', nama: 'Dikeringkan', simbol: 'pengering' },
  { kode: 'disetrika', nama: 'Disetrika', simbol: 'setrika' },
  { kode: 'siap', nama: 'Siap', simbol: 'lipatan' },
];

/** Porsi waktu tiap tahap dari total durasi layanan (dijumlah = 1). */
export const PORSI_TAHAP: Record<KodeTahap, number> = {
  diterima: 0,
  ditimbang: 0.03,
  dicuci: 0.22,
  dikeringkan: 0.42,
  disetrika: 0.68,
  siap: 1,
};

export const KURIR = { nama: 'Bayu', motor: 'Motor bebek ungu · AG 0000 BU (rekaan)' };

export interface Voucher {
  kode: string;
  judul: string;
  ket: string;
  jenis: 'persen' | 'potong' | 'ongkir';
  nilai: number;
  maks?: number;
  hariBerlaku: number;
  /** Hari WIB yang berlaku (0 = Minggu). Kosong = setiap hari. */
  hari?: number[];
  syarat?: string;
}

export const VOUCHER: Voucher[] = [
  { kode: 'HEMATTENGAH', judul: 'Hemat tengah pekan', ket: 'Diskon 10% semua kiloan, maks Rp10.000', jenis: 'persen', nilai: 10, maks: 10000, hariBerlaku: 14, hari: [2, 3, 4], syarat: 'Hanya berlaku Selasa–Kamis' },
  { kode: 'BEDCOVER5', judul: 'Bed cover lebih ringan', ket: 'Potongan Rp5.000 untuk nota berisi bed cover', jenis: 'potong', nilai: 5000, hariBerlaku: 3 },
  { kode: 'ANTARJAUH', judul: 'Ongkir jauh gratis', ket: 'Bebas ongkir 3–6 km sekali pakai', jenis: 'ongkir', nilai: 5000, hariBerlaku: 10 },
];

export const TUKAR_POIN = [
  { kode: 'TUKAR10', poin: 200, judul: 'Voucher Rp10.000', nilai: 10000 },
  { kode: 'TUKAR25', poin: 450, judul: 'Voucher Rp25.000', nilai: 25000 },
];

export const TINGKAT = [
  { nama: 'Busa Bening', min: 0, manfaat: 'Poin tiap transaksi & kartu cap' },
  { nama: 'Busa Lembut', min: 1000, manfaat: 'Jemput-antar 3–6 km gratis' },
  { nama: 'Busa Wangi', min: 2500, manfaat: 'Pewangi premium gratis & jemput prioritas' },
];

export function rupiah(n: number) {
  const s = Math.round(Math.abs(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${n < 0 ? '−' : ''}Rp${s}`;
}

export function kg(n: number) {
  return `${n.toFixed(1).replace('.', ',')} kg`;
}

export function ribuan(n: number) {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
