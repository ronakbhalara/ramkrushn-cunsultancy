import pool from '../../../lib/db';
import { NextResponse } from 'next/server';

// GET all Settings
export async function GET() {
  try {
    const result = await pool.query(
      'SELECT id, status_name FROM loan_status ORDER BY id'
    );
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// POST - Create new Status
export async function POST(request) {
  try {
    const body = await request.json();
    const { status_name } = body;

    const result = await pool.query(
      `INSERT INTO loan_status (status_name) VALUES ($1) RETURNING *`,
      [status_name]
    );

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating status:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create status' },
      { status: 500 }
    );
  }
}

// PUT - Update Status
export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    const { status_name } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID is required' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `UPDATE loan_status SET 
        status_name = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *`,
      [status_name, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Status not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating status:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update status' },
      { status: 500 }
    );
  }
}

// DELETE - Delete Status
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
      'DELETE FROM loan_status WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Status not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Status deleted successfully' });
  } catch (error) {
    console.error('Error deleting status:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete status' },
      { status: 500 }
    );
  }
}

