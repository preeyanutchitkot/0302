
import { db } from '@/firebase';
import { doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { NextResponse } from 'next/server';

export async function DELETE(_, { params }) {
  const { id } = params;
  try {
    await deleteDoc(doc(db, 'users', id));
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'ลบไม่สำเร็จ', detail: err.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  const { id } = params;
  const data = await req.json();
  try {
    await updateDoc(doc(db, 'users', id), data);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'อัปเดตไม่สำเร็จ', detail: err.message }, { status: 500 });
  }
}
