import pool from '../../../lib/db';
import { NextResponse } from 'next/server';

// GET all Loan Types
export async function GET() {
  try {
    const result = await pool.query(
      'SELECT id, type_name FROM loan_type ORDER BY id'
    );
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching loan types:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch loan types' },
      { status: 500 }
    );
  }
}

// POST - Create new Loan Type
export async function POST(request) {
  try {
    const body = await request.json();
    const { type_name } = body;

    const result = await pool.query(
      `INSERT INTO loan_type (type_name) VALUES ($1) RETURNING *`,
      [type_name]
    );

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating loan type:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create loan type' },
      { status: 500 }
    );
  }
}

// PUT - Update Loan Type
export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    const { type_name } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID is required' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `UPDATE loan_type SET 
        type_name = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *`,
      [type_name, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Loan type not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating loan type:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update loan type' },
      { status: 500 }
    );
  }
}

// DELETE - Delete Loan Type
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
      'DELETE FROM loan_type WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Loan type not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Loan type deleted successfully' });
  } catch (error) {
    console.error('Error deleting loan type:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete loan type' },
      { status: 500 }
    );
  }
}
