import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Image, TextInput, TouchableOpacity,
  Alert, ImageBackground, ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import { auth } from '../config/firebase-config';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

export default function RegisterScreen() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleRegister = async () => {
    if (password !== confirmPass) {
      Alert.alert('รหัสผ่านไม่ตรงกัน');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });

      Alert.alert('สมัครสมาชิกสำเร็จ!', `ยินดีต้อนรับ ${name}`);
      router.replace({ pathname: '/contract', params: { password } });  // ✅ ส่ง password ไปด้วย
    } catch (error) {
      Alert.alert('เกิดข้อผิดพลาด', error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#A3CC01' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ImageBackground
        source={require('../assets/bg.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.container}>
            <Image source={require('../assets/logo2.png')} style={styles.logo} />
            <View style={styles.card}>
              <Text style={styles.title}>สมัครสมาชิก</Text>

              <View style={styles.inputWrapper}>
                <Image source={require('../assets/user.png')} style={styles.icon} />
                <TextInput
                  placeholder="ชื่อ"
                  placeholderTextColor="#000"
                  value={name}
                  onChangeText={setName}
                  style={styles.input}
                />
              </View>

              <View style={styles.inputWrapper}>
                <Image source={require('../assets/email.png')} style={styles.icon} />
                <TextInput
                  placeholder="Email"
                  placeholderTextColor="#000"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.input}
                />
              </View>

              <View style={styles.inputWrapper}>
                <Image source={require('../assets/lock.png')} style={styles.iconSmall} />
                <TextInput
                  placeholder="รหัสผ่าน"
                  placeholderTextColor="#000"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPass}
                  style={styles.input}
                />
                <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                  <Image source={require('../assets/eye.png')} style={styles.eye} />
                </TouchableOpacity>
              </View>

              <View style={styles.inputWrapper}>
                <Image source={require('../assets/lock.png')} style={styles.iconSmall} />
                <TextInput
                  placeholder="ยืนยันรหัสผ่าน"
                  placeholderTextColor="#000"
                  value={confirmPass}
                  onChangeText={setConfirmPass}
                  secureTextEntry={!showConfirm}
                  style={styles.input}
                />
                <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                  <Image source={require('../assets/eye.png')} style={styles.eye} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.submitBtn} onPress={handleRegister}>
                <Text style={styles.submitText}>ยืนยัน</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

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
    backgroundColor: '#fff',
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
    color: '#000',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#A3CC01',
    borderRadius: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    marginBottom: 12,
    height: 50,
    width: '100%',
  },
  icon: {
    width: 24,
    height: 24,
  },
  iconSmall: {
    width: 20,
    height: 20,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#000',
  },
  eye: {
    width: 20,
    height: 20,
    tintColor: '#000',
  },
  submitBtn: {
    backgroundColor: '#A3CC01',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 15,
    width: '100%',
  },
  submitText: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
});
