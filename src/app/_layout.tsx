import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { TabBawah, Toast } from '@/components/kerangka';
import { PenyediaBusa } from '@/lib/store';
import { warna } from '@/lib/tema';

export default function TataLetakAkar() {
  return (
    <PenyediaBusa>
      <StatusBar style="dark" />
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
