import { db } from '../../../lib/firebase';
import { collection, getDocs, doc, setDoc, query, orderBy } from 'firebase/firestore';
import { NextResponse } from 'next/server';

// GET all tasks
export async function GET() {
  try {
    const q = query(collection(db, 'tasks'), orderBy('created_at', 'desc'));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(docSnap => {
      const task = docSnap.data();
      return {
        id: docSnap.id,
        ...task,
        due_date: task.due_date ? (typeof task.due_date === 'string' ? task.due_date.split('T')[0] : task.due_date) : null
      };
    });

    return NextResponse.json({ success: true, data });
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
    const { category, title, customer_name, customer_phone, note, description, status } = body;

    const newTaskRef = doc(collection(db, 'tasks'));
    const newTask = {
      category: category || 'LOAN',
      title: title || '',
      customer_name: customer_name || '',
      customer_phone: customer_phone || '',
      note: note || description || '',
      status: status || 'PENDING',
      created_at: new Date().toISOString()
    };

    await setDoc(newTaskRef, newTask);

    return NextResponse.json({
      success: true,
      data: { id: newTaskRef.id, ...newTask }
    });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create task' },
      { status: 500 }
    );
  }
}
