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

/** Web: <svg> DOM langsung, tanpa react-native-svg (bundel lebih ramping). */
export default function Gambar({ bentuk, ukuran = 24, lebar, tinggi, kotak = 24, warna = 'currentColor', tebal = 1.8, regang }: PropsGambar) {
  const w = lebar ?? ukuran;
  const h = tinggi ?? ukuran;
  return (
    <svg
      width={regang ? '100%' : w}
      height={h}
      preserveAspectRatio={regang ? 'none' : undefined}
      viewBox={`0 0 ${kotak} ${lebar && tinggi ? (kotak * tinggi) / lebar : kotak}`}
      fill="none"
      stroke={warna}
      strokeWidth={tebal}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      style={{ display: 'block', flexShrink: 0 }}
    >
      {bentuk.map((b, i) => {
        const fill = b.isi === 'cur' ? warna : b.isi ?? 'none';
        const stroke = b.garis ?? (b.isi && b.isi !== 'cur' ? 'none' : warna);
        const sw = b.tebal ?? tebal;
        if (b.t === 'path') return <path key={i} d={b.d} fill={fill} stroke={stroke} strokeWidth={sw} />;
        if (b.t === 'circle') return <circle key={i} cx={b.cx} cy={b.cy} r={b.r} fill={fill} stroke={stroke} strokeWidth={sw} />;
        return <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} rx={b.rx} fill={fill} stroke={stroke} strokeWidth={sw} />;
      })}
    </svg>
  );
}
