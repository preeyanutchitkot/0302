import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
  ImageBackground,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../config/firebase-config';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('กรุณากรอกอีเมล');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert('ส่งอีเมลสำเร็จ', 'โปรดตรวจสอบกล่องจดหมายของคุณ');
      router.replace('/login');
    } catch (error) {
      Alert.alert('เกิดข้อผิดพลาด', error.message);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/background.png')}
      style={styles.background}
      resizeMode="cover"
      imageStyle={{ backgroundColor: '#A3CC01' }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          <Image source={require('../assets/logo2.png')} style={styles.logo} />
          <View style={styles.whiteBox}>
            <Text style={styles.header}>เปลี่ยนรหัสผ่าน</Text>
            <Text style={styles.subtext}>
            กรุณากรอกอีเมล เพื่อรับรหัสยืนยันการเเก้ไขรหัสผ่าน
            </Text>

            <View style={styles.inputContainer}>
              <Image source={require('../assets/email.png')} style={styles.icon} />
              <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
            </View>

            <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
              <Text style={styles.buttonText}>ยืนยัน</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
    flexGrow: 1,
    
  },
  logo: { width: 120, height: 120, marginBottom: 10, alignSelf: 'center' },
  whiteBox: {
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 25,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 8, color: '#000' },
  subtext: { fontSize: 14, textAlign: 'center', color: '#444', marginBottom: 20 },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderColor: '#a3cc01',
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
  },
  icon: { width: 24, height: 24, marginRight: 8 },
  input: { flex: 1, fontSize: 16 },
  button: {
    backgroundColor: '#a3cc01',
    borderRadius: 10,
    paddingVertical: 12,
    width: '100%',
    marginTop: 10,
  },
  buttonText: { color: '#000', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
 
});