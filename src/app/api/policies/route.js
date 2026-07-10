import { db } from '../../../lib/firebase';
import { collection, getDocs, doc, setDoc, query, orderBy } from 'firebase/firestore';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const q = query(collection(db, 'policies'), orderBy('created_at', 'desc'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching policies:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch policies' },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { bank_name, link, note, loan_type, pin } = body;

        const newPolicyRef = doc(collection(db, 'policies'));
        const newPolicy = {
            bank_name: bank_name || '',
            link: link || '',
            note: note || '',
            loan_type: loan_type || '',
            pin: Boolean(pin),
            created_at: new Date().toISOString(),
        };

        await setDoc(newPolicyRef, newPolicy);

        return NextResponse.json({ success: true, data: { id: newPolicyRef.id, ...newPolicy } });
    } catch (error) {
        console.error('Error creating policy:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to create policy' },
            { status: 500 }
        );
    }
}
