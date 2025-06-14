import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { auth } from '../config/firebase-config'; // ✅ Firebase Auth

export default function RootLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <Stack initialRouteName={isLoggedIn ? "home" : "login"}>
      {/* เส้นทางต่างๆ ที่กำหนดในแอป */}
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="forgotpassword" options={{ headerShown: false }} />
      <Stack.Screen name="contract" options={{ headerShown: false }} />
      <Stack.Screen name="shop" options={{ headerShown: false }} />
      <Stack.Screen name="Post" options={{ headerShown: false }} />
      <Stack.Screen name="detail" options={{ headerShown: false }} />
      <Stack.Screen name="registershop" options={{ headerShown: false }} />
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="lookpost" options={{ headerShown: false }} />
      <Stack.Screen name="donate" options={{ headerShown: false }} />
      <Stack.Screen name="NoShop" options={{ headerShown: false }} />
      <Stack.Screen name="link" options={{ headerShown: false }} />
      <Stack.Screen name="ShopProfileScreen" options={{ headerShown: false }} />
      <Stack.Screen name="MyShopScreen" options={{ headerShown: false }} />
       <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="nearshops" options={{ headerShown: false }} />
    </Stack>
  );
}
