import { db } from '../../../lib/firebase';
import { collection, getDocs, doc, setDoc, query, orderBy } from 'firebase/firestore';
import { NextResponse } from 'next/server';

// GET all hisab entries
export async function GET() {
  try {
    const q = query(collection(db, 'daily_hisab'), orderBy('created_at', 'desc'));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => {
      const docData = doc.data();
      const storedDate = docData.date || (docData.created_at ? docData.created_at.split('T')[0] : null);
      return {
        id: doc.id,
        ...docData,
        date: storedDate,
        entry_date: storedDate,
      };
    });

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
    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'No daily hisab entry created for zero or invalid amount'
      });
    }

    const newRecord = {
      type: type || '',
      amount: numericAmount,
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
