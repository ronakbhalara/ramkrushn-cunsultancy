import { db } from '../../../../lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, setDoc, orderBy } from 'firebase/firestore';
import { NextResponse } from 'next/server';
import { resolveAccountStatus } from '../../../../lib/accountStatus.mjs';

// GET payments for a specific account
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');

    if (!accountId) {
      return NextResponse.json({ success: false, message: 'Account ID is required' }, { status: 400 });
    }

    const q = query(collection(db, 'account_payments'), where('account_id', '==', accountId));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => new Date(b.payment_date || 0) - new Date(a.payment_date || 0));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

// POST - Add a new payment
export async function POST(request) {
  try {
    const body = await request.json();
    const { accountId, amount, date, note, paymentType } = body;

    if (!accountId || !amount || !date) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    const accountRef = doc(db, 'accounts', accountId);
    const accountSnap = await getDoc(accountRef);

    if (!accountSnap.exists()) {
      return NextResponse.json({ success: false, message: 'Account not found' }, { status: 404 });
    }

    const accountData = accountSnap.data();
    const currentPaid = parseFloat(accountData.pending_amount || 0);
    const totalAmount = parseFloat(accountData.complete_amount || 0);
    const accountName = accountData.name;
    const newPaidAmount = currentPaid + parseFloat(amount);
    const remaining = totalAmount - currentPaid;

    if (parseFloat(amount) > remaining + 0.01) {
      return NextResponse.json(
        { success: false, message: `Payment exceeds remaining balance of ₹${remaining.toFixed(2)}` },
        { status: 400 }
      );
    }

    // 2. Insert payment record
    const paymentRef = doc(collection(db, 'account_payments'));
    const paymentData = {
      account_id: accountId,
      amount,
      payment_date: date,
      note: note || '',
      payment_type: paymentType || '',
      created_at: new Date().toISOString()
    };
    await setDoc(paymentRef, paymentData);

    // 3. Update account total paid and status
    const newStatus = resolveAccountStatus({
      status: accountData.status,
      pendingAmount: newPaidAmount,
      completeAmount: totalAmount,
    });
    await updateDoc(accountRef, {
      pending_amount: newPaidAmount,
      status: newStatus,
      updated_at: new Date().toISOString()
    });

    // 4. Insert into daily_hisab as INCOME
    const hisabDescription = `Account Payment - ${accountName}${note ? ` (${note})` : ''}`;
    const hisabRef = doc(collection(db, 'daily_hisab'));
    await setDoc(hisabRef, {
      type: 'INCOME',
      amount,
      description: hisabDescription,
      date: date,
      created_at: date ? new Date(date).toISOString() : new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      data: { id: paymentRef.id, ...paymentData },
      message: 'Payment added successfully'
    });
  } catch (error) {
    console.error('Error adding payment:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to add payment' },
      { status: 500 }
    );
  }
}

// PUT - Update a payment
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, amount, date, note, paymentType } = body;

    if (!id || !amount || !date) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    const paymentRef = doc(db, 'account_payments', id);
    const paymentSnap = await getDoc(paymentRef);

    if (!paymentSnap.exists()) {
      return NextResponse.json({ success: false, message: 'Payment record not found' }, { status: 404 });
    }

    const oldPaymentData = paymentSnap.data();
    const accountId = oldPaymentData.account_id;
    const oldAmount = parseFloat(oldPaymentData.amount || 0);

    const accountRef = doc(db, 'accounts', accountId);
    const accountSnap = await getDoc(accountRef);
    const accountData = accountSnap.data();

    const currentPaid = parseFloat(accountData.pending_amount || 0);
    const totalAmount = parseFloat(accountData.complete_amount || 0);

    const adjustedPaidAmount = currentPaid - oldAmount + parseFloat(amount);

    if (adjustedPaidAmount > totalAmount + 0.01) {
      return NextResponse.json(
        { success: false, message: `Updated payment exceeds total amount.` },
        { status: 400 }
      );
    }

    await updateDoc(paymentRef, {
      amount,
      payment_date: date,
      note: note || '',
      payment_type: paymentType || '',
      updated_at: new Date().toISOString()
    });

    const newStatus = resolveAccountStatus({
      status: accountData.status,
      pendingAmount: adjustedPaidAmount,
      completeAmount: totalAmount,
    });
    await updateDoc(accountRef, {
      pending_amount: adjustedPaidAmount,
      status: newStatus,
      updated_at: new Date().toISOString()
    });

    return NextResponse.json({ success: true, message: 'Payment updated successfully' });
  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update payment' },
      { status: 500 }
    );
  }
}
