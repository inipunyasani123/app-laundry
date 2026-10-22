import { useServerDocumentContext } from 'expo-router/html';
import qrcode from 'qrcode-generator';
import { Children, Fragment, isValidElement, type PropsWithChildren, type ReactNode } from 'react';
import { IKON, LOGO, type Bentuk } from '@/components/ikon-data';

const ASAL = 'https://app-laundry.pintuweb.id';
const KONTAK = 'https://www.pintuweb.id/kontak?demo=laundry';

/** QR dibuat saat build (Node), tanpa layanan luar. */
function qrPath(teks: string) {
  const qr = qrcode(0, 'M');
  qr.addData(teks);
  qr.make();
  const n = qr.getModuleCount();
  let d = '';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`;
  return { d, n };
}

function Svg({ bentuk, ukuran = 22, kotak = 24, warna = 'currentColor' }: { bentuk: Bentuk[]; ukuran?: number; kotak?: number; warna?: string }) {
  return (
    <svg width={ukuran} height={ukuran} viewBox={`0 0 ${kotak} ${kotak}`} fill="none" stroke={warna} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {bentuk.map((b, i) => {
        const fill = b.isi === 'cur' ? warna : b.isi ?? 'none';
        const stroke = b.garis ?? (b.isi && b.isi !== 'cur' ? 'none' : warna);
        const sw = b.tebal ?? 1.8;
        if (b.t === 'path') return <path key={i} d={b.d} fill={fill} stroke={stroke} strokeWidth={sw} />;
        if (b.t === 'circle') return <circle key={i} cx={b.cx} cy={b.cy} r={b.r} fill={fill} stroke={stroke} strokeWidth={sw} />;
        return <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} rx={b.rx} fill={fill} stroke={stroke} strokeWidth={sw} />;
      })}
    </svg>
  );
}

/**
 * Expo menaruh <link rel="preload" as="script"> untuk semua bundel di <head>. Skrip tetap dimuat lewat
 * <script defer> di akhir body; preload prioritas tinggi itu hanya berebut jaringan dengan HTML & font.
 */
function tanpaPreloadSkrip(nodes: ReactNode): ReactNode {
  return Children.map(nodes, (n) => {
    if (isValidElement(n)) {
      const p = n.props as { rel?: string; as?: string; children?: ReactNode };
      if (n.type === 'link' && p.rel === 'preload' && p.as === 'script') return null;
      if (n.type === Fragment) return tanpaPreloadSkrip(p.children);
    }
    return n;
  });
}

/**
 * Bundel JS baru diminta setelah frame pertama tergambar: HTML statis (yang sudah lengkap) tampil dulu,
 * baru kemudian React menghidrasi. Urutan eksekusi tetap dijaga dengan async = false.
 */
function pisahSkrip(nodes: ReactNode) {
  const src: string[] = [];
  const sisa = Children.map(nodes, function saring(n): ReactNode {
    if (isValidElement(n)) {
      const p = n.props as { src?: string; children?: ReactNode };
      if (n.type === 'script' && p.src) {
        src.push(p.src);
        return null;
      }
      if (n.type === Fragment) return Children.map(p.children, saring);
    }
    return n;
  });
  const muat = `(function(){var s=${JSON.stringify(src)};function m(){s.forEach(function(u){var e=document.createElement('script');e.src=u;e.async=false;document.body.appendChild(e)})}if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',function(){requestAnimationFrame(function(){setTimeout(m,0)})})}else{requestAnimationFrame(function(){setTimeout(m,0)})}})();`;
  return { sisa, muat, src };
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Busa Ungu: aplikasi pelanggan laundry (demo)',
  alternateName: 'Busa Ungu',
  url: `${ASAL}/`,
  description:
    'Demo aplikasi pelanggan untuk usaha laundry fiktif: status cucian per tahap dengan perkiraan selesai WIB, pesan jemput-antar, nota digital, pembayaran simulasi, poin dan promo.',
  applicationCategory: 'LifestyleApplication',
  operatingSystem: 'Android, iOS, Web',
  inLanguage: 'id-ID',
  isAccessibleForFree: true,
  image: `${ASAL}/og.jpg`,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'IDR' },
  creator: { '@type': 'Organization', name: 'PintuWeb', url: 'https://www.pintuweb.id' },
};

const FITUR: { ikon: keyof typeof IKON; judul: string; isi: string }[] = [
  { ikon: 'bak', judul: 'Status per tahap', isi: 'Diterima sampai diantar, lengkap dengan perkiraan selesai WIB.' },
  { ikon: 'jemput', judul: 'Jemput-antar', isi: 'Pilih slot jam, catat noda dan pewangi sebelum kurir datang.' },
  { ikon: 'nota', judul: 'Nota & bayar', isi: 'Nota digital berisi berat, item, total, lalu bayar (simulasi).' },
  { ikon: 'busa', judul: 'Poin & promo', isi: 'Poin tiap transaksi, voucher, kartu cap, dan notifikasi.' },
];

const CSS = `
@font-face{font-family:'Calistoga-Regular';font-style:normal;font-weight:400;font-display:swap;src:url(/fonts/calistoga-latin.woff2) format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
:root{--latar:#F4F0FB;--tinta:#21163F;--redup:#5A5272;--ungu:#5B2FD0;--unguTua:#3A1C8F;--kuning:#FFD24A;--garis:#DED6F1}
html,body{height:100%;margin:0}
body{background:var(--latar);color:var(--tinta);display:flex;flex-direction:column;min-height:100%;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;-webkit-font-smoothing:antialiased;-webkit-text-size-adjust:100%;overscroll-behavior-y:none}
.panggung{flex:1;display:flex;min-height:0}
.ponsel{flex:1;display:flex;min-height:0;min-width:0}
.layar{flex:1;display:flex;flex-direction:column;min-height:0;min-width:0;position:relative;background:var(--latar);padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom);transform:translateZ(0)}
#root{display:flex;flex:1;flex-direction:column;min-height:0}
#root>div{flex:1;min-height:0}
.panel{display:none}
.lompat{position:absolute;left:12px;top:-60px;z-index:99;background:var(--tinta);color:#fff;padding:10px 16px;border-radius:999px;font-weight:700;text-decoration:none}
.lompat:focus{top:12px}
:focus-visible{outline:3px solid #5B2FD0!important;outline-offset:2px}
.bilah-demo :focus-visible{outline-color:#FFD24A!important}
input,textarea{font:inherit}
@media (min-width:768px){
  html,body{height:auto;min-height:100%}
  body{background-color:#EDE7FA;background-image:radial-gradient(circle at 12% 18%,rgba(91,47,208,.10) 0 90px,transparent 91px),radial-gradient(circle at 12% 18%,transparent 0 118px,rgba(91,47,208,.09) 119px 121px,transparent 122px),radial-gradient(circle at 88% 82%,rgba(255,210,74,.28) 0 70px,transparent 71px),radial-gradient(circle at 92% 12%,transparent 0 46px,rgba(91,47,208,.12) 47px 49px,transparent 50px),radial-gradient(circle at 70% 96%,transparent 0 30px,rgba(91,47,208,.12) 31px 33px,transparent 34px)}
  .panggung{align-items:center;justify-content:center;gap:56px;padding:40px 32px;min-height:calc(100vh - 46px);box-sizing:border-box}
  .panel{display:flex;flex-direction:column;gap:18px;max-width:360px;flex:0 1 360px}
  .ponsel{flex:0 0 auto;width:390px;height:min(844px,calc(100vh - 110px));min-height:600px;padding:11px;border-radius:58px;background:#21163F;box-shadow:0 0 0 2px #3A2B66 inset,0 40px 80px -30px rgba(33,22,63,.55),0 18px 36px -18px rgba(33,22,63,.4);box-sizing:border-box;position:relative}
  .ponsel::before{content:"";position:absolute;right:-4px;top:150px;width:4px;height:70px;border-radius:0 3px 3px 0;background:#2E2156}
  .layar{border-radius:47px;overflow:hidden;padding-top:0;padding-bottom:0}
}
@media (min-width:768px) and (max-width:900px){.panggung{gap:28px;padding:32px 20px}.panel{flex-basis:300px}}
.p-merek{display:flex;align-items:center;gap:12px}
.p-nama{font-family:'Calistoga-Regular',Georgia,serif;font-size:34px;line-height:1.05;margin:0;color:var(--unguTua)}
.p-sub{margin:4px 0 0;font-size:14px;color:var(--redup)}
.p-teks{margin:0;font-size:16px;line-height:1.55}
.p-fitur{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:10px}
.p-fitur li{background:#fff;border:1px solid var(--garis);border-radius:18px;padding:12px;display:flex;flex-direction:column;gap:6px}
.p-fitur .ik{width:36px;height:36px;border-radius:50%;background:#EAE3FC;color:var(--unguTua);display:flex;align-items:center;justify-content:center}
.p-fitur b{font-size:14px}
.p-fitur span{font-size:13px;line-height:1.4;color:var(--redup)}
.p-qr{display:flex;gap:14px;align-items:center;background:var(--kuning);border-radius:20px;padding:12px 14px}
.p-qr svg{background:#fff;border-radius:10px;padding:6px;flex-shrink:0}
.p-qr p{margin:0;font-size:14px;line-height:1.45}
.p-qr small{display:block;font-family:ui-monospace,Menlo,monospace;font-size:12px;margin-top:4px}
.p-cta{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:50px;padding:0 22px;border-radius:999px;background:var(--ungu);color:#fff;font-weight:700;font-size:16px;text-decoration:none}
.p-cta:hover{background:var(--unguTua)}
.p-kecil{margin:0;font-size:13px;line-height:1.5;color:var(--redup)}
.bilah-demo{display:block;margin:0;padding:12px 16px;background:#0f1b33;color:#dfe6f3;font:400 13px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;text-align:center}
.bilah-demo a{color:#fff;font-weight:600;text-decoration:underline;text-underline-offset:3px}
@media (display-mode:standalone){.bilah-demo{padding-bottom:calc(12px + env(safe-area-inset-bottom))}}
`;

export default function Root({ children }: PropsWithChildren) {
  const { headNodes, bodyNodes, htmlAttributes, bodyAttributes } = useServerDocumentContext();
  const qr = qrPath(`${ASAL}/`);
  const skrip = pisahSkrip(bodyNodes);
  return (
    <html lang="id" {...htmlAttributes}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#5B2FD0" />
        <meta name="color-scheme" content="light" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Busa Ungu" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/ikon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="preload" href="/fonts/calistoga-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        {tanpaPreloadSkrip(headNodes)}
      </head>
      <body {...bodyAttributes}>
        <a className="lompat" href="#isi">
          Langsung ke aplikasi
        </a>
        <div className="panggung">
          <aside className="panel" aria-label="Tentang demo Busa Ungu">
            <div className="p-merek">
              <Svg bentuk={LOGO} kotak={64} ukuran={56} />
              <div>
                <p className="p-nama">Busa Ungu</p>
                <p className="p-sub">Demo aplikasi pelanggan laundry · Android, iOS, web</p>
              </div>
            </div>
            <p className="p-teks">
              Pelanggan memantau cucian dari tiket kuning: ditimbang, dicuci, dikeringkan, disetrika, sampai diantar. Coba langsung di ponsel sebelah.
            </p>
            <ul className="p-fitur">
              {FITUR.map((f) => (
                <li key={f.judul}>
                  <span className="ik">
                    <Svg bentuk={IKON[f.ikon]} ukuran={20} />
                  </span>
                  <b>{f.judul}</b>
                  <span>{f.isi}</span>
                </li>
              ))}
            </ul>
            <div className="p-qr">
              <svg width="96" height="96" viewBox={`-1 -1 ${qr.n + 2} ${qr.n + 2}`} role="img" aria-label={`Kode QR menuju ${ASAL}`} shapeRendering="crispEdges">
                <path d={qr.d} fill="#21163F" />
              </svg>
              <p>
                <b>Buka di HP</b>
                <br />
                Pindai kode ini, lalu pasang ke layar utama seperti aplikasi.
                <small>app-laundry.pintuweb.id</small>
              </p>
            </div>
            <a className="p-cta" href={KONTAK}>
              Pesan aplikasi seperti ini
              <Svg bentuk={IKON.panah} ukuran={18} />
            </a>
            <p className="p-kecil">
              Dibangun dengan React Native + Expo: satu kode untuk Android, iOS, dan web. Usaha, nama, dan harganya rekaan; data tersimpan di perangkatmu saja.
            </p>
          </aside>
          <div className="ponsel">
            <div className="layar">{children}</div>
          </div>
        </div>
        {skrip.sisa}
        <aside className="bilah-demo" aria-label="Tentang situs demo ini">
          Situs demo buatan PintuWeb — nama dan isinya rekaan. <a href={KONTAK}>Buat yang seperti ini →</a>
        </aside>
        <script dangerouslySetInnerHTML={{ __html: skrip.muat }} />
      </body>
    </html>
  );
}
