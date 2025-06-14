import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function Header() {
  const router = useRouter();

  return (
    <View style={styles.header}>
      {/* Logo + THANGSISUK */}
      <View style={styles.leftGroup}>
        <Image source={require('../assets/logo2.png')} style={styles.logo} />
        <Text style={styles.headerText}>THANGSISUK</Text>
      </View>

      {/* Location + Logout Icons */}
      <View style={styles.rightGroup}>
        <TouchableOpacity onPress={() => router.push('/nearshops')} style={styles.iconContainer}>
          <Image source={require('../assets/location.png')} style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/')} style={styles.iconContainer}>
          <Image source={require('../assets/logout.png')} style={styles.icon} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',  // ทำให้กลุ่มซ้ายและขวาแยกออกจากกัน
    padding: 10, 
    backgroundColor: '#B7E305' 
  },
  logo: { 
    width: 40, 
    height: 40 
  },
  headerText: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginLeft: 10 
  },
  leftGroup: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 10 
  },
  rightGroup: { 
    flexDirection: 'row', 
    gap: 10 
  },
  icon: { 
    width: 24, 
    height: 24 
  },
  iconContainer: { 
    padding: 5 // เพิ่มการเว้นระยะระหว่างไอคอน
  }
});
