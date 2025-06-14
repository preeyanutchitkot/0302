import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/header';
import BottomNav from '../components/BottomNav';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const AppealStatusScreen = () => {
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);

  const db = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    const fetchAppeals = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(collection(db, 'appeal'), where('uid', '==', user.uid));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAppeals(data);
      setLoading(false);
    };

    fetchAppeals();
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'รับเรื่องแล้ว': return styles.statusReceived;
      case 'กำลังดำเนินการ': return styles.statusInProgress;
      case 'เสร็จสิ้น': return styles.statusDone;
      default: return {};
    }
  };

  return (
    <View style={styles.flex}>
      <Header />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerBox}>
          <Text style={styles.agencyName}>THANGSISUK</Text>
          <Ionicons name="location-outline" size={20} color="#333" />
        </View>
        <Text style={styles.title}>สถานะคำร้อง</Text>
        <Text style={styles.subtitle}>ติดตามสถานะการร้องเรียน</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#B7E305" />
        ) : appeals.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 20, color: '#888' }}>ยังไม่มีคำร้องของคุณ</Text>
        ) : (
          appeals.map((item) => (
            <View key={item.id} style={styles.card}>
              <Text style={styles.issue}>{item.title}</Text>
              <View style={styles.statusBar}>
                <View style={[styles.statusDot, getStatusStyle(item.status)]} />
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
      <BottomNav />
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: 16, paddingBottom: 80 },
  headerBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#B7E305',
    padding: 12,
    borderRadius: 8
  },
  agencyName: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  title: { fontSize: 18, fontWeight: 'bold', marginTop: 20 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 12 },
  card: {
    backgroundColor: '#f3fcd5',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12
  },
  issue: { fontSize: 15, marginBottom: 8, color: '#333' },
  statusBar: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  statusText: { fontSize: 14 },
  statusReceived: { backgroundColor: '#f44336' },
  statusInProgress: { backgroundColor: '#ffc107' },
  statusDone: { backgroundColor: '#4caf50' },
});

export default AppealStatusScreen;
