import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import axios from 'axios';

// 🔐 ข้อมูล Firebase Config ของคุณ
const firebaseConfig = {
  apiKey: "AIzaSyCcioU-ZElHNPjbFMIeLDr0UjHC-LRFxJY",
  authDomain: "project-scripting-e2427.firebaseapp.com",
  projectId: "project-scripting-e2427",
  storageBucket: "project-scripting-e2427.appspot.com",
  messagingSenderId: "55288593922",
  appId: "1:55288593922:web:87bea2a526ce44bd65711b"
};

// ✅ Login ด้วย email & password
const EMAIL = "aphichetautsanew@gmail.com";
const PASSWORD = "0989965402";

// ✅ API Key จาก LocationIQ
const LOCATIONIQ_API_KEY = "pk.8480f03915285ddcb4dbcc718b32297d";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 🔍 ฟังก์ชันเรียกพิกัดจาก LocationIQ
const fetchCoordsFromLocationIQ = async (address) => {
  const encoded = encodeURIComponent(address);
  const url = `https://us1.locationiq.com/v1/search.php?key=${LOCATIONIQ_API_KEY}&q=${encoded}&format=json`;

  try {
    const response = await axios.get(url);
    const result = response.data[0];
    if (result) {
      return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
      };
    } else {
      console.warn("ไม่พบข้อมูลพิกัดจาก LocationIQ สำหรับที่อยู่:", address);
      return null;
    }
  } catch (error) {
    console.error("❌ Error fetching from LocationIQ:", error.message);
    return null;
  }
};

// 🎯 อัปเดตพิกัดร้าน
const updateAllShops = async () => {
  try {
    // เข้าสู่ระบบด้วย Firebase Authentication
    await signInWithEmailAndPassword(auth, EMAIL, PASSWORD);
    console.log("✅ Login สำเร็จ!");

    const snapshot = await getDocs(collection(db, 'shops'));
    let count = 0;

    // ลูปผ่านทุกเอกสาร (ร้าน)
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();

      // ถ้ายังไม่มีพิกัด (coords) และมีที่อยู่ (pinAddress)
      if (!data.coords && data.pinAddress) {
        // แปลงที่อยู่ (pinAddress) ที่มีอยู่แล้วให้เป็นพิกัด
        const coords = await fetchCoordsFromLocationIQ(data.pinAddress);
        if (coords) {
          // อัปเดตข้อมูลร้านใน Firestore
          await updateDoc(doc(db, 'shops', docSnap.id), { coords });
          console.log(`✅ อัปเดตพิกัดร้าน: ${data.shopName}`);
          count++;
        } else {
          console.warn(`⚠️ ไม่พบพิกัดของ: ${data.shopName}`);
        }
      }
    }

    console.log(`🎉 อัปเดตร้านสำเร็จ ${count} รายการ`);
  } catch (err) {
    console.error("❌ ล้มเหลว:", err.message);
  }
};

// เรียกใช้ฟังก์ชันหลัก //
updateAllShops();
