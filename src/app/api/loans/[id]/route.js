import pool from '../../../../lib/db';
import { NextResponse } from 'next/server';

// GET single loan by ID
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const result = await pool.query(
      'SELECT * FROM loans WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Loan not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching loan:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch loan' },
      { status: 500 }
    );
  }
}

// PUT - Update loan
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      name,
      phone_no,
      email_id,
      reference_name,
      reference_phone,
      stage,
      bank_name,
      loan_ac_no,
      loan_amount,
      emi_date,
      emi_amount,
      notes,
    } = body;

    const result = await pool.query(
      `UPDATE loans SET
        name = $1,
        phone_no = $2,
        email_id = $3,
        reference_name = $4,
        reference_phone = $5,
        stage = $6,
        bank_name = $7,
        loan_ac_no = $8,
        loan_amount = $9,
        emi_date = $10,
        emi_amount = $11,
        notes = $12,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $13
      RETURNING *`,
      [
        name,
        phone_no,
        email_id,
        reference_name,
        reference_phone,
        stage,
        bank_name,
        loan_ac_no,
        loan_amount,
        emi_date,
        emi_amount,
        notes,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Loan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating loan:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update loan' },
      { status: 500 }
    );
  }
}

// DELETE - Delete loan
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const result = await pool.query(
      'DELETE FROM loans WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Loan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Loan deleted successfully' });
  } catch (error) {
    console.error('Error deleting loan:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete loan' },
      { status: 500 }
    );
  }
}
