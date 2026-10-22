import Svg, { Circle, Path, Rect } from 'react-native-svg';
import type { Bentuk } from './ikon-data';

export interface PropsGambar {
  bentuk: Bentuk[];
  ukuran?: number;
  lebar?: number;
  tinggi?: number;
  kotak?: number;
  warna?: string;
  tebal?: number;
  /** Regang selebar wadah (untuk tepi gerigi). */
  regang?: boolean;
}

/** Native: react-native-svg. */
export default function Gambar({ bentuk, ukuran = 24, lebar, tinggi, kotak = 24, warna = '#21163F', tebal = 1.8, regang }: PropsGambar) {
  const w = lebar ?? ukuran;
  const h = tinggi ?? ukuran;
  return (
    <Svg width={regang ? '100%' : w} height={h} preserveAspectRatio={regang ? 'none' : undefined} viewBox={`0 0 ${kotak} ${lebar && tinggi ? (kotak * tinggi) / lebar : kotak}`} fill="none" accessible={false}>
      {bentuk.map((b, i) => {
        const fill = b.isi === 'cur' ? warna : b.isi ?? 'none';
        const stroke = b.garis ?? (b.isi && b.isi !== 'cur' ? 'none' : warna);
        const common = { fill, stroke, strokeWidth: b.tebal ?? tebal, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
        if (b.t === 'path') return <Path key={i} d={b.d} {...common} />;
        if (b.t === 'circle') return <Circle key={i} cx={b.cx} cy={b.cy} r={b.r} {...common} />;
        return <Rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} rx={b.rx} {...common} />;
      })}
    </Svg>
  );
}
