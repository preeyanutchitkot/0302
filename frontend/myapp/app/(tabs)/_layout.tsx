// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="home" options={{ title: 'หน้าหลัก' }} />
      <Tabs.Screen name="explore" options={{ title: 'สำรวจ' }} />
    </Tabs>
  );
}
