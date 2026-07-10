import { db } from '../../../../lib/firebase';
import { doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { NextResponse } from 'next/server';

// PUT - Update a task
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { category, title, customer_name, customer_phone, note, description, status } = body;

    const recordRef = doc(db, 'tasks', id);
    const snap = await getDoc(recordRef);
    if (!snap.exists()) {
      return NextResponse.json(
        { success: false, message: 'Task not found' },
        { status: 404 }
      );
    }

    const updateData = {
      category: category || 'LOAN',
      title: title || '',
      customer_name: customer_name || '',
      customer_phone: customer_phone || '',
      note: note || description || '',
      status: status || '',
      updated_at: new Date().toISOString()
    };

    await updateDoc(recordRef, updateData);

    return NextResponse.json({
      success: true,
      data: { id, ...snap.data(), ...updateData }
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

    const recordRef = doc(db, 'tasks', id);
    const snap = await getDoc(recordRef);
    if (!snap.exists()) {
      return NextResponse.json(
        { success: false, message: 'Task not found' },
        { status: 404 }
      );
    }

    await deleteDoc(recordRef);

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
