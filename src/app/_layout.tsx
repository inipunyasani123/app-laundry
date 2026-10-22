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
      </View>
    </PenyediaBusa>
  );
}
