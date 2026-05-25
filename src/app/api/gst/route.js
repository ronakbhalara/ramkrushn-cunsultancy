import { db } from '../../../lib/firebase';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { NextResponse } from 'next/server';

// GET all GST records
export async function GET() {
  try {
    const q = query(collection(db, 'gst_records'), orderBy('created_at', 'desc'));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching GST records:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch GST records' },
      { status: 500 }
    );
  }
}

// POST - Create new GST record
export async function POST(request) {
  try {
    const body = await request.json();

    // Generate number series
    const snapshot = await getDocs(collection(db, 'gst_records'));
    let maxNum = 0;
    snapshot.forEach(docSnap => {
      const ns = docSnap.data().number_series;
      if (ns && ns.startsWith('G-')) {
        const num = parseInt(ns.substring(2));
        if (num > maxNum) maxNum = num;
      }
    });
    
    const newRecordRef = doc(collection(db, 'gst_records'));
    const newRecord = {
      ...body,
      number_series: `G-${maxNum + 1}`,
      assessment_year: body.assessment_year ? JSON.stringify(body.assessment_year) : null,
      created_at: new Date().toISOString()
    };
    
    await setDoc(newRecordRef, newRecord);

    return NextResponse.json({ success: true, data: { id: newRecordRef.id, ...newRecord } });
  } catch (error) {
    console.error('Error creating GST record:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create GST record' },
      { status: 500 }
    );
  }
}

// PUT - Update GST record
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID is required' }, { status: 400 });
    }

    if (updateData.assessment_year) {
       updateData.assessment_year = JSON.stringify(updateData.assessment_year);
    }
    updateData.updated_at = new Date().toISOString();

    const recordRef = doc(db, 'gst_records', id);
    await updateDoc(recordRef, updateData);

    return NextResponse.json({ success: true, data: { id, ...updateData } });
  } catch (error) {
    console.error('Error updating GST record:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update GST record' },
      { status: 500 }
    );
  }
}

// DELETE - Delete GST record
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID is required' },
        { status: 400 }
      );
    }

    const recordRef = doc(db, 'gst_records', id);
    await deleteDoc(recordRef);

    return NextResponse.json({ success: true, message: 'GST record deleted successfully' });
  } catch (error) {
    console.error('Error deleting GST record:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete GST record' },
      { status: 500 }
    );
  }
}
