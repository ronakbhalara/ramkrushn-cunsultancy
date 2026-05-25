import { db } from '../../../lib/firebase';
import { collection, getDocs, doc, setDoc, query, orderBy } from 'firebase/firestore';
import { NextResponse } from 'next/server';

// GET all hisab entries
export async function GET() {
  try {
    const q = query(collection(db, 'daily_hisab'), orderBy('created_at', 'desc'));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ 
       id: doc.id, 
       ...doc.data(),
       entry_date: doc.data().created_at ? doc.data().created_at.split('T')[0] : null
    }));
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching hisab entries:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch hisab entries' },
      { status: 500 }
    );
  }
}

// POST - Create new hisab entry
export async function POST(request) {
  try {
    const body = await request.json();
    const { type, amount, description, date } = body;

    const newRecordRef = doc(collection(db, 'daily_hisab'));
    const currentDate = new Date().toISOString().split("T")[0];

    const newRecord = {
      type: type || '',
      amount: amount || 0,
      description: description || '',
      date: date || currentDate,
      created_at: new Date().toISOString()
    };
    
    await setDoc(newRecordRef, newRecord);

    return NextResponse.json({
      success: true,
      data: { id: newRecordRef.id, ...newRecord }
    });
  } catch (error) {
    console.error('Error creating hisab entry:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create hisab entry' },
      { status: 500 }
    );
  }
}
