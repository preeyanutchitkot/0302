// src/app/api/shops/route.js

import { db } from '@/firebase';
import { collection, getDocs, doc, setDoc, Timestamp } from 'firebase/firestore';
import { NextResponse } from 'next/server';

// GET: ดึงข้อมูลร้านค้า
export async function GET() {
  try {
    const snapshot = await getDocs(collection(db, 'shops'));
    const shops = snapshot.docs.map(doc => {
      const d = doc.data();
      return {
        docId: doc.id,
        ...d,
        createdAt:
          d.createdAt instanceof Timestamp
            ? d.createdAt.toDate().toLocaleString()
            : d.createdAt || '',
      };
    });

    return NextResponse.json(shops);
  } catch (error) {
    return NextResponse.json({ error: 'โหลดร้านค้าไม่สำเร็จ', detail: error.message }, { status: 500 });
  }
}

// POST: เพิ่มร้านค้าใหม่
export async function POST(req) {
  try {
    const data = await req.json();

    const newShopRef = doc(collection(db, 'shops'));
    const shopData = {
      ...data,
      createdAt: Timestamp.now(),
    };

    await setDoc(newShopRef, shopData);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'เพิ่มร้านค้าไม่สำเร็จ', detail: error.message }, { status: 500 });
  }
}