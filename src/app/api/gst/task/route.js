import pool from '../../../../lib/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { id, taskType } = body;

    if (!id || !taskType) {
      return NextResponse.json(
        { success: false, message: 'ID and taskType are required' },
        { status: 400 }
      );
    }

    let query = '';
    if (taskType === 'GSTR-1') {
      query = 'UPDATE gst_records SET last_gstr1_filed_date = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *';
    } else if (taskType === 'GSTR-3B') {
      query = 'UPDATE gst_records SET last_gstr3b_filed_date = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *';
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid taskType' },
        { status: 400 }
      );
    }

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'GST record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating GST task:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update GST task' },
      { status: 500 }
    );
  }
}
