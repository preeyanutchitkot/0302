import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import axios from 'axios';
import { db } from '../config/firebase-config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import UUID from 'react-native-uuid';
import Header from '../components/header';
import BottomNav from '../components/BottomNav';

const AppealChatScreen = () => {
  const scrollRef = useRef();
  const [messages, setMessages] = useState([
    { id: UUID.v4(), type: 'bot', text: '👋 คุณต้องการแจ้งปัญหาอะไร? (เลือกจาก ขยะ, ถนนพัง, น้ำท่วม, ไฟฟ้า, น้ำประปา, ฝาถัง, ไฟไหม้, การจราจร, ปัญหาทั่วไป)' }
  ]);
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState('');
  const [detail, setDetail] = useState('');
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setStep(0);
    setCategory('');
    setDetail('');
    setImage(null);
    setLocation(null);
    setMessages([{ id: UUID.v4(), type: 'bot', text: '👋 คุณต้องการแจ้งปัญหาอะไร? (เลือกจาก ขยะ, ถนนพัง, น้ำท่วม, ไฟฟ้า, น้ำประปา, ฝาถัง, ไฟไหม้, การจราจร, ปัญหาทั่วไป)' }]);
  };

  const handleCategorySelection = (selectedCategory) => {
    setCategory(selectedCategory);
    setMessages(prev => [
      ...prev,
      { id: UUID.v4(), type: 'user', text: selectedCategory },
      { id: UUID.v4(), type: 'bot', text: `กรุณาระบุรายละเอียดเพิ่มเติมเกี่ยวกับ ${selectedCategory}` }
    ]);
    setStep(1);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setMessages(prev => [...prev, { id: UUID.v4(), type: 'user', text }]);
    setInput('');

    if (step === 1) {
      setDetail(text);
      setMessages(prev => [...prev, { id: UUID.v4(), type: 'bot', text: '📷 ต้องการแนบรูปภาพไหม? (พิมพ์ "ใช่" หรือ "ไม่")' }]);
      setStep(2);
    } else if (step === 2) {
      if (text.toLowerCase().includes('ใช')) {
        pickImage();
      } else {
        setMessages(prev => [...prev, { id: UUID.v4(), type: 'bot', text: '📍 ต้องการแชร์ตำแหน่งของคุณหรือไม่? (พิมพ์ "แชร์" หรือ "ไม่")' }]);
        setStep(3);
      }
    } else if (step === 3) {
      if (text.toLowerCase().includes('แชร์')) {
        askLocation();
      } else {
        setMessages(prev => [...prev, { id: UUID.v4(), type: 'bot', text: '❌ คุณไม่ได้แชร์ตำแหน่ง กรุณาระบุจุดเกิดเหตุในข้อความค่ะ' }]);
        analyzeAndSubmit();
      }
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setMessages(prev => [...prev, { id: UUID.v4(), type: 'user', image: uri }]);
      try {
        const imageUrl = await uploadImageToCloudinary(uri);
        setImage(imageUrl);
      } catch (e) {
        Alert.alert('อัปโหลดรูปภาพล้มเหลว', e.message);
      }
    }

    setMessages(prev => [...prev, { id: UUID.v4(), type: 'bot', text: '📍 ต้องการแชร์ตำแหน่งของคุณหรือไม่? (พิมพ์ "แชร์" หรือ "ไม่")' }]);
    setStep(3);
  };

  const askLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setMessages(prev => [...prev, { id: UUID.v4(), type: 'bot', text: '❌ ไม่ได้รับสิทธิ์เข้าถึงตำแหน่ง กรุณาระบุจุดเกิดเหตุในข้อความค่ะ' }]);
      analyzeAndSubmit();
      return;
    }

    try {
      const loc = await Location.getCurrentPositionAsync({});
      const geocode = await Location.reverseGeocodeAsync(loc.coords);
      const place = geocode?.[0] || {};
      const fullAddress = `${place.name || ''} ${place.street || ''} ${place.district || ''} ${place.city || ''}`.trim();
      const coords = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        address: fullAddress,
      };
      setLocation(coords);
      setMessages(prev => [...prev, { id: UUID.v4(), type: 'user', text: `📍 ตำแหน่งของคุณ: ${fullAddress}` }]);
      analyzeAndSubmit(coords);
    } catch (err) {
      setMessages(prev => [...prev, { id: UUID.v4(), type: 'bot', text: '❌ เกิดข้อผิดพลาดขณะดึงตำแหน่ง' }]);
    }
  };

  const uploadImageToCloudinary = async (uri) => {
    const formData = new FormData();
    const fileName = uri.split('/').pop();
    const fileType = fileName.split('.').pop();
    formData.append('file', { uri, name: fileName, type: `image/${fileType}` });
    formData.append('upload_preset', 'postuser');
    const res = await axios.post('https://api.cloudinary.com/v1_1/dd0ro6iov/image/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.secure_url;
  };

  const analyzeAndSubmit = async (imageUrlParam = null, locationParam = null) => {
    setLoading(true);
    try {
      const prompt = `หัวข้อ: ${category}\nรายละเอียด: ${detail}\nประเภท: ${category}`;
      const aiRes = await axios.post('http://192.168.1.62:3000/api/analyze', { prompt });
      const rawAnalysis = aiRes.data.text || '';
      const urgencyMatch = rawAnalysis.match(/ระดับความเร่งด่วน[:：]?\s*(ปกติ|ด่วน|เร่งด่วน)/i);
      const urgency = urgencyMatch ? urgencyMatch[1] : 'ไม่ระบุ';
      const summary = rawAnalysis.length > 300
        ? rawAnalysis.substring(0, 150).trim() + '...'
        : rawAnalysis.trim();

      await addDoc(collection(db, 'appeal'), {
        title: category,
        detail,
        image: imageUrlParam || image,
        location: locationParam || location,
        analysis: rawAnalysis,
        urgency,
        status: 'รับเรื่องแล้ว',
        createdAt: serverTimestamp(),
      });

      setMessages(prev => [
        ...prev,
        { id: Date.now().toString(), type: 'bot', text: '✅ ขอบคุณที่แจ้งเข้ามาค่ะ ทางเรารับเรื่องแล้วนะคะ' },
        { id: Date.now().toString(), type: 'bot', text: `📌 สรุปเบื้องต้น: ${summary}` },
        { id: Date.now().toString(), type: 'bot', text: `🚨 ระดับความเร่งด่วน: ${urgency}` },
        { id: Date.now().toString(), type: 'bot', text: '🎉 หากมีอะไรเพิ่มเติมสามารถแจ้งได้เลยนะคะ หรือเลือกปัญหาใหม่ด้านล่างได้เลย' }
      ]);

      setTimeout(resetForm, 2000);
    } catch (err) {
      Alert.alert('❌ เกิดข้อผิดพลาด', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
      <Header />
      <ScrollView contentContainerStyle={styles.container} ref={scrollRef} onContentSizeChange={() => scrollRef.current.scrollToEnd({ animated: true })}>
        {messages.map(msg => (
          <View key={msg.id} style={[styles.bubble, msg.type === 'user' ? styles.user : styles.bot]}>
            {msg.image ? <Image source={{ uri: msg.image }} style={styles.chatImage} /> : <Text style={styles.text}>{msg.text}</Text>}
          </View>
        ))}
      </ScrollView>

      {loading ? <ActivityIndicator style={{ margin: 10 }} /> : (
        <View style={styles.inputContainer}>
          {step === 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
              {['ขยะ', 'ถนนพัง', 'น้ำท่วม', 'ไฟฟ้า', 'น้ำประปา', 'ฝาถัง', 'ไฟไหม้', 'การจราจร', 'ปัญหาทั่วไป'].map((cat, index) => (
                <TouchableOpacity key={index} style={styles.categoryButton} onPress={() => handleCategorySelection(cat)}>
                  <Text style={styles.categoryText}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={pickImage} style={styles.imageButton}><Text style={styles.buttonText}>📸</Text></TouchableOpacity>
            <TouchableOpacity onPress={askLocation} style={styles.locationButton}><Text style={styles.buttonText}>📍</Text></TouchableOpacity>
            <TextInput value={input} onChangeText={setInput} placeholder="พิมพ์ข้อความ..." style={[styles.input, { flex: 1, marginRight: 8 }]} />
            <TouchableOpacity onPress={handleSend} style={styles.sendButton}><Text style={styles.sendText}>ส่ง</Text></TouchableOpacity>
          </View>
        </View>
      )}
      <BottomNav />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: 16, paddingBottom: 60 },
  bubble: { padding: 12, marginBottom: 8, borderRadius: 20, maxWidth: '80%' },
  user: { backgroundColor: '#dcf8c6', alignSelf: 'flex-end' },
  bot: { backgroundColor: '#f1f0f0', alignSelf: 'flex-start' },
  inputContainer: { borderTopWidth: 1, borderColor: '#ddd', backgroundColor: '#fff', padding: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#f9f9f9' },
  buttonRow: { flexDirection: 'row', alignItems: 'center' },
  imageButton: { backgroundColor: '#f1f0f0', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 20, marginRight: 6 },
  locationButton: { backgroundColor: '#B7E305', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 20, marginRight: 6 },
  buttonText: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  sendButton: { backgroundColor: '#2196F3', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  sendText: { color: 'white', fontWeight: 'bold' },
  categoryButton: { backgroundColor: '#eee', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  categoryText: { fontSize: 14 },
  chatImage: { width: 160, height: 120, borderRadius: 10, resizeMode: 'cover' },
});

export default AppealChatScreen;
