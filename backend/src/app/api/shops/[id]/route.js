import { db } from '@/firebase';
import { doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { NextResponse } from 'next/server';

export async function DELETE(req, { params }) {
  const { id } = params;
  try {
    await deleteDoc(doc(db, 'shops', id));
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'ลบไม่สำเร็จ', detail: err.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  const { id } = params;
  const body = await req.json();

  try {
    await updateDoc(doc(db, 'shops', id), body);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'แก้ไขไม่สำเร็จ', detail: err.message }, { status: 500 });
  }
}
