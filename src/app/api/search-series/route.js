import pool from '../../../lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const series = searchParams.get('series');

    if (!series) {
      return NextResponse.json(
        { success: false, message: 'Series number is required' },
        { status: 400 }
      );
    }

    let result;

    // Search in Loans
    if (series.startsWith('L-')) {
      result = await pool.query(
        'SELECT name, phone_no, reference_name, reference_phone FROM loans WHERE number_series = $1',
        [series]
      );
    } 
    // Search in GST
    else if (series.startsWith('G-')) {
      result = await pool.query(
        'SELECT name, phone_no, reference_name, reference_phone FROM gst_records WHERE number_series = $1',
        [series]
      );
    }
    // Search in Income Tax
    else if (series.startsWith('I-')) {
      result = await pool.query(
        'SELECT name, phone_no, reference_name, reference_phone FROM income_tax_records WHERE number_series = $1',
        [series]
      );
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid series format' },
        { status: 400 }
      );
    }

    if (result.rows.length > 0) {
      return NextResponse.json({ success: true, data: result.rows[0] });
    } else {
      return NextResponse.json(
        { success: false, message: 'Record not found for this series number' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error searching series:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
