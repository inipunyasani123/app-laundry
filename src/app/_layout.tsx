import { Stack, usePathname } from 'expo-router';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform, View } from 'react-native';
import { TabBawah, Toast } from '@/components/kerangka';
import { JUDUL } from '@/lib/seo';
import { PenyediaBusa } from '@/lib/store';
import { warna } from '@/lib/tema';

/** Web: judul tab ikut berganti saat pindah halaman di dalam aplikasi (HTML statis sudah benar sejak awal). */
function JudulTab() {
  const path = usePathname();
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const judul = JUDUL[path] ?? JUDUL['/404'];
    if (document.title !== judul) document.title = judul;
  }, [path]);
  return null;
}

export default function TataLetakAkar() {
  return (
    <PenyediaBusa>
      <StatusBar style="dark" />
      <JudulTab />
      <View style={{ flex: 1, backgroundColor: warna.latar, minHeight: 0 }}>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: warna.latar }, animation: 'slide_from_right' }} />
        <TabBawah />
        <Toast />
        {/* Wadah lembar bawah (web: portal di dalam bingkai ponsel). */}
        <View nativeID="lapis-lembar" pointerEvents="box-none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 80 }} />
      </View>
    </PenyediaBusa>
  );
}
