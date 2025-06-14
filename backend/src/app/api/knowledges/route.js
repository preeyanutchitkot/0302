import { db } from '@/firebase';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { NextResponse } from 'next/server';

export async function GET() {
  const querySnapshot = await getDocs(collection(db, 'knowledges'));
  const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return NextResponse.json(data);
}

export async function POST(req) {
  const body = await req.json();
  if (!body.imageUrl || !body.position) {
    return NextResponse.json({ error: 'ต้องระบุ imageUrl และ position' }, { status: 400 });
  }
  const docRef = await addDoc(collection(db, 'knowledges'), {
    ...body,
    createdAt: serverTimestamp()
  });
  return NextResponse.json({ id: docRef.id });
}
