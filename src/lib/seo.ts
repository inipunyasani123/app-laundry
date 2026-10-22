import type { Metadata } from 'expo-router/server';

export const ASAL = 'https://app-laundry.pintuweb.id';
const OG = `${ASAL}/og.jpg`;
const OG_ALT = 'Busa Ungu, demo aplikasi pelanggan laundry: tiket cucian kuning dan label tahap cuci';

/** Metadata statis per rute (SDK 58: generateMetadata, bukan <Head>). */
export function meta(path: string, judul: string, deskripsi: string, opsi: { indeks?: boolean } = {}): Metadata {
  const url = `${ASAL}${path === '/' ? '/' : path}`;
  const indeks = opsi.indeks ?? true;
  return {
    title: judul,
    description: deskripsi,
    applicationName: 'Busa Ungu',
    authors: { name: 'PintuWeb', url: 'https://www.pintuweb.id' },
    creator: 'PintuWeb',
    publisher: 'PintuWeb',
    alternates: { canonical: url },
    robots: indeks
      ? { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } }
      : { index: false, follow: true },
    openGraph: {
      type: 'website',
      locale: 'id_ID',
      siteName: 'Busa Ungu · Demo PintuWeb',
      url,
      title: judul,
      description: deskripsi,
      images: [{ url: OG, width: 1200, height: 630, alt: OG_ALT, type: 'image/jpeg' }],
    },
    twitter: { card: 'summary_large_image', title: judul, description: deskripsi, images: [{ url: OG, alt: OG_ALT }] },
  };
}
