import React from 'react';
import { View, TouchableOpacity, Image, Text, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';

const NavItem = ({ icon, label, onPress, active }) => {
  return (
    <TouchableOpacity style={styles.navItem} onPress={onPress}>
      <Image source={icon} style={[styles.navIcon, active && styles.navIconActive]} />
      <Text style={styles.navLabel}>{label}</Text>
    </TouchableOpacity>
  );
};

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const getActiveIndex = () => {
    switch (pathname) {
      case '/shop':
        return 0;
      case '/nearshops':
        return 1;
      case '/Post':
        return 2;
      case '/AppealStatusScreen':
        return 3;
      case '/appeal':
        return 4;
      default:
        return -1;
    }
  };

  const activeIndex = getActiveIndex();

  const handleNavItemPress = (route) => {
    router.push(route);
  };

  return (
    <View style={styles.navBar}>
      <NavItem
        icon={require('../assets/shop.png')}
        label="ร้านรับซื้อ"
        active={activeIndex === 0}
        onPress={() => handleNavItemPress('/shop')}
      />
      <NavItem
        icon={require('../assets/Group 132.png')}
        label="ร้านใกล้ฉัน"
        active={activeIndex === 1}
        onPress={() => handleNavItemPress('/nearshops')}
      />
      <TouchableOpacity style={styles.navItemCenter} onPress={() => handleNavItemPress('/Post')}>
        <Image source={require('../assets/plus.png')} style={styles.bottomIconCenter} />
      </TouchableOpacity>
      <NavItem
        icon={require('../assets/Clipboard.png')}
        label="ติดตาม"
        active={activeIndex === 3}
        onPress={() => handleNavItemPress('/point')}
      />
      <NavItem
        icon={require('../assets/Google forms.png')}
        label="ร้องเรียน"
        active={activeIndex === 4}
        onPress={() => handleNavItemPress('/appeal')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    width: '100%',
    borderTopWidth: 1,
    borderColor: '#ddd',
    elevation: 8,
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  navIcon: {
    width: 30,
    height: 30,
    tintColor: '#000',
  },
  navIconActive: {
    tintColor: '#B7E305',
  },
  navItemCenter: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -16,
    backgroundColor: '#fff',
    borderRadius: 30,
    width: 60,
    height: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  bottomIconCenter: {
    width: 30,
    height: 30,
  },
  navLabel: {
    fontSize: 11,
    marginTop: 3,
  },
});
