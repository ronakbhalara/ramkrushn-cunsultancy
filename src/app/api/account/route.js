import pool from '../../../lib/db';
import { NextResponse } from 'next/server';

// GET all Account records
export async function GET() {
  try {
    const result = await pool.query(
      'SELECT * FROM accounts ORDER BY created_at DESC'
    );
    return NextResponse.json({ success: true, data: result.rows });
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
      name,
      phone_no,
      status,
      date_time,
      payment_type,
      pending_amount,
      complete_amount
    } = body;

    // Generate number series
    const numberSeriesResult = await pool.query(
      `SELECT LPAD((COALESCE(MAX(CAST(number_series AS INTEGER)), 0) + 1)::TEXT, 3, '0') as number_series FROM accounts`
    );
    const number_series = numberSeriesResult.rows[0]?.number_series || '001';

    const result = await pool.query(
      `INSERT INTO accounts (
        number_series, name, phone_no, status, date_time, payment_type,
        pending_amount, complete_amount
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        number_series,
        name,
        phone_no,
        status,
        date_time,
        payment_type,
        pending_amount || 0,
        complete_amount || 0
      ]
    );

    return NextResponse.json({ success: true, data: result.rows[0] });
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
      id,
      name,
      phone_no,
      status,
      date_time,
      payment_type,
      pending_amount,
      complete_amount
    } = body;

    const result = await pool.query(
      `UPDATE accounts SET 
        name = $1, phone_no = $2, status = $3, date_time = $4, payment_type = $5,
        pending_amount = $6, complete_amount = $7, updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *`,
      [
        name,
        phone_no,
        status,
        date_time,
        payment_type,
        pending_amount || 0,
        complete_amount || 0,
        id
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Account record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
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
      return NextResponse.json(
        { success: false, message: 'ID is required' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      'DELETE FROM accounts WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Account record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Account record deleted successfully' });
  } catch (error) {
    console.error('Error deleting Account record:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete Account record' },
      { status: 500 }
    );
  }
}
