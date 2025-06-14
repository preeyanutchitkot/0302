import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  ImageBackground,
  ScrollView,
} from 'react-native';
import { auth, db } from '../config/firebase-config';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';

const LoginScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // ✅ state สำหรับ toggle

  const handleLogin = async () => {
    const trimmedInput = email.trim();
    const trimmedPassword = password.trim();
    let loginEmail = trimmedInput;

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedInput);
    if (!isEmail) {
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('name', '==', trimmedInput));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          loginEmail = userDoc.data().email;
        } else {
          Alert.alert('ไม่พบชื่อผู้ใช้', 'กรุณาตรวจสอบชื่อผู้ใช้');
          return;
        }
      } catch (error) {
        console.error('ค้นหาชื่อผู้ใช้ผิดพลาด:', error);
        Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถค้นหาชื่อผู้ใช้ได้');
        return;
      }
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, loginEmail, trimmedPassword);
      Alert.alert('เข้าสู่ระบบสำเร็จ!', `Welcome ${userCredential.user.email}`);
      router.replace('/home'); 
    } catch (error) {
      Alert.alert('เข้าสู่ระบบล้มเหลว', error.message);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#A3CC01' }}>
      <ImageBackground
        source={require('../assets/bg.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.container}>
            <Image source={require('../assets/logo2.png')} style={styles.logo} resizeMode="contain" />
  
            <View style={styles.card}>
              <Text style={styles.title}>เข้าสู่ระบบ</Text>
  
              <View style={styles.inputWrapper}>
                <Image source={require('../assets/user.png')} style={styles.iconLeft} />
                <TextInput
                  style={styles.input}
                  placeholder="ชื่อผู้ใช้หรืออีเมล"
                  placeholderTextColor="#888"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                />
              </View>
  
              <View style={styles.inputWrapper}>
                <Image source={require('../assets/lock.png')} style={styles.iconLeftSmall} />
                <TextInput
                  style={styles.input}
                  placeholder="รหัสผ่าน"
                  placeholderTextColor="#888"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Image
                    source={require('../assets/eye.png')}
                    style={[styles.iconRight, showPassword && { tintColor: '#000' }]}
                  />
                </TouchableOpacity>
              </View>
  
              <TouchableOpacity onPress={() => router.push('/forgotpassword')}>
                <Text style={styles.forgot}>เปลี่ยนรหัสผ่าน</Text>
              </TouchableOpacity>
  
              <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                <Text style={styles.loginText}>เข้าสู่ระบบ</Text>
              </TouchableOpacity>
  
              <TouchableOpacity style={styles.signupButton} onPress={() => router.push('/register')}>
                <Text style={styles.signupText}>สมัครสมาชิก</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
  
};

export default LoginScreen;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 30,
  },
  container: {
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 10,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#A3CC01',
    borderRadius: 10,
    width: '100%',
    height: 50,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
  },
  iconLeft: {
    width: 30,
    height: 30,
  },
  iconLeftSmall: {
    width: 25,
    height: 25,
  },
  iconRight: {
    width: 22,
    height: 22,
    tintColor: '#888',
  },
  forgot: {
    alignSelf: 'flex-end',
    fontSize: 14,
    color: '#000',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  loginButton: {
    backgroundColor: '#A3CC01',
    paddingVertical: 12,
    borderRadius: 10,
    width: '100%',
    marginBottom: 10,
  },
  loginText: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signupButton: {
    backgroundColor: '#fff',
    borderColor: '#A3CC01',
    borderWidth: 2,
    paddingVertical: 12,
    borderRadius: 10,
    width: '100%',
  },
  signupText: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
