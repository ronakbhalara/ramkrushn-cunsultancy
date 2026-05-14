import pool from '../../../lib/db';
import { NextResponse } from 'next/server';

// GET all hisab entries
export async function GET() {
  try {
    const result = await pool.query(
      'SELECT *, TO_CHAR(created_at, \'YYYY-MM-DD\') as entry_date FROM daily_hisab ORDER BY created_at DESC'
    );
    return NextResponse.json({ success: true, data: result.rows });
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

    const result = await pool.query(
      `INSERT INTO daily_hisab (type, amount, description)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [type, amount, description]
    );

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating hisab entry:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create hisab entry' },
      { status: 500 }
    );
  }
}
