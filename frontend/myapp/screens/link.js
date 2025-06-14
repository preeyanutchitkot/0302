import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import Header from '../components/header';
import BottomNav from '../components/BottomNav';

export default function LinkScreen({ route }) {
  const router = useRouter();

  const {
    facebook = '',
    idline = '',
    ig = '',
    phoneNumber = '',
  } = route?.params || {};
    console.log('facebook:', facebook);
  console.log('idline:', idline);
  console.log('ig:', ig);
  console.log('phoneNumber:', phoneNumber);

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
        >
          <Image
            source={require('../assets/back.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>

        <Text style={styles.title}>ช่องทางการติดต่อ</Text>

        <View style={styles.socialContainer}>
          <View style={styles.socialItem}>
            <Image
              source={require('../assets/facebook.png')}
              style={styles.icon}
            />
            <Text style={styles.socialText}>
              {facebook || 'ไม่มีข้อมูล'}
            </Text>
          </View>

          <View style={styles.socialItem}>
            <Image
              source={require('../assets/line.png')}
              style={styles.icon}
            />
            <Text style={styles.socialText}>
              {idline || 'ไม่มีข้อมูล'}
            </Text>
          </View>

          <View style={styles.socialItem}>
            <Image
              source={require('../assets/instagram.png')}
              style={styles.icon}
            />
            <Text style={styles.socialText}>
              {ig || 'ไม่มีข้อมูล'}
            </Text>
          </View>

          <View style={styles.socialItem}>
            <Image
              source={require('../assets/call.png')}
              style={styles.icon}
            />
            <Text style={styles.socialText}>
              {phoneNumber || 'ไม่มีข้อมูล'}
            </Text>
          </View>
        </View>
      </ScrollView>
      <BottomNav />
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#DEF19F' },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  backBtn: { position: 'absolute', top: 30, left: 20, zIndex: 10 },
  backIcon: { width: 30, height: 30, resizeMode: 'contain' },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 25,
    color: '#333',
    marginTop: 1,
  },
  socialContainer: {
    width: '50%',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  socialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 25,
    paddingLeft: 15,
  },
  icon: { width: 40, height: 40, resizeMode: 'contain', marginRight: 15 },
  socialText: { fontSize: 16, color: '#333', lineHeight: 60 },
});