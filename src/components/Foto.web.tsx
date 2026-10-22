/** Web: <img> biasa dari /public supaya bisa lazy-load & object-fit, tanpa div latar RN. */
const SUMBER = {
  jepit: { src: '/images/jepit-jemuran.webp', w: 720, h: 338 },
};

export default function Foto({ nama, prioritas }: { nama: keyof typeof SUMBER; prioritas?: boolean }) {
  const f = SUMBER[nama];
  return (
    <img
      src={f.src}
      width={f.w}
      height={f.h}
      alt=""
      loading={prioritas ? 'eager' : 'lazy'}
      decoding="async"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
    />
  );
}
