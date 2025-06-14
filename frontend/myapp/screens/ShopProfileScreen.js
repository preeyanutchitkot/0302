import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Linking, FlatList, Alert, Modal, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { db } from '../config/firebase-config';
import {
  collection, getDocs, query, where, deleteDoc, doc, updateDoc,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import Header from '../components/header';
import BottomNav from '../components/BottomNav';
import * as ImagePicker from 'expo-image-picker';

const SocialLink = ({ title, link, icon }) => (
  <View style={styles.socialRow}>
    <TouchableOpacity onPress={() => Linking.openURL(link)}>
      <Image source={icon} style={styles.icon} />
    </TouchableOpacity>
    <Text style={styles.socialText}>{title}</Text>
  </View>
);

const PostItem = ({ post, handleDeletePost }) => (
  <View style={styles.postContainer}>
    <View style={styles.postHeader}>
      <Image
        source={post.profileImageUrl ? { uri: post.profileImageUrl } : require('../assets/profile.png')}
        style={styles.postAvatar}
      />
      <View>
        <Text style={styles.postName}>{post.ownerName || 'ไม่ระบุชื่อ'}</Text>
        <Text style={styles.postLocation}>{post.type === 'buy' ? 'โพสต์ขาย' : 'โพสต์บริจาค'} {post.address || ''}</Text>
      </View>
    </View>
    <Text style={styles.postText}>{post.caption}</Text>

    {post.imageUrls && post.imageUrls.length > 0 && (
      <FlatList
        data={post.imageUrls}
        renderItem={({ item }) => (
          <Image source={{ uri: item }} style={styles.postImage} resizeMode="cover" />
        )}
        keyExtractor={(item, index) => index.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
      />
    )}

    {/* เอา <Text style={styles.contactText}>ติดต่อ</Text> ออกไป */}

    <Text style={styles.deleteText} onPress={() => handleDeletePost(post)}>ลบโพสต์</Text>
  </View>
);


const ShopProfileScreen = () => {
  const navigation = useRouter();
  const [user, setUser] = useState(null);
  const [myPosts, setMyPosts] = useState([]);

  // Modal state และข้อมูลร้านค้าแก้ไข
  const [modalVisible, setModalVisible] = useState(false);
  const [shopEdit, setShopEdit] = useState({
    shopName: '',
    ownerName: '',
    category: '',
    address: '',
    amphoe: '',
    district: '',
    province: '',
    phone: '',
    pinAddress: '',
    detail: '',
    profileImageUrl: '',  // รูปโปรไฟล์ร้านค้า
    shopImageUrls: [],    // รูปภาพรายละเอียดร้านค้า
  });

  useEffect(() => {
    const fetchUserAndPosts = async () => {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const uid = currentUser.uid;

      // ดึงข้อมูลผู้ใช้
      const userQuery = query(collection(db, 'users'), where('uid', '==', uid));
      const userSnap = await getDocs(userQuery);
      let userData = null;
      if (!userSnap.empty) {
        userData = userSnap.docs[0].data();
        setUser(userData);
      }

      // ดึงโพสต์ พร้อมดึงรูปโปรไฟล์จาก users มาใส่ในแต่ละโพสต์
      const posts = [];
      const collections = ['PostSale', 'PostDonate'];
      for (const col of collections) {
        const q = query(collection(db, col), where('uid', '==', uid));
        const snap = await getDocs(q);
        for (const docSnap of snap.docs) {
          const postData = docSnap.data();
          postData.profileImageUrl = userData?.profileImageUrl || null;
          postData.ownerName = userData?.name || 'ไม่ระบุชื่อ';
          posts.push(postData);
        }
      }
      setMyPosts(posts);

      // โหลดข้อมูลร้านค้าใส่ shopEdit
      const shopQuery = query(collection(db, 'shops'), where('uid', '==', uid));
      const shopSnap = await getDocs(shopQuery);
      if (!shopSnap.empty) {
        const shopData = shopSnap.docs[0].data();
        setShopEdit({
          shopName: shopData.shopName || '',
          ownerName: shopData.ownerName || '',
          category: shopData.category || '',
          address: shopData.address || '',
          amphoe: shopData.amphoe || '',
          district: shopData.district || '',
          province: shopData.province || '',
          phone: shopData.phone || '',
          pinAddress: shopData.pinAddress || '',
          detail: shopData.detail || '',
          profileImageUrl: shopData.profileImageUrl || '',
          shopImageUrls: shopData.shopImageUrls || [],
        });
      }
    };

    fetchUserAndPosts();
  }, []);

  const goBack = () => {
    navigation.replace('/home');
  };

  // เปิด modal แก้ไขร้านค้า
  const goToMyShopScreen = () => {
    setModalVisible(true);
  };

  // ลบโพสต์
  const handleDeletePost = async (post) => {
    try {
      const colName = post.type === 'buy' ? 'PostSale' : 'PostDonate';
      const q = query(collection(db, colName), where('uid', '==', post.uid), where('caption', '==', post.caption));
      const snap = await getDocs(q);
      snap.forEach(async (docItem) => {
        await deleteDoc(doc(db, colName, docItem.id));
      });
      setMyPosts(myPosts.filter(p => p.caption !== post.caption));
      Alert.alert('ลบแล้ว', 'โพสต์ถูกลบเรียบร้อย');
    } catch (err) {
      Alert.alert('ผิดพลาด', 'ไม่สามารถลบโพสต์ได้');
    }
  };

  // กดเปลี่ยนรูปโปรไฟล์ร้านค้าใน modal
  const pickProfileImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("แจ้งเตือน", "ต้องขออนุญาตเข้าถึงรูปภาพ");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setShopEdit({ ...shopEdit, profileImageUrl: uri });
    }
  };

  // กดเพิ่มรูปภาพรายละเอียดร้านค้าใน modal
  const addShopImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("แจ้งเตือน", "ต้องขออนุญาตเข้าถึงรูปภาพ");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setShopEdit({ ...shopEdit, shopImageUrls: [...shopEdit.shopImageUrls, uri] });
    }
  };

  // ลบรูปภาพรายละเอียดร้านค้าใน modal
  const removeShopImage = (index) => {
    const updatedImages = [...shopEdit.shopImageUrls];
    updatedImages.splice(index, 1);
    setShopEdit({ ...shopEdit, shopImageUrls: updatedImages });
  };

  // บันทึกข้อมูลร้านค้าใน modal
  const handleSaveShopEdit = async () => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const shopQuery = query(collection(db, 'shops'), where('uid', '==', currentUser.uid));
      const shopSnap = await getDocs(shopQuery);
      if (!shopSnap.empty) {
        const shopDocId = shopSnap.docs[0].id;
        const shopDocRef = doc(db, 'shops', shopDocId);

        await updateDoc(shopDocRef, shopEdit);
        Alert.alert('สำเร็จ', 'อัปเดตข้อมูลร้านค้าเรียบร้อยแล้ว');
        setModalVisible(false);
      }
    } catch (error) {
      Alert.alert('ผิดพลาด', 'ไม่สามารถอัปเดตข้อมูลร้านค้าได้');
      console.error(error);
    }
  };

  const handleDeleteShop = async () => {
  try {
    Alert.alert(
      "ยืนยันการลบ",
      "คุณแน่ใจหรือไม่ว่าต้องการลบร้านค้านี้?",
      [
        { text: "ยกเลิก", style: "cancel" },
        {
          text: "ลบ",
          style: "destructive",
          onPress: async () => {
            const auth = getAuth();
            const currentUser = auth.currentUser;
            if (!currentUser) return;

            const shopQuery = query(collection(db, 'shops'), where('uid', '==', currentUser.uid));
            const shopSnap = await getDocs(shopQuery);
            if (!shopSnap.empty) {
              const shopDocId = shopSnap.docs[0].id;
              await deleteDoc(doc(db, 'shops', shopDocId));

              setModalVisible(false);
              Alert.alert('ลบสำเร็จ', 'ร้านค้าของคุณถูกลบเรียบร้อยแล้ว');
              setShopEdit({
                shopName: '',
                ownerName: '',
                category: '',
                address: '',
                amphoe: '',
                district: '',
                province: '',
                phone: '',
                pinAddress: '',
                detail: '',
                profileImageUrl: '',
                shopImageUrls: [],
              });
            }
          }
        }
      ]
    );
  } catch (error) {
    console.error("ลบร้านค้าผิดพลาด:", error);
    Alert.alert('ผิดพลาด', 'ไม่สามารถลบร้านค้าได้');
  }
};

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={goBack}>
        <Image source={require('../assets/back.png')} style={styles.backIcon} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.editButton} onPress={() => navigation.push('MyShopScreen')}>
        <Image source={require('../assets/edit.png')} style={styles.editIcon} />
      </TouchableOpacity>


      <Header />

      <ScrollView contentContainerStyle={styles.content}>
        {user && (
          <View style={styles.profileContainer}>
            <Image
              source={user.profileImageUrl ? { uri: user.profileImageUrl } : require('../assets/profile.png')}
              style={styles.profile}
            />
            <Text style={styles.name}>{user.name}</Text>
          </View>
        )}

        <View style={styles.socialContainer}>
          <SocialLink title={user?.facebook || 'Facebook'} link={user?.facebooklink || 'https://www.facebook.com/'} icon={require('../assets/facebook.png')} />
          <SocialLink title={user?.idline || 'Line'} link={`https://line.me/R/ti/p/~${user?.idline || ''}`} icon={require('../assets/line.png')} />
          <SocialLink title={user?.ig || 'Instagram'} link={`https://www.instagram.com/${user?.ig || ''}`} icon={require('../assets/instagram.png')} />
          <SocialLink title={user?.phoneNumber || 'โทรเลย'} link={`tel:${user?.phoneNumber || ''}`} icon={require('../assets/call.png')} />
        </View>

        <TouchableOpacity style={styles.sectionRow} onPress={goToMyShopScreen}>
          <Image source={require('../assets/bg-home.png')} style={styles.sectionImage} />
          <Text style={styles.sectionTitle}>ร้านค้าของฉัน</Text>
        </TouchableOpacity>

        <FlatList
          data={myPosts}
          renderItem={({ item }) => <PostItem post={item} handleDeletePost={handleDeletePost} />}
          keyExtractor={(item, index) => index.toString()}
          scrollEnabled={false}
        />
      </ScrollView>

      <BottomNav />

      {/* Modal แก้ไขร้านค้า */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
              <Text style={styles.modalTitle}>แก้ไขร้านค้าของฉัน</Text>

              {/* รูปโปรไฟล์ร้านค้า */}
              <TouchableOpacity onPress={pickProfileImage} style={{ alignSelf: 'center', marginBottom: 15 }}>
                <Image
                  source={shopEdit.profileImageUrl
                    ? { uri: shopEdit.profileImageUrl }
                    : require('../assets/profile.png')}
                  style={{ width: 100, height: 100, borderRadius: 50 }}
                />
                <Text style={{ textAlign: 'center', color: '#007AFF', marginTop: 5 }}>เปลี่ยนรูปโปรไฟล์</Text>
              </TouchableOpacity>

              {/* ฟอร์มแก้ไขข้อมูลร้านค้า */}
              <Text style={styles.label}>ชื่อร้าน</Text>
              <TextInput
                style={styles.input}
                value={shopEdit.shopName}
                onChangeText={(text) => setShopEdit({ ...shopEdit, shopName: text })}
              />

              <Text style={styles.label}>เจ้าของ</Text>
              <TextInput
                style={styles.input}
                value={shopEdit.ownerName}
                onChangeText={(text) => setShopEdit({ ...shopEdit, ownerName: text })}
              />

              <Text style={styles.label}>หมวดหมู่</Text>
              <TextInput
                style={styles.input}
                value={shopEdit.category}
                onChangeText={(text) => setShopEdit({ ...shopEdit, category: text })}
              />

              <Text style={styles.label}>ที่อยู่</Text>
              <TextInput
                style={styles.input}
                value={shopEdit.address}
                onChangeText={(text) => setShopEdit({ ...shopEdit, address: text })}
              />

              <Text style={styles.label}>อำเภอ</Text>
              <TextInput
                style={styles.input}
                value={shopEdit.amphoe}
                onChangeText={(text) => setShopEdit({ ...shopEdit, amphoe: text })}
              />

              <Text style={styles.label}>ตำบล</Text>
              <TextInput
                style={styles.input}
                value={shopEdit.district}
                onChangeText={(text) => setShopEdit({ ...shopEdit, district: text })}
              />

              <Text style={styles.label}>จังหวัด</Text>
              <TextInput
                style={styles.input}
                value={shopEdit.province}
                onChangeText={(text) => setShopEdit({ ...shopEdit, province: text })}
              />

              <Text style={styles.label}>เบอร์โทร</Text>
              <TextInput
                style={styles.input}
                value={shopEdit.phone}
                onChangeText={(text) => setShopEdit({ ...shopEdit, phone: text })}
              />

              <Text style={styles.label}>ปักหมุด</Text>
              <TextInput
                style={styles.input}
                value={shopEdit.pinAddress}
                onChangeText={(text) => setShopEdit({ ...shopEdit, pinAddress: text })}
              />

              <Text style={styles.label}>รายละเอียด</Text>
              <TextInput
                style={styles.input}
                value={shopEdit.detail}
                onChangeText={(text) => setShopEdit({ ...shopEdit, detail: text })}
              />

              {/* รูปภาพรายละเอียดร้านค้า */}
              <Text style={[styles.label, { marginTop: 20 }]}>รูปภาพรายละเอียดร้านค้า</Text>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 10 }}>
                {shopEdit.shopImageUrls && shopEdit.shopImageUrls.length > 0 ? (
                  shopEdit.shopImageUrls.map((uri, index) => (
                    <View key={index} style={{ marginRight: 10, position: 'relative' }}>
                      <Image source={{ uri }} style={styles.shopDetailImage} />
                      <TouchableOpacity
                        style={styles.removeImageBtn}
                        onPress={() => removeShopImage(index)}
                      >
                        <Text style={styles.removeImageText}>X</Text>
                      </TouchableOpacity>
                    </View>
                  ))
                ) : (
                  <Text style={{ color: '#888' }}>ยังไม่มีรูปภาพรายละเอียดร้านค้า</Text>
                )}
              </ScrollView>

              <TouchableOpacity style={styles.addImageBtn} onPress={addShopImage}>
                <Text style={styles.addImageText}>+ เพิ่มรูปภาพใหม่</Text>
              </TouchableOpacity>
              <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.buttonText}>ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleSaveShopEdit}>
                <Text style={styles.buttonText}>บันทึก</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: '#FF3B30', marginTop: 10 }]}
              onPress={handleDeleteShop}
            >
              <Text style={styles.buttonText}>ลบร้านนี้</Text>
            </TouchableOpacity>

            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, alignItems: 'center', paddingBottom: 100 },
  profileContainer: { alignItems: 'center', marginBottom: 15 },
  profile: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  name: { fontWeight: 'bold', fontSize: 18, marginBottom: 10 },
  socialContainer: { marginBottom: 20, width: '100%', alignItems: 'center' },
  socialRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  socialText: { marginLeft: 10, fontSize: 16, color: '#333' },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  sectionImage: { width: 50, height: 50, marginRight: 10, resizeMode: 'contain' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginTop: 20, marginBottom: 10 },
  icon: { width: 40, height: 40, resizeMode: 'contain' },
  postContainer: { backgroundColor: '#f9f9f9', padding: 15, borderRadius: 12, width: '100%', marginBottom: 20 },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  postAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  postName: { fontWeight: 'bold' },
  postLocation: { fontSize: 12, color: '#777' },
  postText: { marginBottom: 10, fontSize: 14, color: '#333' },
  postImage: { width: 260, height: 190, borderRadius: 10, marginRight: 10 },
  contactText: { alignSelf: 'flex-end', color: '#007AFF', fontWeight: 'bold' },
  backButton: { position: 'absolute', top: 70, left: 10, zIndex: 1, padding: 10, backgroundColor: '#fff', borderRadius: 50 },
  backIcon: { width: 30, height: 30, resizeMode: 'contain' },
  editButton: { position: 'absolute', top: 70, right: 20, zIndex: 1, padding: 10, backgroundColor: '#fff', borderRadius: 50 },
  editIcon: { width: 30, height: 30, resizeMode: 'contain' },
  deleteText: { color: '#FF0000', fontWeight: 'bold', marginTop: 10, textAlign: 'center' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    maxHeight: '90%',
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  label: { fontWeight: 'bold', marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 5,
  },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  cancelBtn: {
    backgroundColor: '#ddd',
    paddingVertical: 10,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
  },
  confirmBtn: {
    backgroundColor: '#A3CC01',
    paddingVertical: 10,
    borderRadius: 10,
    flex: 1,
  },
  buttonText: { textAlign: 'center', fontWeight: 'bold' },
  shopDetailImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
  },
  removeImageBtn: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(255,0,0,0.8)',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 1,
  },
  removeImageText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  addImageBtn: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  addImageText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ShopProfileScreen;
