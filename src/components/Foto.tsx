import { Image, StyleSheet } from 'react-native';

const SUMBER = {
  jepit: require('../../assets/images/jepit-jemuran.webp'),
};

/** Native: foto dari bundel aset. Foto dekoratif (alt kosong). */
export default function Foto({ nama }: { nama: keyof typeof SUMBER; prioritas?: boolean }) {
  return <Image source={SUMBER[nama]} style={StyleSheet.absoluteFill} resizeMode="cover" accessibilityIgnoresInvertColors />;
}
