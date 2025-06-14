import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Image, TextInput, TouchableOpacity,
  ScrollView, ImageBackground, KeyboardAvoidingView, Platform
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { auth, db } from '../config/firebase-config';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';

function ContractScreen() {
  const router = useRouter();
  const { password: passedPassword } = useLocalSearchParams();

  const [facebookName, setFacebookName] = useState('');
  const [facebookLink, setFacebookLink] = useState('');
  const [lineId, setLineId] = useState('');
  const [lineLink, setLineLink] = useState('');
  const [igName, setIgName] = useState('');
  const [igLink, setIgLink] = useState('');
  const [phone, setPhone] = useState('');
  const [backupPhone, setBackupPhone] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

const handleSubmit = async () => {
  const filled =
    facebookName.trim() || facebookLink.trim() || lineId.trim() || lineLink.trim() ||
    igName.trim() || igLink.trim() || phone.trim() || backupPhone.trim();

  if (!filled) {
    setErrorMessage('⚠️ กรุณากรอกข้อมูลอย่างน้อย 1 ช่องก่อนกดยืนยัน');
    return;
  }

  try {
    const user = auth.currentUser;
    if (!user) {
      setErrorMessage('ยังไม่มีผู้ใช้ล็อกอิน');
      return;
    }

    const uid = user.uid;

    const updateData = {
      email: user.email,
      facebook: facebookName,
      facebooklink: facebookLink,
      idline: lineId,
      ig: igName,
      iglink: igLink,
      name: user.displayName || '',
      password: passedPassword || '',
      phoneNumber: phone,
      backupPhoneNumber: backupPhone,
      role: 'user',
      uid: uid, // ✅ ใช้เป็น documentId และเก็บไว้ในฟิลด์ด้วย
    };

    const usersCol = collection(db, 'users');
    const snapshot = await getDocs(usersCol);

    let maxId = 0;

    // ✅ วนหา max หมายเลขจาก id: "U1", "U2", ...
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      if (data.id && typeof data.id === 'string' && data.id.startsWith("U")) {
        const numberPart = parseInt(data.id.replace("U", ""));
        if (!isNaN(numberPart) && numberPart > maxId) {
          maxId = numberPart;
        }
      }
    });

    const userRef = doc(db, 'users', uid); // ✅ ใช้ uid เป็น documentId

    // ✅ เช็กว่ามี document นี้อยู่แล้วหรือไม่
    const docExists = snapshot.docs.find(doc => doc.id === uid);
    if (!docExists) {
      // สร้าง id ใหม่เฉพาะตอนสมัครใหม่
      updateData.id = `U${maxId + 1}`;
    }

    await setDoc(userRef, updateData);

    setErrorMessage('');
    router.replace('/login');
  } catch (error) {
    console.error('เกิดข้อผิดพลาด:', error);
    setErrorMessage('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
  }
};


  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ImageBackground source={require('../assets/bg.png')} style={styles.background} resizeMode="cover">
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.container}>
            <Image source={require('../assets/logo2.png')} style={styles.logo} resizeMode="contain" />

            <View style={styles.card}>
              <Text style={styles.title}>โปรดใส่ข้อมูลติดต่อ</Text>

              {errorMessage ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              ) : null}

              <ContactRow
                icon={require('../assets/facebook.png')}
                label1="ชื่อเฟส"
                label2="ลิงก์เฟส"
                value1={facebookName}
                value2={facebookLink}
                onChangeText1={setFacebookName}
                onChangeText2={setFacebookLink}
              />

              <ContactRow
                icon={require('../assets/line.png')}
                label1="ไอดีไลน์"
                label2="ลิงก์ไลน์"
                value1={lineId}
                value2={lineLink}
                onChangeText1={setLineId}
                onChangeText2={setLineLink}
              />

              <ContactRow
                icon={require('../assets/instagram.png')}
                label1="ชื่อไอจี"
                label2="ลิงก์ไอจี"
                value1={igName}
                value2={igLink}
                onChangeText1={setIgName}
                onChangeText2={setIgLink}
              />

              <ContactRow
                icon={require('../assets/call.png')}
                label1="เบอร์โทร"
                label2="เบอร์สำรอง"
                value1={phone}
                value2={backupPhone}
                onChangeText1={setPhone}
                onChangeText2={setBackupPhone}
              />

              <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>ยืนยัน</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

function ContactRow({ icon, label1, label2, value1, value2, onChangeText1, onChangeText2 }) {
  return (
    <View style={styles.row}>
      <Image source={icon} style={styles.icon} />
      <View style={styles.inputs}>
        <TextInput
          style={styles.input}
          placeholder={label1}
          placeholderTextColor="#000"
          value={value1}
          onChangeText={onChangeText1}
        />
        <TextInput
          style={styles.input}
          placeholder={label2}
          placeholderTextColor="#000"
          value={value2}
          onChangeText={onChangeText2}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#A3CC01',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  container: {
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 10,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 20,
    color: '#000',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'flex-start',
  },
  icon: {
    width: 40,
    height: 40,
    marginRight: 10,
    marginTop: 6,
  },
  inputs: {
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#00000050',
    borderRadius: 5,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 8,
    backgroundColor: '#fff',
    color: '#000',
  },
  button: {
    marginTop: 10,
    backgroundColor: '#A3CC01',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#000',
  },
  errorBox: {
    backgroundColor: '#ffcccc',
    borderColor: '#ff0000',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    width: '100%',
  },
  errorText: {
    color: '#990000',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default ContractScreen;
