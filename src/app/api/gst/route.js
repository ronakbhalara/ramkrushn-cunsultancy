import pool from '../../../lib/db';
import { NextResponse } from 'next/server';

// GET all GST records
export async function GET() {
  try {
    const result = await pool.query(
      'SELECT * FROM gst_records ORDER BY created_at DESC'
    );
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching GST records:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch GST records' },
      { status: 500 }
    );
  }
}

// POST - Create new GST record
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      name,
      phone_no,
      reference_name,
      reference_phone,
      pan_card_no,
      subject,
      gst_no,
      user_id,
      password,
      assessment_year,
      gst_filing_date,
      gst_filing_frequency
    } = body;

    // Generate number series
    const numberSeriesResult = await pool.query(
      `SELECT 'G-' || LPAD((COALESCE(MAX(CAST(SUBSTRING(number_series, 3) AS INTEGER)), 0) + 1)::TEXT, 2, '0') as number_series FROM gst_records WHERE number_series LIKE 'G-%'`
    );
    const number_series = numberSeriesResult.rows[0].number_series;

    const result = await pool.query(
      `INSERT INTO gst_records (
        number_series, name, phone_no, reference_name, reference_phone,
        pan_card_no, subject, gst_no, user_id, password, assessment_year,
        gst_filing_date, gst_filing_frequency
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        number_series,
        name,
        phone_no,
        reference_name,
        reference_phone,
        pan_card_no,
        subject,
        gst_no,
        user_id,
        password,
        JSON.stringify(assessment_year),
        gst_filing_date,
        gst_filing_frequency
      ]
    );

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating GST record:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create GST record' },
      { status: 500 }
    );
  }
}

// PUT - Update GST record
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
      subject,
      gst_no,
      user_id,
      password,
      assessment_year,
      gst_filing_date,
      gst_filing_frequency
    } = body;

    const result = await pool.query(
      `UPDATE gst_records SET 
        name = $1, phone_no = $2, reference_name = $3, reference_phone = $4,
        pan_card_no = $5, subject = $6, gst_no = $7, user_id = $8, password = $9,
        assessment_year = $10, gst_filing_date = $11, gst_filing_frequency = $12, updated_at = CURRENT_TIMESTAMP
      WHERE id = $13
      RETURNING *`,
      [
        name,
        phone_no,
        reference_name,
        reference_phone,
        pan_card_no,
        subject,
        gst_no,
        user_id,
        password,
        JSON.stringify(assessment_year),
        gst_filing_date,
        gst_filing_frequency,
        id
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'GST record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating GST record:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update GST record' },
      { status: 500 }
    );
  }
}

// DELETE - Delete GST record
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
      'DELETE FROM gst_records WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'GST record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'GST record deleted successfully' });
  } catch (error) {
    console.error('Error deleting GST record:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete GST record' },
      { status: 500 }
    );
  }
}
