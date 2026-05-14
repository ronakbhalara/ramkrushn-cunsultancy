import pool from '../../../lib/db';
import { NextResponse } from 'next/server';

// GET all tasks
export async function GET() {
  try {
    const result = await pool.query(
      'SELECT *, TO_CHAR(due_date, \'YYYY-MM-DD\') as due_date FROM tasks ORDER BY created_at DESC'
    );
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

// POST - Create new task
export async function POST(request) {
  try {
    const body = await request.json();
    const { category, title, description, due_date, status } = body;

    const result = await pool.query(
      `INSERT INTO tasks (category, title, description, due_date, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [category, title, description, due_date || null, status || 'PENDING']
    );

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create task' },
      { status: 500 }
    );
  }
}
