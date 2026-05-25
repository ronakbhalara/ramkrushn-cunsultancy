import { db } from '../../../lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, getDoc, query, where, orderBy } from 'firebase/firestore';
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const loanId = searchParams.get('loanId');

    if (!loanId) return NextResponse.json({ success: false, message: 'Loan ID is required' }, { status: 400 });

    const q = query(collection(db, 'loan_documents'), where('loan_id', '==', loanId));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching loan documents:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch loan documents' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const documents = Array.isArray(body) ? body : [body];

    if (documents.length === 0) return NextResponse.json({ success: false, message: 'No documents to save' }, { status: 400 });

    const savedDocuments = [];
    for (const docData of documents) {
      const newRef = doc(collection(db, 'loan_documents'));
      const newDoc = {
        loan_id: docData.loan_id,
        document_name: docData.document_name,
        original_name: docData.original_name,
        file_size: docData.file_size,
        mime_type: docData.mime_type,
        created_at: new Date().toISOString()
      };
      await setDoc(newRef, newDoc);
      savedDocuments.push({ id: newRef.id, ...newDoc });
    }

    return NextResponse.json({ success: true, message: `${savedDocuments.length} documents saved successfully`, data: savedDocuments });
  } catch (error) {
    console.error('Error saving loan documents:', error);
    return NextResponse.json({ success: false, message: 'Failed to save loan documents' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('id');

    if (!documentId) return NextResponse.json({ success: false, message: 'Document ID is required' }, { status: 400 });

    const docRef = doc(db, 'loan_documents', documentId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return NextResponse.json({ success: false, message: 'Document not found' }, { status: 404 });

    const documentData = docSnap.data();

    try {
      const uploadDir = process.env.LOAN_DOCUMENT || 'D:\\CRM-Document\\Loan-Document';
      const filePath = path.join(uploadDir, documentData.document_name);
      await fs.access(filePath);
      await fs.unlink(filePath);
    } catch (fileError) {}

    await deleteDoc(docRef);

    return NextResponse.json({ success: true, message: 'Document and file deleted successfully' });
  } catch (error) {
    console.error('Error deleting loan document:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete loan document' }, { status: 500 });
  }
}
