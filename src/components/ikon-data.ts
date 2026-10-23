/**
 * Ikon & ilustrasi buatan sendiri (viewBox 24×24 kecuali disebut lain).
 * Simbol tahap meminjam bahasa label perawatan pakaian: bak cuci, kotak pengering, setrika.
 */
export type Bentuk =
  | { t: 'path'; d: string; isi?: string; garis?: string; tebal?: number }
  | { t: 'circle'; cx: number; cy: number; r: number; isi?: string; garis?: string; tebal?: number }
  | { t: 'rect'; x: number; y: number; w: number; h: number; rx?: number; isi?: string; garis?: string; tebal?: number };

const P = (d: string, isi?: string): Bentuk => ({ t: 'path', d, isi });
const C = (cx: number, cy: number, r: number, isi?: string): Bentuk => ({ t: 'circle', cx, cy, r, isi });
const R = (x: number, y: number, w: number, h: number, rx = 0, isi?: string): Bentuk => ({ t: 'rect', x, y, w, h, rx, isi });

/** `isi: 'cur'` = diisi warna ikon. */
export const IKON = {
  keranjang: [P('M4 9.5h16l-1.7 9a2 2 0 0 1-2 1.6H7.7a2 2 0 0 1-2-1.6z'), P('M8.5 9.5 11 4.5M15.5 9.5 13 4.5'), P('M9.5 13v4M12 13v4M14.5 13v4')],
  timbangan: [P('M5.2 8h13.6l1.4 11a1 1 0 0 1-1 1.1H4.8a1 1 0 0 1-1-1.1z'), C(12, 14, 3.4), P('M12 14l1.9-2'), P('M9.5 8V5.5h5V8')],
  bak: [P('M3 8.5 5.4 19h13.2L21 8.5'), P('M3 8.5c1.5-1.5 3-1.5 4.5 0s3 1.5 4.5 0 3-1.5 4.5 0 3 1.5 4.5 0'), C(12, 14.2, 1.15, 'cur')],
  pengering: [R(4, 4, 16, 16, 2.6), C(12, 12, 5), C(12, 12, 1.15, 'cur')],
  setrika: [P('M3.5 17.5h17l-.4-2A7 7 0 0 0 13.3 10H8.2'), P('M8.2 10V8a1.6 1.6 0 0 1 1.6-1.6h7.4'), C(12.6, 14.1, 1.1, 'cur')],
  lipatan: [P('M5 9.2 8.6 6h6.8L19 9.2V19H5z'), P('M9.6 6 12 9l2.4-3'), P('M5 13.5h14')],
  motor: [C(6, 17, 2.6), C(18, 17, 2.6), P('M8.6 17h6.6l2.2-6.2h-3.8'), P('M3.5 11.2h5.2l2.4 5.8'), P('M15.6 7.6h3l1.2 3.2')],
  beranda: [P('M4 11 12 4.5l8 6.5v8a1 1 0 0 1-1 1h-4.6v-5.2H9.6V20H5a1 1 0 0 1-1-1z')],
  jemput: [R(4, 5.5, 16, 14.5, 2.4), P('M4 10.2h16M8.5 3.5v4M15.5 3.5v4'), P('M9 14.6l2 2 4-4.2')],
  nota: [P('M6 3.5h12v17l-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4-2 1.4z'), P('M9 8h6M9 11.5h6M9 15h3.6')],
  busa: [C(9, 14, 5.2), C(16.6, 8.2, 3.3), C(17.4, 17, 2.1), P('M6.6 12.4a2.6 2.6 0 0 1 2.2-1.6')],
  lonceng: [P('M6 16.5V11a6 6 0 0 1 12 0v5.5l1.6 2.1H4.4z'), P('M10 20.6a2.1 2.1 0 0 0 4 0')],
  kembali: [P('M14.5 5.5 8 12l6.5 6.5')],
  panah: [P('M9.5 5.5 16 12l-6.5 6.5')],
  tutup: [P('M6.5 6.5l11 11M17.5 6.5l-11 11')],
  cek: [P('M5 12.5l4.5 4.5L19 7.5')],
  jam: [C(12, 12, 8.5), P('M12 7.5V12l3.2 2')],
  tetes: [P('M12 3.6c3 3.9 6 7.1 6 10.4a6 6 0 0 1-12 0c0-3.3 3-6.5 6-10.4z'), P('M9.2 14.4a2.8 2.8 0 0 0 2.6 2.8')],
  noda: [P('M12 4.6c1.5 0 2 1.7 3.3 2.1 1.4.4 3.1-.3 3.7 1.1.6 1.4-.9 2.5-.8 4 .1 1.4 1.8 2.6 1 3.8-.9 1.2-2.7.4-3.9 1.1-1.2.7-1.6 2.7-3.2 2.7-1.5 0-2-1.8-3.3-2.2-1.4-.4-3.2.3-3.8-1.1-.6-1.4 1-2.5.9-4-.1-1.4-1.9-2.6-1-3.8.9-1.2 2.8-.3 4-1 1.2-.8 1.6-2.7 3.1-2.7z'), C(19.6, 5, 1.1, 'cur')],
  lokasi: [P('M12 21s6.5-6.1 6.5-11a6.5 6.5 0 0 0-13 0c0 4.9 6.5 11 6.5 11z'), C(12, 10, 2.3)],
  label: [P('M3.5 12.2V5A1.5 1.5 0 0 1 5 3.5h7.2l8.3 8.3a1.5 1.5 0 0 1 0 2.1l-6.4 6.4a1.5 1.5 0 0 1-2.1 0z'), C(8, 8, 1.4)],
  dompet: [R(3.5, 6.5, 17, 12.5, 2.6), P('M15.5 12.8h5M6 6.5l9.2-3 1.1 3')],
  qris: [R(4, 4, 6, 6, 1), R(14, 4, 6, 6, 1), R(4, 14, 6, 6, 1), P('M14 14h2.5v2.5H14zM17.5 17.5H20V20h-2.5zM14 20h1M20 14v1')],
  bank: [P('M4 9.5 12 5l8 4.5'), P('M5.5 10.5v6.5M9.8 10.5v6.5M14.2 10.5v6.5M18.5 10.5v6.5M3.5 19.5h17')],
  uang: [R(3, 7, 18, 10, 2), C(12, 12, 2.6), P('M6.5 10v4M17.5 10v4')],
  hadiah: [R(4.5, 10, 15, 10, 1.5), R(3.5, 7, 17, 3.2, 1), P('M12 7v13'), P('M12 7C10.4 3.8 6.8 4 7.2 6.1 7.5 7.2 9.8 7 12 7zM12 7c1.6-3.2 5.2-3 4.8-.9-.3 1.1-2.6.9-4.8.9z')],
  tambah: [P('M12 5.5v13M5.5 12h13')],
  kurang: [P('M5.5 12h13')],
  kilat: [P('M13.5 3 5.5 13.6h6l-1 7.4 8-10.6h-6z')],
  gantungan: [P('M10.3 6.2a1.8 1.8 0 1 1 2.6 1.6c-.6.3-.9.7-.9 1.3v.4'), P('M12 9.5 3.6 15.6a.9.9 0 0 0 .5 1.6h15.8a.9.9 0 0 0 .5-1.6z')],
  ulang: [P('M5 12a7 7 0 1 0 2.1-5'), P('M5 4.6V8.2h3.6')],
  maju: [P('M5 6.5 11.5 12 5 17.5zM12.5 6.5 19 12l-6.5 5.5z')],
  info: [C(12, 12, 8.5), P('M12 11v5'), C(12, 8, 0.9, 'cur')],
  bintang: [P('M12 3.8l2.4 5 5.5.7-4 3.8 1 5.4L12 16l-4.9 2.7 1-5.4-4-3.8 5.5-.7z')],
  pisah: [C(8.5, 12, 4.8), C(15.5, 12, 4.8)],
  // Item satuan
  bedcover: [R(3, 6, 18, 12, 2), P('M3 12h18M9 6v12M15 6v12')],
  bedcoverKecil: [R(5, 8, 14, 9, 2), P('M5 12.5h14M12 8v9')],
  selimut: [P('M4 7.5h16v4.5H4z'), P('M4 12h16v5.2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z'), P('M7.5 15.2h9')],
  sprei: [P('M3 17v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5'), P('M3 15h18M3 17v2.2M21 17v2.2'), R(5.5, 6.2, 5, 3.8, 1.3)],
  jas: [P('M8.3 4 12 9l3.7-5'), P('M8.3 4 4.5 6.2V20h15V6.2L15.7 4'), P('M12 9v11'), C(13.9, 14, 0.6, 'cur')],
  kebaya: [P('M9.2 3.8h5.6l-1.1 4.4L18 20H6l4.3-11.8z'), P('M10.3 8.2h3.4'), P('M8.6 14.5h6.8')],
  gamis: [P('M9 3.8h6l3 3-2 2.2V20H8V9L6 6.8z'), P('M12 3.8V9')],
  sepatu: [P('M3 15.5V11l4-1 3.2 3 6 1.4A3 3 0 0 1 19 17.3V18H3z'), P('M3 16.4h16'), P('M10.4 13.4l1.2-1.2M12.6 13.9l1.1-1.2')],
  tas: [P('M7 9a5 5 0 0 1 10 0v10a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1z'), P('M10 5V3.6h4V5'), R(9.2, 12.5, 5.6, 4, 1)],
  boneka: [C(12, 14, 5.5), C(7.6, 7.6, 2.3), C(16.4, 7.6, 2.3), C(12, 15.6, 1.6), C(10.1, 12.6, 0.6, 'cur'), C(13.9, 12.6, 0.6, 'cur')],
  kaos: [P('M8.5 4 4 6.5l1.6 3.8 2-1V20h8.8V9.3l2 1 1.6-3.8L15.5 4c-.6 1.3-1.9 2.2-3.5 2.2S9.1 5.3 8.5 4z')],
  timbang: [R(4, 13, 16, 6, 2), P('M8 13V9.5a4 4 0 0 1 8 0V13'), P('M12 9.5v1.5')],
  komplain: [P('M5 5.5h14a1.5 1.5 0 0 1 1.5 1.5v8.5A1.5 1.5 0 0 1 19 17h-7l-4.5 3.5V17H5a1.5 1.5 0 0 1-1.5-1.5V7A1.5 1.5 0 0 1 5 5.5z'), P('M12 8.5v3.5'), C(12, 14.4, 0.8, 'cur')],
  wa: [P('M4.5 19.5l1.1-3.6A7.8 7.8 0 1 1 8.8 19z'), P('M9.2 8.8c.3 2.6 2.4 4.9 5 5.6l1.3-1.3-1.8-1-.9.8c-.9-.4-1.9-1.4-2.3-2.3l.8-.9-1-1.8z')],
} satisfies Record<string, Bentuk[]>;

