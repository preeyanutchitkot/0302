import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, Image, StyleSheet } from 'react-native';

export default function IndexRedirect() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/login'); // เปลี่ยนหน้าไป login หลัง 3 วิ
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Image source={require('../assets/logo1.png')} style={styles.logo} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e6f9a7', // สีเขียวอ่อนตามภาพ
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
});
