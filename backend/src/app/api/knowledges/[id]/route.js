import { db } from '@/firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import { NextResponse } from 'next/server';

export async function DELETE(_, { params }) {
  const { id } = params;
  await deleteDoc(doc(db, 'knowledges', id));
  return NextResponse.json({ success: true });
}
