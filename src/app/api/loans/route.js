import pool from '../../../lib/db';
import { NextResponse } from 'next/server';

// GET all loans
export async function GET() {
  try {
    const result = await pool.query(
      'SELECT *, TO_CHAR(emi_date, \'YYYY-MM-DD\') as emi_date FROM loans ORDER BY created_at DESC'
    );
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching loans:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch loans' },
      { status: 500 }
    );
  }
}

// POST - Create new loan
export async function POST(request) {
  try {
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

    // Generate number series
    const numberSeriesResult = await pool.query(
      `SELECT LPAD((COALESCE(MAX(CAST(number_series AS INTEGER)), 0) + 1)::TEXT, 3, '0') as number_series FROM loans`
    );
    const number_series = numberSeriesResult.rows[0].number_series;

    const result = await pool.query(
      `INSERT INTO loans (
        number_series, name, phone_no, email_id, reference_name, reference_phone,
        stage, bank_name, loan_ac_no, loan_amount, emi_date, emi_amount, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        number_series,
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
      ]
    );

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating loan:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create loan' },
      { status: 500 }
    );
  }
}
