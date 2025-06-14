import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/home');
    }, 0); // 3 วินาที

    return () => clearTimeout(timer); // เคลียร์เวลาเมื่อ component หาย
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>ยินดีต้อนรับสู่หน้าหลัก <Text style={{ fontWeight: 'bold' }}>Home!</Text></Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 20, fontWeight: '500' },
});
