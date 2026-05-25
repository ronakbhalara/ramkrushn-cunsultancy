import { db } from '../../../lib/firebase';
import { collection, query, where, getDocs, doc, deleteDoc, getDoc, orderBy } from 'firebase/firestore';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const UPLOAD_DIR = process.env.INCOME_TAX_DOCUMENT || 'D:\\CRM-Document\\Income-Tax-Document';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const incomeTaxId = searchParams.get('incomeTaxId');

    if (!incomeTaxId) {
      return NextResponse.json({ success: false, message: 'incomeTaxId is required' }, { status: 400 });
    }

    const q = query(collection(db, 'income_tax_documents'), where('income_tax_id', '==', incomeTaxId));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch documents' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID is required' }, { status: 400 });
    }

    const docRef = doc(db, 'income_tax_documents', id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return NextResponse.json({ success: false, message: 'Document not found' }, { status: 404 });
    }

    const document = docSnap.data();
    const filePath = path.join(UPLOAD_DIR, document.document_name);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await deleteDoc(docRef);

    return NextResponse.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete document' }, { status: 500 });
  }
}
