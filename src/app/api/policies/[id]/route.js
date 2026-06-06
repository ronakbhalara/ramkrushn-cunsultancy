import { db } from '../../../../lib/firebase';
import { doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { bank_name, link, note, loan_type } = body;

        const recordRef = doc(db, 'policies', id);
        const snap = await getDoc(recordRef);
        if (!snap.exists()) {
            return NextResponse.json(
                { success: false, message: 'Policy not found' },
                { status: 404 }
            );
        }

        const updateData = {
            bank_name: bank_name || '',
            link: link || '',
            note: note || '',
            loan_type: loan_type || '',
            updated_at: new Date().toISOString(),
        };

        await updateDoc(recordRef, updateData);

        return NextResponse.json({
            success: true,
            data: { id, ...snap.data(), ...updateData },
        });
    } catch (error) {
        console.error('Error updating policy:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update policy' },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = await params;

        const recordRef = doc(db, 'policies', id);
        const snap = await getDoc(recordRef);
        if (!snap.exists()) {
            return NextResponse.json(
                { success: false, message: 'Policy not found' },
                { status: 404 }
            );
        }

        await deleteDoc(recordRef);

        return NextResponse.json({ success: true, message: 'Policy deleted successfully' });
    } catch (error) {
        console.error('Error deleting policy:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to delete policy' },
            { status: 500 }
        );
    }
}
