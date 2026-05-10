import pool from '../../../lib/db';
import { NextResponse } from 'next/server';

// GET all Income Tax records
export async function GET() {
  try {
    const result = await pool.query(
      'SELECT * FROM income_tax_records ORDER BY created_at DESC'
    );
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching Income Tax records:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch Income Tax records' },
      { status: 500 }
    );
  }
}

// POST - Create new Income Tax record
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      name,
      phone_no,
      reference_name,
      reference_phone,
      pan_card_no,
      password,
      assessment_year
    } = body;

    // Generate number series
    const numberSeriesResult = await pool.query(
      `SELECT LPAD((COALESCE(MAX(CAST(number_series AS INTEGER)), 0) + 1)::TEXT, 3, '0') as number_series FROM income_tax_records`
    );
    const number_series = numberSeriesResult.rows[0]?.number_series || '001';

    const result = await pool.query(
      `INSERT INTO income_tax_records (
        number_series, name, phone_no, reference_name, reference_phone,
        pan_card_no, password, assessment_year
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        number_series,
        name,
        phone_no,
        reference_name,
        reference_phone,
        pan_card_no,
        password,
        JSON.stringify(assessment_year)
      ]
    );

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating Income Tax record:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create Income Tax record' },
      { status: 500 }
    );
  }
}

// PUT - Update Income Tax record
export async function PUT(request) {
  try {
    const body = await request.json();
    const {
      id,
      name,
      phone_no,
      reference_name,
      reference_phone,
      pan_card_no,
      password,
      assessment_year
    } = body;

    const result = await pool.query(
      `UPDATE income_tax_records SET 
        name = $1, phone_no = $2, reference_name = $3, reference_phone = $4,
        pan_card_no = $5, password = $6, assessment_year = $7, updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *`,
      [
        name,
        phone_no,
        reference_name,
        reference_phone,
        pan_card_no,
        password,
        JSON.stringify(assessment_year),
        id
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Income Tax record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating Income Tax record:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update Income Tax record' },
      { status: 500 }
    );
  }
}

// DELETE - Delete Income Tax record
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
      'DELETE FROM income_tax_records WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Income Tax record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Income Tax record deleted successfully' });
  } catch (error) {
    console.error('Error deleting Income Tax record:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete Income Tax record' },
      { status: 500 }
    );
  }
}
