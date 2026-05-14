import pool from '../../../../lib/db';
import { NextResponse } from 'next/server';

// PUT - Update a task
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { category, title, description, due_date, status } = body;

    const result = await pool.query(
      `UPDATE tasks 
       SET category = $1, title = $2, description = $3, due_date = $4, status = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [category, title, description, due_date || null, status, id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update task' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a task
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete task' },
      { status: 500 }
    );
  }
}
