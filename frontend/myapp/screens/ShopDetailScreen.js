import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase-config';

export default function ShopDetailScreen() {
  const router = useRouter();
  const { shopId } = useLocalSearchParams();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShop = async () => {
      try {
        // ค้นหาเอกสารที่มี field 'id' เท่ากับ shopId (ซึ่งเป็น string ต้องแปลงเป็น number)
        const q = query(collection(db, 'shops'), where('id', '==', Number(shopId)));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          // สมมติเจอแค่ 1 ร้าน
          const docSnap = querySnapshot.docs[0];
          setShop(docSnap.data());
        } else {
          console.warn('ไม่พบข้อมูลร้าน');
        }
      } catch (error) {
        console.error('ดึงข้อมูลร้านล้มเหลว', error);
      } finally {
        setLoading(false);
      }
    };

    if (shopId) fetchShop();
  }, [shopId]);

  if (loading) {
    return (
      <View style={styles.root}>
        <Text style={{ textAlign: 'center', marginTop: 40 }}>กำลังโหลดข้อมูล...</Text>
      </View>
    );
  }

  if (!shop) {
    return (
      <View style={styles.root}>
        <Text style={{ textAlign: 'center', marginTop: 40 }}>ไม่พบข้อมูลร้าน</Text>
      </View>
    );
  }

  const images = Array.isArray(shop.shopImageUrls) ? shop.shopImageUrls : [];

  return (
    <View style={styles.root}>
      <View style={styles.headerGreen}>
        <Image source={require('../assets/logo2.png')} style={styles.logo} />
        <Text style={styles.headerText}>THANGSISUK</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity>
            <Image source={require('../assets/location.png')} style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItemCenter} onPress={() => router.push('/')}>
            <Image source={require('../assets/logout.png')} style={styles.bottomIconCenter} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.titleRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/shop')}>
          <Image source={require('../assets/back.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <View style={styles.centerTitle}>
          <Image source={require('../assets/shop.png')} style={styles.shopIcon} />
          <Text style={styles.pageTitle}>ร้านรับซื้อ</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <Image
              source={shop.profileImageUrl ? { uri: shop.profileImageUrl } : require('../assets/profile.png')}
              style={styles.avatar}
            />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.label}>ชื่อร้าน: <Text style={styles.value}>{shop.shopName}</Text></Text>
              <Text style={styles.label}>เจ้าของ: <Text style={styles.value}>{shop.ownerName}</Text></Text>
            </View>
          </View>

          <Text style={styles.label}>ที่อยู่: <Text style={styles.value}>{shop.address}</Text></Text>
          <Text style={styles.label}>ตำบล/อำเภอ/จังหวัด: <Text style={styles.value}>{shop.amphoe}, {shop.district}, {shop.province} {shop.zipcode}</Text></Text>
          <Text style={styles.label}>ตำแหน่ง PIN: <Text style={styles.value}>{shop.pinAddress}</Text></Text>
          <Text style={styles.label}>ประเภทที่รับ: <Text style={styles.value}>{shop.category}</Text></Text>
          <Text style={styles.label}>เบอร์ติดต่อ: <Text style={styles.value}>{shop.phone}</Text></Text>
          <Text style={styles.label}>รายละเอียด: <Text style={styles.value}>{shop.detail}</Text></Text>

          {/* แสดงภาพร้านหลายภาพ */}
          {images.length > 0 && (
            <View style={styles.imageGrid}>
              {images.map((img, idx) => (
                <Image key={idx} source={{ uri: img }} style={styles.gridImage} resizeMode="cover" />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#eaf6b9',
  },
  headerGreen: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#B7E305',
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'space-between',
  },
  logo: { width: 40, height: 40, marginRight: 8 },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  icon: { width: 28, height: 28, marginLeft: 8 },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    flex: 1,
    marginLeft: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eaf6b9',
    padding: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    marginBottom: 8,
    justifyContent: 'flex-start',
  },
  backBtn: {
    padding: 4,
    marginRight: 8,
  },
  centerTitle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  backIcon: { width: 28, height: 28 },
  shopIcon: { width: 36, height: 36, marginRight: 8 },
  pageTitle: { fontSize: 20, fontWeight: 'bold', color: '#222' },
  scrollContainer: { padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e0e0e0',
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
    marginTop: 4,
  },
  value: {
    fontWeight: 'normal',
    color: '#333',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 6,
    justifyContent: 'flex-start',
  },
  gridImage: {
    width: 100,
    height: 80,
    borderRadius: 8,
    margin: 2,
    backgroundColor: '#eee',
  },
});
