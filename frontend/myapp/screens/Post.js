import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  TextInput, Image, FlatList, Alert, Linking, ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import Header from '../components/header';
import BottomNav from '../components/BottomNav';
import { db } from '../config/firebase-config';
import { collection, doc, setDoc, serverTimestamp, getDoc, query, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import axios from 'axios';

export default function PostScreen() {
  const navigation = useNavigation();
  const [images, setImages] = useState([]);
  const [caption, setCaption] = useState('');
  const [hasPermission, setHasPermission] = useState(null);
  const [address, setAddress] = useState('');
  const [coords, setCoords] = useState(null);
  const [postType, setPostType] = useState('buy');
  const [uploading, setUploading] = useState(false); // เพิ่ม state ตัวนี้

  useEffect(() => {
    const checkPermissions = async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') alert('กรุณาอนุญาตให้ใช้กล้อง');
      else setHasPermission(true);

      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (mediaStatus !== 'granted') alert('กรุณาอนุญาตให้เข้าถึงแกลเลอรี');
    };
    checkPermissions();
  }, []);

  const openCamera = async () => {
    if (hasPermission) {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 1,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      });
      if (!result.canceled && result.assets?.[0]?.uri) {
        setImages((prev) => [...prev, result.assets[0].uri]);
      }
    }
  };

  const openGallery = async () => {
    if (hasPermission) {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: false,
        quality: 1,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      });
      if (!result.canceled && result.assets?.[0]?.uri) {
        setImages((prev) => [...prev, result.assets[0].uri]);
      }
    }
  };

  const pickLocationHandler = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      alert('ไม่ได้รับอนุญาตให้เข้าถึงตำแหน่ง');
      return;
    }
    try {
      const loc = await Location.getCurrentPositionAsync({});
      const geocode = await Location.reverseGeocodeAsync(loc.coords);
      const place = geocode?.[0] || {};
      const fullAddress = `${place.name || ''} ${place.street || ''} ${place.district || ''} ${place.city || ''} ${place.region || ''}`.trim();

      setCoords({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      setAddress(fullAddress);
    } catch (err) {
      console.error('Location error:', err);
      alert('เกิดข้อผิดพลาดขณะดึงตำแหน่ง');
    }
  };

  const openMaps = () => {
    if (coords) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${coords.latitude},${coords.longitude}`;
      Linking.openURL(url);
    }
  };
  
const uploadImagesAndSavePost = async () => {
  setUploading(true);
  try {
    if (!caption || images.length === 0) {
      Alert.alert('กรุณาใส่คำบรรยายและเลือกรูปอย่างน้อย 1 รูป');
      setUploading(false);
      return;
    }

    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert('กรุณาเข้าสู่ระบบก่อนโพสต์');
      setUploading(false);
      return;
    }

    const uid = currentUser.uid;

    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.exists() ? userSnap.data() : {};
    const ownerName = userData.name || '';

    // อัปโหลดรูปภาพไป Cloudinary
    const uploadedUrls = [];
    for (const uri of images) {
      const formData = new FormData();
      const filename = uri.split('/').pop();
      const fileType = filename.split('.').pop();
      formData.append('file', {
        uri,
        name: filename,
        type: `image/${fileType}`,
      });
      formData.append('upload_preset', 'postuser');

      const response = await axios.post(
        'https://api.cloudinary.com/v1_1/dd0ro6iov/image/upload',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      uploadedUrls.push(response.data.secure_url);
    }

    // ✅ แยก collection ตามประเภทโพสต์
    const postCollectionName = postType === 'donate' ? 'PostDonate' : 'PostSale';
    const postCollection = collection(db, postCollectionName);

    // ✅ นับจำนวนเอกสารใน collection นี้
    const q = query(postCollection);
    const querySnapshot = await getDocs(q);
    const count = querySnapshot.size;

    // ✅ สร้างชื่อเอกสาร: PostProductDonateX หรือ PostProductSaleX
    const prefix = postType === 'donate' ? 'PostProductDonate' : 'PostProductSale';
    const postId = `${prefix}${count + 1}`;

    // ✅ สร้าง document ด้วยชื่อกำหนดเอง
    const newDocRef = doc(db, postCollectionName, postId);

    const postData = {
      postId,
      caption,
      imageUrls: uploadedUrls,
      address,
      coords: coords || null,
      type: postType,
      uid,
      ownerName,
      createdAt: serverTimestamp(),
    };

    await setDoc(newDocRef, postData);

    Alert.alert('โพสต์สำเร็จ!');
    setCaption('');
    setImages([]);
    setAddress('');
    setCoords(null);

    // ✅ นำทางกลับหน้ารวมโพสต์
    if (postType === 'buy') {
      navigation.navigate('lookpost');
    } else if (postType === 'donate') {
      navigation.navigate('donate');
    }
  } catch (error) {
    console.error('Post error:', error);
    Alert.alert('เกิดข้อผิดพลาดในการโพสต์');
  } finally {
    setUploading(false);
  }
};

  const renderImageItem = ({ item, index }) => (
    <TouchableOpacity
      onPress={() =>
        Alert.alert('ลบรูปภาพ', 'คุณต้องการลบรูปภาพนี้ใช่หรือไม่?', [
          { text: 'ยกเลิก', style: 'cancel' },
          {
            text: 'ลบ',
            style: 'destructive',
            onPress: () => setImages((prev) => prev.filter((_, i) => i !== index)),
          },
        ])
      }
      style={styles.imageContainer}
    >
      <Image source={{ uri: item }} style={styles.image} resizeMode="cover" />
      <View style={styles.imageOverlay}>
        <Text style={styles.imageOverlayText}>แตะเพื่อลบ</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Header />
      <View style={styles.subHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={require('../assets/back.png')} style={styles.smallIcon} />
        </TouchableOpacity>
        <Text style={styles.subHeaderTitle}>โพสต์</Text>
        <View style={styles.iconContainer}>
          <TouchableOpacity onPress={openCamera}>
            <Image source={require('../assets/camera.png')} style={styles.smallIcon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={openGallery}>
            <Image source={require('../assets/image.png')} style={styles.smallIcon} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginVertical: 10 }}>
          <TouchableOpacity
            style={[styles.postTypeButton, postType === 'buy' && styles.postTypeButtonActive]}
            onPress={() => setPostType('buy')}
          >
            <Text style={[styles.postTypeText, postType === 'buy' && styles.postTypeTextActive]}>ซื้อขาย</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.postTypeButton, postType === 'donate' && styles.postTypeButtonActive]}
            onPress={() => setPostType('donate')}
          >
            <Text style={[styles.postTypeText, postType === 'donate' && styles.postTypeTextActive]}>บริจาค</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.captionInput}
          placeholder="เพิ่มคำบรรยาย..."
          value={caption}
          onChangeText={setCaption}
          multiline
        />
        <FlatList
          data={images}
          renderItem={renderImageItem}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          style={styles.imageList}
        />
        <TouchableOpacity style={styles.locationRow} onPress={pickLocationHandler}>
          <Image source={require('../assets/location.png')} style={styles.locationIcon} />
          <Text style={styles.addLocation}>{address || 'เพิ่มตำแหน่งของคุณ'}</Text>
        </TouchableOpacity>
        {coords && (
          <TouchableOpacity style={styles.routeButton} onPress={openMaps}>
            <Text style={styles.routeButtonText}>ดูเส้นทาง</Text>
          </TouchableOpacity>
        )}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              setCaption('');
              setImages([]);
              setAddress('');
              setCoords(null); 
            }}
          >
            <Text style={styles.buttonText}>ยกเลิก</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.confirmButton} onPress={uploadImagesAndSavePost} disabled={uploading} >
            <Text style={styles.buttonText}>
              {uploading ? 'กำลังโพสต์...' : 'ยืนยัน'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#B7E305',
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  subHeaderTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#fff',
  },
  smallIcon: {
    width: 40,
    height: 40,
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 90,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 150,
    backgroundColor: '#fff',
  },
  captionInput: {
    marginBottom: 15,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
  },
  imageList: {
    marginTop: 20,
    marginBottom: 15,
  },
  imageContainer: {
    marginRight: 20,
    position: 'relative',
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 10,
    margin: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  imageOverlayText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  locationIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  addLocation: {
    fontSize: 16,
    color: '#333',
  },
  routeButton: {
    marginTop: 10,
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  routeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#ededed',
    marginRight: 10,
    padding: 15,
    alignItems: 'center',
    borderRadius: 10,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#B7E305',
    marginLeft: 10,
    padding: 15,
    alignItems: 'center',
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  postTypeButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: '#E0E0E0',
    borderRadius: 20,
    marginHorizontal: 10,
  },
  postTypeButtonActive: {
    backgroundColor: '#B7E305',
  },
  postTypeText: {
    fontWeight: 'bold',
    color: '#555',
  },
  postTypeTextActive: {
    color: '#000',
  },
});
