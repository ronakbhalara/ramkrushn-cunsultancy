import pool from '../../../../lib/db';
import { NextResponse } from 'next/server';

// GET payments for a specific account
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');

    if (!accountId) {
      return NextResponse.json(
        { success: false, message: 'Account ID is required' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      'SELECT * FROM account_payments WHERE account_id = $1 ORDER BY payment_date DESC, created_at DESC',
      [accountId]
    );

    return NextResponse.json({ success: true, data: result.rows });
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
  const client = await pool.connect();
  try {
    const body = await request.json();
    const { accountId, amount, date, note, paymentType } = body;

    if (!accountId || !amount || !date) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    await client.query('BEGIN');

    // 1. Get current account details
    const accountResult = await client.query(
      'SELECT pending_amount, complete_amount FROM accounts WHERE id = $1 FOR UPDATE',
      [accountId]
    );

    if (accountResult.rows.length === 0) {
      throw new Error('Account not found');
    }

    const { pending_amount: currentPaid, complete_amount: totalAmount } = accountResult.rows[0];
    const newPaidAmount = parseFloat(currentPaid || 0) + parseFloat(amount);
    const remaining = parseFloat(totalAmount || 0) - parseFloat(currentPaid || 0);

    if (parseFloat(amount) > remaining + 0.01) { // small buffer for float precision
      return NextResponse.json(
        { success: false, message: `Payment exceeds remaining balance of ₹${remaining.toFixed(2)}` },
        { status: 400 }
      );
    }

    // 2. Insert payment record
    const paymentResult = await client.query(
      `INSERT INTO account_payments (account_id, amount, payment_date, note, payment_type)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [accountId, amount, date, note, paymentType]
    );

    // 3. Update account total paid and status
    const newStatus = (newPaidAmount >= parseFloat(totalAmount) && parseFloat(totalAmount) > 0) ? 'COMPLETE' : 'RECEIPT';

    await client.query(
      `UPDATE accounts 
       SET pending_amount = $1,
           status = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [newPaidAmount, newStatus, accountId]
    );

    await client.query('COMMIT');

    return NextResponse.json({
      success: true,
      data: paymentResult.rows[0],
      message: 'Payment added successfully'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adding payment:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to add payment' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
// PUT - Update a payment
export async function PUT(request) {
  const client = await pool.connect();
  try {
    const body = await request.json();
    const { id, amount, date, note, paymentType } = body;

    if (!id || !amount || !date) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    await client.query('BEGIN');

    // 1. Get the old payment details
    const oldPaymentResult = await client.query(
      'SELECT account_id, amount FROM account_payments WHERE id = $1 FOR UPDATE',
      [id]
    );

    if (oldPaymentResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Payment record not found' },
        { status: 404 }
      );
    }

    const { account_id: accountId, amount: oldAmount } = oldPaymentResult.rows[0];

    // 2. Get account details to check balance
    const accountResult = await client.query(
      'SELECT pending_amount, complete_amount FROM accounts WHERE id = $1 FOR UPDATE',
      [accountId]
    );

    const { pending_amount: currentPaid, complete_amount: totalAmount } = accountResult.rows[0];

    // Recalculate what the new paid amount would be
    const adjustedPaidAmount = parseFloat(currentPaid || 0) - parseFloat(oldAmount || 0) + parseFloat(amount);

    if (adjustedPaidAmount > parseFloat(totalAmount) + 0.01) {
      return NextResponse.json(
        { success: false, message: `Updated payment exceeds total amount. Max allowed: ₹${(parseFloat(totalAmount) - (parseFloat(currentPaid) - parseFloat(oldAmount))).toFixed(2)}` },
        { status: 400 }
      );
    }

    // 3. Update payment record
    await client.query(
      `UPDATE account_payments 
       SET amount = $1, payment_date = $2, note = $3, payment_type = $4, created_at = CURRENT_TIMESTAMP
       WHERE id = $5`,
      [amount, date, note, paymentType, id]
    );

    // 4. Update account status
    const newStatus = (adjustedPaidAmount >= parseFloat(totalAmount) && parseFloat(totalAmount) > 0) ? 'COMPLETE' : 'RECEIPT';

    await client.query(
      `UPDATE accounts 
       SET pending_amount = $1,
           status = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [adjustedPaidAmount, newStatus, accountId]
    );

    await client.query('COMMIT');

    return NextResponse.json({ success: true, message: 'Payment updated successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating payment:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update payment' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
