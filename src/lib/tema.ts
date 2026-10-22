import { Platform } from 'react-native';

/** Palet "Busa Ungu": kabut lilac, tinta terong, ungu deterjen, kuning label cucian. */
export const warna = {
  latar: '#F4F0FB',
  kartu: '#FFFFFF',
  tinta: '#21163F',
  redup: '#5A5272',
  garis: '#DED6F1',
  ungu: '#5B2FD0',
  unguTua: '#3A1C8F',
  unguMuda: '#EAE3FC',
  lavender: '#CDBEF6',
  kuning: '#FFD24A',
  kuningMuda: '#FFF3C4',
  hijau: '#0B6B4E',
  hijauMuda: '#D9F2E7',
  koral: '#A8243C',
  koralMuda: '#FCE3E7',
  putih: '#FFFFFF',
};

/** Satu nama keluarga di semua platform: web lewat @font-face, native lewat plugin expo-font. */
export const hurufJudul = 'Calistoga-Regular';

export const hurufAngka = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: 'ui-monospace, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
});

export const sudut = { kecil: 10, sedang: 16, besar: 22, bulat: 999 };
