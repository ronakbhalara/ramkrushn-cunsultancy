import { db } from '../../../lib/firebase';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { NextResponse } from 'next/server';

// GET all Account records
export async function GET() {
  try {
    const q = query(collection(db, 'accounts'), orderBy('created_at', 'desc'));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching Account records:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch Account records' },
      { status: 500 }
    );
  }
}

// POST - Create new Account record
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      name, phone_no, status, date_time, payment_type,
      pending_amount, complete_amount, reference_name, reference_phone, payment_note
    } = body;

    // Generate number series
    const snapshot = await getDocs(collection(db, 'accounts'));
    let maxNum = 0;
    snapshot.forEach(docSnap => {
      const ns = docSnap.data().number_series;
      if (ns) {
        const num = parseInt(ns, 10);
        if (num > maxNum) maxNum = num;
      }
    });
    const number_series = String(maxNum + 1).padStart(3, '0');
    
    const finalStatus = (parseFloat(pending_amount) >= parseFloat(complete_amount) && parseFloat(complete_amount) > 0) ? 'COMPLETE' : status;

    const newAccountRef = doc(collection(db, 'accounts'));
    const newAccount = {
      number_series,
      name: name || '',
      phone_no: phone_no || '',
      status: finalStatus || '',
      date_time: date_time || null,
      pending_amount: pending_amount || 0,
      complete_amount: complete_amount || 0,
      reference_name: reference_name || '',
      reference_phone: reference_phone || '',
      created_at: new Date().toISOString()
    };
    
    await setDoc(newAccountRef, newAccount);
    newAccount.id = newAccountRef.id;

    // If initial payment exists, add to payment history
    if (parseFloat(pending_amount) > 0) {
      const paymentRef = doc(collection(db, 'account_payments'));
      await setDoc(paymentRef, {
        account_id: newAccount.id,
        amount: pending_amount,
        payment_date: date_time,
        note: payment_note || 'Initial Payment',
        payment_type: payment_type || '',
        created_at: new Date().toISOString()
      });
    }

    return NextResponse.json({ success: true, data: newAccount });
  } catch (error) {
    console.error('Error creating Account record:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create Account record' },
      { status: 500 }
    );
  }
}

// PUT - Update Account record
export async function PUT(request) {
  try {
    const body = await request.json();
    const {
      id, name, phone_no, status, date_time, payment_type,
      pending_amount, complete_amount, reference_name, reference_phone
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID is required' }, { status: 400 });
    }

    const updateData = {
      name: name || '',
      phone_no: phone_no || '',
      status: status || '',
      date_time: date_time || null,
      pending_amount: pending_amount || 0,
      complete_amount: complete_amount || 0,
      reference_name: reference_name || '',
      reference_phone: reference_phone || '',
      updated_at: new Date().toISOString()
    };

    const recordRef = doc(db, 'accounts', id);
    await updateDoc(recordRef, updateData);

    return NextResponse.json({ success: true, data: { id, ...updateData } });
  } catch (error) {
    console.error('Error updating Account record:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update Account record' },
      { status: 500 }
    );
  }
}

// DELETE - Delete Account record
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID is required' }, { status: 400 });
    }

    const recordRef = doc(db, 'accounts', id);
    await deleteDoc(recordRef);

    return NextResponse.json({ success: true, message: 'Account record deleted successfully' });
  } catch (error) {
    console.error('Error deleting Account record:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete Account record' },
      { status: 500 }
    );
  }
}
