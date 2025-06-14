import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, StyleSheet, TouchableOpacity, FlatList, Linking, Modal, ScrollView,
} from 'react-native';
import Header from '../components/header';
import BottomNav from '../components/BottomNav';
import { useRouter } from 'expo-router';
import { db } from '../config/firebase-config';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

const DonateScreen = () => {
  const router = useRouter();
  const [posts, setPosts] = useState([]);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    facebook: '',
    idline: '',
    ig: '',
    phoneNumber: '',
  });

  useEffect(() => {
    const fetchPosts = async () => {
      const snapshot = await getDocs(collection(db, 'PostDonate'));
      const postsData = [];

      for (const docSnap of snapshot.docs) {
        const post = { id: docSnap.id, ...docSnap.data() };

        // ดึงข้อมูล user จาก uid
        if (post.uid) {
          const userRef = doc(db, 'users', post.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            post.facebook = userData.facebook || '';
            post.idline = userData.idline || '';
            post.ig = userData.ig || '';
            post.phoneNumber = userData.phoneNumber || '';
            post.ownerName = post.ownerName || userData.name || 'ไม่ระบุชื่อ';
            post.profileImageUrl = post.profileImageUrl || userData.profileImageUrl || '';
          } else {
            post.facebook = '';
            post.idline = '';
            post.ig = '';
            post.phoneNumber = '';
          }
        }

        postsData.push(post);
      }

      postsData.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
      setPosts(postsData);
    };

    fetchPosts();
  }, []);

  const openContactModal = (item) => {
    setContactInfo({
      facebook: item.facebook || '',
      idline: item.idline || '',
      ig: item.ig || '',
      phoneNumber: item.phoneNumber || '',
    });
    setModalVisible(true);
  };

  const renderPost = ({ item }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Image
          source={
            item.profileImageUrl
              ? { uri: item.profileImageUrl }
              : require('../assets/profile.png')
          }
          style={styles.profileImage}
        />
        <View>
          <Text style={styles.username}>{item.ownerName || 'ไม่ระบุชื่อ'}</Text>
          {item.createdAt?.toDate && (
          <Text style={styles.date}>
            {item.createdAt.toDate().toLocaleDateString()}
          </Text>
        )}
          <Text style={styles.location}>{item.address || 'ไม่ระบุตำแหน่ง'}</Text>
        </View>
      </View>

      <Text style={styles.description}>{item.caption || 'ไม่มีคำอธิบายเพิ่มเติม'}</Text>

      {item.imageUrls && item.imageUrls.length > 0 && (
        <FlatList
          data={item.imageUrls}
          keyExtractor={(img, index) => index.toString()}
          horizontal
          renderItem={({ item: img }) => (
            <Image source={{ uri: img }} style={styles.postImage} />
          )}
        />
      )}

      {item.coords && (
        <TouchableOpacity
          style={styles.routeButton}
          onPress={() =>
            Linking.openURL(
              `https://www.google.com/maps/dir/?api=1&destination=${item.coords.latitude},${item.coords.longitude}`
            )
          }
        >
          <Text style={styles.routeButtonText}>ดูเส้นทาง</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.contactButton}
        onPress={() => openContactModal(item)}
      >
        <Text style={styles.contactText}>ติดต่อ</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header />
      <FlatList
        ListHeaderComponent={
          <View style={styles.featureContainer}>
            <FeatureButton title="ร้านรับซื้อ" icon={require('../assets/bg-home.png')} onPress={() => router.push('/shop')} />
            <FeatureButton title="ซื้อขาย" icon={require('../assets/excellent.png')} onPress={() => router.push('/lookpost')} />
            <FeatureButton title="บริจาค" icon={require('../assets/fundraising.png')} onPress={() => router.push('/donate')} />
          </View>
        }
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
      <BottomNav />

      {/* Modal แสดงข้อมูลติดต่อ */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>ช่องทางการติดต่อ</Text>

            <ScrollView>
            <TouchableOpacity
              style={styles.socialItem}
              onPress={() => {
                if (contactInfo.facebook) {
                  // ลิงก์ Facebook (แก้ URL ตาม username หรือ page)
                  Linking.openURL(`https://www.facebook.com/${contactInfo.facebook}`);
                }
              }}
            >
              <Image source={require('../assets/facebook.png')} style={styles.icon} />
              <Text style={styles.socialText}>{contactInfo.facebook || 'ไม่มีข้อมูล'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialItem}
              onPress={() => {
                if (contactInfo.idline) {
                  // ลิงก์ Line (เปิดแอป Line ด้วย user id หรือ line url)
                  Linking.openURL(`line://ti/p/${contactInfo.idline}`);
                }
              }}
            >
              <Image source={require('../assets/line.png')} style={styles.icon} />
              <Text style={styles.socialText}>{contactInfo.idline || 'ไม่มีข้อมูล'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialItem}
              onPress={() => {
                if (contactInfo.ig) {
                  // ลิงก์ Instagram
                  Linking.openURL(`https://instagram.com/${contactInfo.ig}`);
                }
              }}
            >
              <Image source={require('../assets/instagram.png')} style={styles.icon} />
              <Text style={styles.socialText}>{contactInfo.ig || 'ไม่มีข้อมูล'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialItem}
              onPress={() => {
                if (contactInfo.phoneNumber) {
                  // โทรออก (ใช้ tel: protocol)
                  Linking.openURL(`tel:${contactInfo.phoneNumber}`);
                }
              }}
            >
              <Image source={require('../assets/call.png')} style={styles.icon} />
              <Text style={styles.socialText}>{contactInfo.phoneNumber || 'ไม่มีข้อมูล'}</Text>
            </TouchableOpacity>
          </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={{ fontWeight: 'bold' }}>ปิด</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const FeatureButton = ({ title, icon, onPress }) => (
  <TouchableOpacity style={styles.featureBtn} onPress={onPress}>
    <Image source={icon} style={styles.featureIcon} />
    <Text style={styles.featureText}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  featureContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  featureBtn: {
    alignItems: 'center',
    backgroundColor: '#B7E305',
    padding: 10,
    borderRadius: 15,
    width: 90,
  },
  featureIcon: { width: 40, height: 40 },
  featureText: {
    marginTop: 5,
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  username: { fontWeight: 'bold', fontSize: 16 },
  location: { fontSize: 12, color: '#666' },
  description: { fontSize: 14, marginBottom: 10 },
  postImage: {
    width: 260,
    height: 180,
    borderRadius: 8,
    marginRight: 8,
  },
  routeButton: {
    marginTop: 10,
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  contactButton: {
    marginTop: 10,
    backgroundColor: '#ededed',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  routeButtonText: { color: '#fff', fontWeight: 'bold' },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    width: '80%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 15,
    textAlign: 'center',
  },
  socialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  icon: {
    width: 30,
    height: 30,
    marginRight: 15,
  },
  socialText: {
    fontSize: 16,
    color: '#333',
    flexShrink: 1,
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: '#ddd',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  date: {
  fontSize: 12,
  color: '#666',
  marginBottom: 2,
},
});

export default DonateScreen;