export type NamaIkon = keyof typeof IKON;

/** Ilustrasi kurir (viewBox 64×64): sosok berhelm dengan visor gelap, tanpa wajah. */
export const KURIR_GAMBAR: Bentuk[] = [
  { t: 'circle', cx: 32, cy: 32, r: 32, isi: '#EAE3FC' },
  { t: 'path', d: 'M12 64c0-12.5 9-21 20-21s20 8.5 20 21z', isi: '#FFD24A' },
  { t: 'path', d: 'M26 43.6 32 52l6-8.4', garis: '#21163F', tebal: 2 },
  { t: 'rect', x: 40, y: 50, w: 13, h: 10, rx: 2.5, isi: '#5B2FD0' },
  { t: 'path', d: 'M43 50v-2.5a3.5 3.5 0 0 1 7 0V50', garis: '#5B2FD0', tebal: 2 },
  { t: 'circle', cx: 32, cy: 27, r: 14, isi: '#5B2FD0' },
  { t: 'rect', x: 21, y: 23, w: 22, h: 10, rx: 5, isi: '#21163F' },
  { t: 'path', d: 'M25.5 26.2h6.5', garis: '#FFFFFF', tebal: 2 },
  { t: 'path', d: 'M20 18.5c3.4-4.4 7.4-6 12-6', garis: '#CDBEF6', tebal: 2 },
];

