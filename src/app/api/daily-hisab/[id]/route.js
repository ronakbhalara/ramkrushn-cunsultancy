import { db } from '../../../../lib/firebase';
import { doc, deleteDoc, getDoc } from 'firebase/firestore';
import { NextResponse } from 'next/server';

// DELETE - Delete a hisab entry
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const recordRef = doc(db, 'daily_hisab', id);
    const snap = await getDoc(recordRef);
    if (!snap.exists()) {
      return NextResponse.json(
        { success: false, message: 'Entry not found' },
        { status: 404 }
      );
    }
    
    await deleteDoc(recordRef);

    return NextResponse.json({
      success: true,
      message: 'Entry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting entry:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete entry' },
      { status: 500 }
    );
  }
}
