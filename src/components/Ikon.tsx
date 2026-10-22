import Gambar from './Gambar';
import { IKON, type NamaIkon } from './ikon-data';

export default function Ikon({ nama, ukuran = 22, warna = '#21163F', tebal = 1.8 }: { nama: NamaIkon; ukuran?: number; warna?: string; tebal?: number }) {
  return <Gambar bentuk={IKON[nama]} ukuran={ukuran} warna={warna} tebal={tebal} />;
}
