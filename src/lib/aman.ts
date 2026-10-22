import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Native: jarak aman dari notch & bilah gestur. */
export function useJarakAman() {
  const i = useSafeAreaInsets();
  return { atas: i.top, bawah: i.bottom };
}