/** Logo: gugus busa di atas label cucian (viewBox 64×64). */
export const LOGO: Bentuk[] = [
  { t: 'rect', x: 0, y: 0, w: 64, h: 64, rx: 18, isi: '#5B2FD0' },
  { t: 'circle', cx: 26, cy: 37, r: 15, isi: '#FFFFFF' },
  { t: 'circle', cx: 44.5, cy: 22, r: 9, isi: '#FFFFFF' },
  { t: 'circle', cx: 47, cy: 44, r: 5.5, isi: '#FFD24A' },
  { t: 'path', d: 'M17.5 33a9 9 0 0 1 7-6.5', garis: '#CDBEF6', tebal: 3.5 },
  { t: 'circle', cx: 26, cy: 37, r: 4.5, isi: '#5B2FD0' },
];


/** Tas cucian ungu bertiket gantung + gelembung (viewBox 120×96), untuk ubin & keadaan kosong. */
export const TAS_CUCIAN: Bentuk[] = [
  { t: 'circle', cx: 92, cy: 22, r: 10, garis: '#B9AEDA', tebal: 2.5 },
  { t: 'circle', cx: 104, cy: 44, r: 5, garis: '#B9AEDA', tebal: 2 },
  { t: 'circle', cx: 18, cy: 30, r: 6, garis: '#B9AEDA', tebal: 2 },
  { t: 'path', d: 'M30 40c0-8 6-12 12-12h28c6 0 12 4 12 12l6 40c1 6-3 10-9 10H33c-6 0-10-4-9-10z', isi: '#5B2FD0' },
  { t: 'path', d: 'M36 34c6 5 34 5 40 0', garis: '#3A1C8F', tebal: 3 },
  { t: 'path', d: 'M44 30c0-9 24-9 24 0', garis: '#3A1C8F', tebal: 3 },
  { t: 'circle', cx: 46, cy: 58, r: 9, isi: '#FFFFFF' },
  { t: 'circle', cx: 60, cy: 66, r: 6, isi: '#FFFFFF' },
  { t: 'circle', cx: 50, cy: 74, r: 4, isi: '#CDBEF6' },
  { t: 'path', d: 'M76 40l10 10', garis: '#21163F', tebal: 1.6 },
  { t: 'path', d: 'M84 47h16a3 3 0 0 1 3 3v18a3 3 0 0 1-3 3H84a3 3 0 0 1-3-3V50a3 3 0 0 1 3-3z', isi: '#FFD24A' },
  { t: 'circle', cx: 88, cy: 52, r: 2, isi: '#F4F0FB' },
  { t: 'path', d: 'M86 60h12M86 65h8', garis: '#21163F', tebal: 1.8 },
];

