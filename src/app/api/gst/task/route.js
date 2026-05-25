import { db } from '../../../../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { id, taskType } = body;

    if (!id || !taskType) {
      return NextResponse.json({ success: false, message: 'ID and taskType are required' }, { status: 400 });
    }

    const recordRef = doc(db, 'gst_records', id);
    const recordSnap = await getDoc(recordRef);

    if (!recordSnap.exists()) {
      return NextResponse.json({ success: false, message: 'GST record not found' }, { status: 404 });
    }

    const updateData = {};
    if (taskType === 'GSTR-1') {
      updateData.last_gstr1_filed_date = new Date().toISOString();
    } else if (taskType === 'GSTR-3B') {
      updateData.last_gstr3b_filed_date = new Date().toISOString();
    } else {
      return NextResponse.json({ success: false, message: 'Invalid taskType' }, { status: 400 });
    }

    await updateDoc(recordRef, updateData);

    return NextResponse.json({ success: true, data: { id, ...recordSnap.data(), ...updateData } });
  } catch (error) {
    console.error('Error updating GST task:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update GST task' },
      { status: 500 }
    );
  }
}
