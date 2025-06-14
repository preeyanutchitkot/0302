import { db } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const snapshot = await getDocs(collection(db, 'users'));
    const users = snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    }));
    return NextResponse.json(users);
  } catch (err) {
    return NextResponse.json({ error: 'โหลดล้มเหลว', detail: err.message }, { status: 500 });
  }
}