/** Jendela mesin (viewBox 120×120): cincin dasar; busur progres & simbol digambar terpisah. */
export function busurProgres(persen: number, r = 52, cx = 60, cy = 60): string {
  const p = Math.max(0.001, Math.min(0.999, persen));
  const sudut = p * Math.PI * 2 - Math.PI / 2;
  const x = cx + r * Math.cos(sudut);
  const y = cy + r * Math.sin(sudut);
  return `M${cx} ${cy - r} A${r} ${r} 0 ${p > 0.5 ? 1 : 0} 1 ${x.toFixed(2)} ${y.toFixed(2)}`;
}

/** Timbangan cucian dengan tas di atasnya (viewBox 120×108), untuk kepala halaman Harga. */
export const TIMBANGAN_BESAR: Bentuk[] = [
  { t: 'circle', cx: 100, cy: 20, r: 7, garis: '#E0B83A', tebal: 2 },
  { t: 'circle', cx: 14, cy: 40, r: 5, garis: '#E0B83A', tebal: 2 },
  { t: 'path', d: 'M22 80h76l6 18H16z', isi: '#21163F' },
  { t: 'rect', x: 40, y: 84, w: 40, h: 9, rx: 3, isi: '#FFD24A' },
  { t: 'path', d: 'M50 88.5h6M60 88.5h2', garis: '#21163F', tebal: 2 },
  { t: 'path', d: 'M28 80V72h64v8', isi: '#3A1C8F' },
  { t: 'path', d: 'M38 44c0-6 4-9 9-9h26c5 0 9 3 9 9l4 28H34z', isi: '#5B2FD0' },
  { t: 'path', d: 'M50 35c0-8 20-8 20 0', garis: '#3A1C8F', tebal: 3 },
  { t: 'circle', cx: 52, cy: 54, r: 7, isi: '#FFFFFF' },
  { t: 'circle', cx: 64, cy: 61, r: 4.5, isi: '#FFFFFF' },
  { t: 'path', d: 'M82 44l8 8', garis: '#21163F', tebal: 1.6 },
  { t: 'path', d: 'M88 50h12a2.5 2.5 0 0 1 2.5 2.5v13A2.5 2.5 0 0 1 100 68H88a2.5 2.5 0 0 1-2.5-2.5v-13A2.5 2.5 0 0 1 88 50z', isi: '#FFFFFF', garis: '#21163F', tebal: 1.4 },
  { t: 'path', d: 'M89.5 58h9M89.5 62h6', garis: '#21163F', tebal: 1.6 },
];
