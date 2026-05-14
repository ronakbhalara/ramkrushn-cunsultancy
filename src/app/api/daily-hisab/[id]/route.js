import pool from '../../../../lib/db';
import { NextResponse } from 'next/server';

// DELETE - Delete a hisab entry
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const result = await pool.query(
      'DELETE FROM daily_hisab WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Entry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Entry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting entry:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete entry' },
      { status: 500 }
    );
  }
}
