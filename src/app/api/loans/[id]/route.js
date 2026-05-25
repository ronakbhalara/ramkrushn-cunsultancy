import { db } from '../../../../lib/firebase';
import { collection, getDocs, doc, getDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// GET single loan by ID
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const loanRef = doc(db, 'loans', id);
    const loanSnap = await getDoc(loanRef);
    
    if (!loanSnap.exists()) {
      return NextResponse.json(
        { success: false, message: 'Loan not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: { id: loanSnap.id, ...loanSnap.data() } });
  } catch (error) {
    console.error('Error fetching loan:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch loan' },
      { status: 500 }
    );
  }
}

// PUT - Update loan
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const formData = await request.formData();
    const files = formData.getAll('files');
    
    // Extract loan data from form
    const loanData = {
      name: formData.get('name') || '',
      phone_no: formData.get('phone_no') || '',
      email_id: formData.get('email_id') || '',
      loan_status: formData.get('loan_status') || '',
      loan_type: formData.get('loan_type') || '',
      reference_name: formData.get('reference_name') || '',
      reference_phone: formData.get('reference_phone') || '',
      stage: formData.get('stage') || '',
      bank_name: formData.get('bank_name') || '',
      loan_ac_no: formData.get('loan_ac_no') || '',
      loan_amount: formData.get('loan_amount') || '0',
      emi_date: formData.get('emi_date') || null,
      emi_amount: formData.get('emi_amount') || '0',
      notes: formData.get('notes') || '',
      updated_at: new Date().toISOString()
    };

    const loanRef = doc(db, 'loans', id);
    await updateDoc(loanRef, loanData);

    const updatedLoanSnap = await getDoc(loanRef);
    const updatedLoan = { id: updatedLoanSnap.id, ...updatedLoanSnap.data() };
    
    let uploadedDocuments = [];

    // Handle file uploads if any
    if (files && files.length > 0) {
      const envPath = process.env.LOAN_DOCUMENT || 'D:\\CRM-Document\\Loan-Document';
      const uploadDir = path.isAbsolute(envPath) ? envPath : path.resolve(process.cwd(), envPath);
      
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (error) {}

      for (const file of files) {
        if (file instanceof File) {
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);

          const fileExtension = path.extname(file.name);
          const uniqueFilename = `${uuidv4()}${fileExtension}`;
          const filePath = path.join(uploadDir, uniqueFilename);

          await writeFile(filePath, buffer);

          const newDocRef = doc(collection(db, 'loan_documents'));
          const docData = {
            loan_id: id,
            document_name: uniqueFilename,
            original_name: file.name,
            file_size: file.size,
            mime_type: file.type,
            created_at: new Date().toISOString()
          };
          await setDoc(newDocRef, docData);
          uploadedDocuments.push({ id: newDocRef.id, ...docData });
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      data: updatedLoan,
      documents: uploadedDocuments 
    });
  } catch (error) {
    console.error('Error updating loan:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update loan' },
      { status: 500 }
    );
  }
}

// DELETE - Delete loan
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    
    // Delete associated documents first
    const q = query(collection(db, 'loan_documents'), where('loan_id', '==', id));
    const docsSnapshot = await getDocs(q);
    
    for (const d of docsSnapshot.docs) {
      await deleteDoc(doc(db, 'loan_documents', d.id));
    }

    // Delete loan
    const loanRef = doc(db, 'loans', id);
    await deleteDoc(loanRef);

    return NextResponse.json({ success: true, message: 'Loan deleted successfully' });
  } catch (error) {
    console.error('Error deleting loan:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete loan' },
      { status: 500 }
    );
  }
}
