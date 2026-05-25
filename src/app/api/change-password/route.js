import { NextResponse } from 'next/server';
import { db } from '../../../lib/firebase.js';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { email, oldPassword, newPassword } = await request.json();

    if (!email || !oldPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Email, old password, and new password are required' },
        { status: 400 }
      );
    }

    // Check if user exists in Firestore
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userDoc = querySnapshot.docs[0];
    const user = userDoc.data();

    // Verify old password is correct
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    
    if (!isOldPasswordValid) {
      return NextResponse.json(
        { error: 'Old password is incorrect' },
        { status: 401 }
      );
    }

    // Check if new password is different from current password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    
    if (isSamePassword) {
      return NextResponse.json(
        { error: 'New password must be different from current password' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password in database
    const userDocRef = doc(db, 'users', userDoc.id);
    await updateDoc(userDocRef, {
      password: hashedNewPassword
    });

    return NextResponse.json({
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
