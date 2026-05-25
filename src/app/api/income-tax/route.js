import { db } from '../../../lib/firebase';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, query, orderBy, where } from 'firebase/firestore';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const envPath = process.env.INCOME_TAX_DOCUMENT || 'D:\\CRM-Document\\Income-Tax-Document';
const UPLOAD_DIR = path.isAbsolute(envPath) ? envPath : path.resolve(process.cwd(), envPath);

async function ensureDirectoryExists(dir) {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch (error) {}
}

// GET all Income Tax records
export async function GET() {
  try {
    const q = query(collection(db, 'income_tax_records'), orderBy('created_at', 'desc'));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching Income Tax records:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch Income Tax records' },
      { status: 500 }
    );
  }
}

// POST - Create new Income Tax record
export async function POST(request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files');
    
    // Generate number series
    const snapshot = await getDocs(collection(db, 'income_tax_records'));
    let maxNum = 0;
    snapshot.forEach(docSnap => {
      const ns = docSnap.data().number_series;
      if (ns && ns.startsWith('I-')) {
        const num = parseInt(ns.substring(2));
        if (num > maxNum) maxNum = num;
      }
    });
    const number_series = `I-${maxNum + 1}`;

    const newRecordRef = doc(collection(db, 'income_tax_records'));
    const newRecord = {
      number_series,
      name: formData.get('name') || '',
      phone_no: formData.get('phone_no') || '',
      reference_name: formData.get('reference_name') || '',
      reference_phone: formData.get('reference_phone') || '',
      pan_card_no: formData.get('pan_card_no') || '',
      password: formData.get('password') || '',
      assessment_year: formData.get('assessment_year') || '',
      status: formData.get('status') || 'Pending',
      stage: formData.get('stage') || 'Document Pending',
      note: formData.get('note') || '',
      created_at: new Date().toISOString()
    };
    
    await setDoc(newRecordRef, newRecord);
    const incomeTaxId = newRecordRef.id;

    // Process and save files
    await ensureDirectoryExists(UPLOAD_DIR);
    for (const file of files) {
      if (file instanceof File) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = `${Date.now()}-${file.name.replace(/\\s+/g, '_')}`;
        const filePath = path.join(UPLOAD_DIR, fileName);

        fs.writeFileSync(filePath, buffer);

        const newDocRef = doc(collection(db, 'income_tax_documents'));
        await setDoc(newDocRef, {
          income_tax_id: incomeTaxId,
          document_name: fileName,
          original_name: file.name,
          mime_type: file.type,
          file_size: file.size,
          created_at: new Date().toISOString()
        });
      }
    }

    return NextResponse.json({ success: true, data: { id: incomeTaxId, ...newRecord } });
  } catch (error) {
    console.error('Error creating Income Tax record:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create Income Tax record' },
      { status: 500 }
    );
  }
}

// PUT - Update Income Tax record
export async function PUT(request) {
  try {
    const formData = await request.formData();
    const id = formData.get('id');
    const files = formData.getAll('files');
    
    const updateData = {
      name: formData.get('name') || '',
      phone_no: formData.get('phone_no') || '',
      reference_name: formData.get('reference_name') || '',
      reference_phone: formData.get('reference_phone') || '',
      pan_card_no: formData.get('pan_card_no') || '',
      password: formData.get('password') || '',
      assessment_year: formData.get('assessment_year') || '',
      status: formData.get('status') || '',
      stage: formData.get('stage') || '',
      note: formData.get('note') || '',
      updated_at: new Date().toISOString()
    };

    const recordRef = doc(db, 'income_tax_records', id);
    await updateDoc(recordRef, updateData);

    // Process and save new files
    await ensureDirectoryExists(UPLOAD_DIR);
    for (const file of files) {
      if (file instanceof File) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = `${Date.now()}-${file.name.replace(/\\s+/g, '_')}`;
        const filePath = path.join(UPLOAD_DIR, fileName);

        fs.writeFileSync(filePath, buffer);

        const newDocRef = doc(collection(db, 'income_tax_documents'));
        await setDoc(newDocRef, {
          income_tax_id: id,
          document_name: fileName,
          original_name: file.name,
          mime_type: file.type,
          file_size: file.size,
          created_at: new Date().toISOString()
        });
      }
    }

    return NextResponse.json({ success: true, data: { id, ...updateData } });
  } catch (error) {
    console.error('Error updating Income Tax record:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update Income Tax record' },
      { status: 500 }
    );
  }
}

// DELETE - Delete Income Tax record
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID is required' },
        { status: 400 }
      );
    }
    
    // Delete associated documents first
    const q = query(collection(db, 'income_tax_documents'), where('income_tax_id', '==', id));
    const docsSnapshot = await getDocs(q);
    
    for (const d of docsSnapshot.docs) {
      await deleteDoc(doc(db, 'income_tax_documents', d.id));
    }

    const recordRef = doc(db, 'income_tax_records', id);
    await deleteDoc(recordRef);

    return NextResponse.json({ success: true, message: 'Income Tax record deleted successfully' });
  } catch (error) {
    console.error('Error deleting Income Tax record:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete Income Tax record' },
      { status: 500 }
    );
  }
}
