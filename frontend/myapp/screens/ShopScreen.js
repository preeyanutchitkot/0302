import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, TextInput } from 'react-native';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase-config';
import { useRouter } from 'expo-router';
import Header from '../components/header';
import BottomNav from '../components/BottomNav';

export default function ShopScreen() {
  const [shops, setShops] = useState([]);
  const [search, setSearch] = useState('');
  const router = useRouter();

  useEffect(() => {
    const q = query(collection(db, 'shops'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const shopList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setShops(shopList);
    });
    return () => unsubscribe();
  }, []);

  const filteredShops = shops.filter(shop =>
    shop.shopName?.toLowerCase().includes(search.toLowerCase()) ||
    shop.address?.toLowerCase().includes(search.toLowerCase()) ||
    shop.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.root}>
      <Header />

      {/* Section Title */}
      <View style={styles.titleRow}>
        <View style={styles.titleLeft}>
          <Image source={require('../assets/shop.png')} style={styles.shopIcon} />
          <Text style={styles.pageTitle}>ร้านรับซื้อ</Text>
        </View>
        <TouchableOpacity style={styles.signupButton} onPress={() => router.push('/registershop')}>
          <Text style={styles.signupText}>สมัครร้านรับซื้อ</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="กรอกข้อมูลที่จะค้นหา..."
          value={search}
          onChangeText={setSearch}
        />
        <Image source={require('../assets/Search.png')} style={styles.searchIcon} />
      </View>

      {/* รายการร้าน */}
      <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
        {filteredShops.length === 0 ? (
          <Text style={{ color: '#888', textAlign: 'center', marginTop: 40 }}>ไม่มีข้อมูลร้าน</Text>
        ) : (
          filteredShops.map((shop, idx) => (
            <View key={shop.id || idx} style={styles.card}>
              <Image
                source={shop.profileImageUrl ? { uri: shop.profileImageUrl } : require('../assets/profile.png')}
                style={styles.avatar}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>ชื่อร้าน: <Text style={styles.value}>{shop.shopName || ''}</Text></Text>
                <Text style={styles.label}>ที่อยู่: <Text style={styles.value}>{shop.address || ''}</Text></Text>
                <Text style={styles.label}>ประเภทที่รับ: <Text style={styles.value}>{shop.category || ''}</Text></Text>
                <Text style={styles.label}>เบอร์ติดต่อ: <Text style={styles.value}>{shop.phone || ''}</Text></Text>
              </View>
              <TouchableOpacity
                style={styles.detailButton}
                onPress={() => router.push({ pathname: '/detail', params: { shopId: shop.id } })}
              >
                <Text style={styles.detailButtonText}>เพิ่มเติม</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 10,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  titleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shopIcon: {
    width: 28,
    height: 28,
    marginRight: 8,
  },
  pageTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#222',
  },
  signupButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderColor: '#B7E305',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  signupText: {
    color: '#222',
    fontWeight: 'bold',
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f9e4',
    borderRadius: 20,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: 'transparent',
    fontSize: 15,
  },
  searchIcon: {
    width: 22,
    height: 22,
    tintColor: '#888',
  },

  listContainer: {
    paddingBottom: 120,
    paddingHorizontal: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'white',
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 14,
    borderWidth: 2,
    borderColor: '#B7E305',
    backgroundColor: '#f5f9e4',
  },
  label: {
    color: '#888',
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 2,
  },
  value: {
    color: '#444',
    fontWeight: 'normal',
  },
  detailButton: {
    backgroundColor: '#B7E305',
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
    alignSelf: 'flex-end',
    paddingHorizontal: 18,
    paddingVertical: 4,
  },
  detailButtonText: {
    color: '#222',
    fontWeight: 'bold',
  },
});
