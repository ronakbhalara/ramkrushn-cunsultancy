import { db } from '../../../lib/firebase';
import { collection, getDocs, doc, setDoc, query, orderBy } from 'firebase/firestore';
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// GET all loans
export async function GET() {
  try {
    const q = query(collection(db, 'loans'), orderBy('created_at', 'desc'));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching loans:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch loans' },
      { status: 500 }
    );
  }
}

// POST - Create new loan
export async function POST(request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files');

    // Extract loan data from form
    const loanData = {
      name: formData.get('name') || '',
      phone_no: formData.get('phone_no') || '',
      phone_no_2: formData.get('phone_no_2') || '',
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
      created_at: new Date().toISOString()
    };

    // Generate number series
    const loansSnapshot = await getDocs(collection(db, 'loans'));
    let maxNum = 0;
    loansSnapshot.forEach(docSnap => {
      const ns = docSnap.data().number_series;
      if (ns && ns.startsWith('L-')) {
        const num = parseInt(ns.substring(2));
        if (num > maxNum) maxNum = num;
      }
    });
    loanData.number_series = `L-${maxNum + 1}`;

    // Create loan in Firestore
    const newLoanRef = doc(collection(db, 'loans'));
    await setDoc(newLoanRef, loanData);
    const newLoan = { id: newLoanRef.id, ...loanData };

    let uploadedDocuments = [];

    // Handle file uploads if any
    if (files && files.length > 0) {
      const envPath = process.env.LOAN_DOCUMENT || 'D:\\CRM-Document\\Loan-Document';
      const uploadDir = path.isAbsolute(envPath) ? envPath : path.resolve(process.cwd(), envPath);

      // Ensure upload directory exists
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (error) {
        console.error('Error creating upload directory:', error);
      }

      for (const file of files) {
        if (file instanceof File) {
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);

          // Generate unique filename
          const fileExtension = path.extname(file.name);
          const uniqueFilename = `${uuidv4()}${fileExtension}`;
          const filePath = path.join(uploadDir, uniqueFilename);

          // Save file to disk
          await writeFile(filePath, buffer);

          // Save document metadata to database
          const newDocRef = doc(collection(db, 'loan_documents'));
          const docData = {
            loan_id: newLoanRef.id,
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
      data: newLoan,
      documents: uploadedDocuments
    });
  } catch (error) {
    console.error('Error creating loan:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create loan' },
      { status: 500 }
    );
  }
}
