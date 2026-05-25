import { db } from '../../../lib/firebase';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { NextResponse } from 'next/server';

// GET all Settings
export async function GET() {
  try {
    const snapshot = await getDocs(collection(db, 'loan_status'));
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// POST - Create new Status
export async function POST(request) {
  try {
    const body = await request.json();
    const { status_name } = body;

    const newRef = doc(collection(db, 'loan_status'));
    const newData = { status_name, created_at: new Date().toISOString() };
    await setDoc(newRef, newData);

    return NextResponse.json({ success: true, data: { id: newRef.id, ...newData } });
  } catch (error) {
    console.error('Error creating status:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create status' },
      { status: 500 }
    );
  }
}

// PUT - Update Status
export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    const { status_name } = body;

    if (!id) return NextResponse.json({ success: false, message: 'ID is required' }, { status: 400 });

    const recordRef = doc(db, 'loan_status', id);
    await updateDoc(recordRef, { status_name, updated_at: new Date().toISOString() });
    
    return NextResponse.json({ success: true, data: { id, status_name } });
  } catch (error) {
    console.error('Error updating status:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update status' },
      { status: 500 }
    );
  }
}

// DELETE - Delete Status
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ success: false, message: 'ID is required' }, { status: 400 });

    await deleteDoc(doc(db, 'loan_status', id));

    return NextResponse.json({ success: true, message: 'Status deleted successfully' });
  } catch (error) {
    console.error('Error deleting status:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete status' },
      { status: 500 }
    );
  }
}
