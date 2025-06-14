const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");

admin.initializeApp(); // Initialize Firebase Admin SDK

const LOCATIONIQ_API_KEY = "pk.8480f03915285ddcb4dbcc718b32297d"; // API key ของ LocationIQ

// ฟังก์ชันดึงพิกัดจาก LocationIQ
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
    }
    return null;
  } catch (error) {
    console.error("❌ Error fetching from LocationIQ:", error.message);
    return null;
  }
};

// ฟังก์ชันที่ทำงานเมื่อมีการเพิ่มร้านใหม่ใน Firestore
exports.addNewShop = functions.firestore
  .document("shops/{shopId}")  // ระบุ path ของ Firestore collection
  .onCreate(async (snapshot, context) => {
    const newShop = snapshot.data(); // ข้อมูลร้านใหม่ที่เพิ่มเข้าม

    console.log("New shop added:", newShop);

    // ตรวจสอบว่าร้านใหม่มีพิกัด (coords) หรือไม่ ถ้าไม่มีให้ใช้ค่าพิกัดเริ่มต้น
    if (!newShop.coords) {
      // ฟังก์ชันนี้จะเพิ่มพิกัดให้กับร้านใหม่โดยใช้ LocationIQ API
      const coords = await fetchCoordsFromLocationIQ(newShop.pinAddress); // สมมุติว่า fetchCoordsFromLocationIQ เป็นฟังก์ชันที่ดึงพิกัดจาก LocationIQ
      if (coords) {
        await admin.firestore().collection("shops").doc(context.params.shopId).update({
          coords: coords,
        });
        console.log(`✅ อัปเดตพิกัดร้าน: ${newShop.shopName}`);
      }
    }

    // การอัปเดตสถานะของร้าน
    await admin.firestore().collection("shops").doc(context.params.shopId).update({
      status: "Active",  // การอัปเดตสถานะหลังจากเพิ่มร้านใหม่
    });

    return null; // ถ้าฟังก์ชันไม่มีการ return ค่าอื่นๆ
  });

// ฟังก์ชันที่ทำงานเมื่อมีการอัปเดตร้านใน Firestore
exports.updateShopLocation = functions.firestore
  .document('shops/{shopId}')
  .onUpdate(async (change, context) => {
    const after = change.after.data(); // ข้อมูลร้านหลังจากการอัปเดต

    console.log('Shop updated:', after);

    // ถ้าเปลี่ยนแปลงที่อยู่ (pinAddress) ให้ทำการอัปเดตพิกัด
    if (after.pinAddress !== change.before.data().pinAddress) {
      const newCoords = await fetchCoordsFromLocationIQ(after.pinAddress);
      if (newCoords) {
        await admin.firestore().collection('shops').doc(context.params.shopId).update({
          coords: newCoords
        });
        console.log(`✅ อัปเดตพิกัดร้าน: ${after.shopName}`);
      }
    }

    return null;
  });
