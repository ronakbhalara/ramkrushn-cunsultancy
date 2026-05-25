import { db } from '../../../lib/firebase';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc, getDoc, updateDoc, orderBy } from 'firebase/firestore';
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const envPath = process.env.GST_DOCUMENT || 'D:\\CRM-Document\\Gst-Document';
const DOCUMENT_PATH = path.isAbsolute(envPath) ? envPath : path.resolve(process.cwd(), envPath);

async function ensureDirectoryExists(dirPath) {
  try {
    await fs.access(dirPath);
  } catch {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {}
  }
}

// POST - Create new GST document
export async function POST(request) {
  try {
    await ensureDirectoryExists(DOCUMENT_PATH);
    const formData = await request.formData();

    const month_year = formData.get('month_year');
    const bill_type = formData.get('bill_type');
    const gst_number = formData.get('gst_number');
    const name = formData.get('name');
    const amount = formData.get('amount');
    const gst_record_id = formData.get('gst_record_id');
    const images = formData.getAll('images');

    // Generate number series
    const snapshot = await getDocs(collection(db, 'gst_documents'));
    let maxNum = 0;
    snapshot.forEach(docSnap => {
      const ns = docSnap.data().document_number;
      if (ns && ns.startsWith('GD-')) {
        const num = parseInt(ns.substring(3), 10);
        if (num > maxNum) maxNum = num;
      }
    });
    const document_number = `GD-${String(maxNum + 1).padStart(3, '0')}`;

    const imagePaths = [];
    if (images && images.length > 0) {
      for (let index = 0; index < images.length; index++) {
        const image = images[index];
        if (image instanceof File && image.size > 0) {
          const fileExt = path.extname(image.name);
          const uniqueName = `${document_number}_${index + 1}_${uuidv4()}${fileExt}`;
          const imagePath = path.join(DOCUMENT_PATH, uniqueName);
          imagePaths.push(imagePath);

          try {
            const buffer = Buffer.from(await image.arrayBuffer());
            await fs.writeFile(imagePath, buffer);
          } catch (fileError) {}
        }
      }
    }

    const newDocRef = doc(collection(db, 'gst_documents'));
    const newRecord = {
      document_number,
      month_year: month_year || '',
      bill_type: bill_type || '',
      gst_number: gst_number || '',
      name: name || '',
      amount: amount || '',
      gst_record_id: gst_record_id || '',
      document_path: DOCUMENT_PATH,
      image_paths: JSON.stringify(imagePaths),
      created_at: new Date().toISOString()
    };
    
    await setDoc(newDocRef, newRecord);

    return NextResponse.json({ success: true, data: { id: newDocRef.id, ...newRecord } });
  } catch (error) {
    console.error('Error creating GST document:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create GST document' },
      { status: 500 }
    );
  }
}

// GET - Get GST documents
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const gst_record_id = searchParams.get('gst_record_id');

    let q = query(collection(db, 'gst_documents'));
    if (gst_record_id) {
      q = query(collection(db, 'gst_documents'), where('gst_record_id', '==', gst_record_id));
    }
    
    const snapshot = await getDocs(q);
    const documents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

    // Get gst_record_names
    const recordCache = {};
    for (let i = 0; i < documents.length; i++) {
      const recId = documents[i].gst_record_id;
      if (recId) {
        if (!recordCache[recId]) {
          const rSnap = await getDoc(doc(db, 'gst_records', recId));
          recordCache[recId] = rSnap.exists() ? rSnap.data().name : null;
        }
        documents[i].gst_record_name = recordCache[recId];
      }
    }

    return NextResponse.json({ success: true, data: documents });
  } catch (error) {
    console.error('Error fetching GST documents:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch GST documents' },
      { status: 500 }
    );
  }
}

// PUT - Update GST document
export async function PUT(request) {
  try {
    await ensureDirectoryExists(DOCUMENT_PATH);
    const formData = await request.formData();

    const documentId = formData.get('document_id');
    const newImages = formData.getAll('images');

    const docRef = doc(db, 'gst_documents', documentId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json({ success: false, message: 'GST document not found' }, { status: 404 });
    }

    const existingData = docSnap.data();
    const existingImagePaths = JSON.parse(existingData.image_paths || '[]');
    const imagePaths = [...existingImagePaths];

    if (newImages && newImages.length > 0) {
      for (let index = 0; index < newImages.length; index++) {
        const image = newImages[index];
        if (image instanceof File && image.size > 0) {
          const fileExt = path.extname(image.name);
          const uniqueName = `GD-UPDATE_${documentId}_${index + 1}_${uuidv4()}${fileExt}`;
          const imagePath = path.join(DOCUMENT_PATH, uniqueName);
          imagePaths.push(imagePath);

          try {
            const buffer = Buffer.from(await image.arrayBuffer());
            await fs.writeFile(imagePath, buffer);
          } catch (fileError) {}
        }
      }
    }

    const updateData = {
      month_year: formData.get('month_year') || existingData.month_year,
      bill_type: formData.get('bill_type') || existingData.bill_type,
      gst_number: formData.get('gst_number') || existingData.gst_number,
      name: formData.get('name') || existingData.name,
      amount: formData.get('amount') || existingData.amount,
      image_paths: JSON.stringify(imagePaths),
      updated_at: new Date().toISOString()
    };

    await updateDoc(docRef, updateData);

    return NextResponse.json({ success: true, data: { id: documentId, ...existingData, ...updateData } });
  } catch (error) {
    console.error('Error updating GST document:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update GST document' },
      { status: 500 }
    );
  }
}

// DELETE - Delete GST document
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('id');
    const imagePath = searchParams.get('image_path');
    const imageIndex = searchParams.get('image_index');

    const body = await request.json().catch(() => ({}));
    const { document_id, image_path: bodyImagePath, image_index: bodyImageIndex } = body;

    if ((bodyImagePath || imagePath) && (document_id || documentId)) {
      const docId = document_id || documentId;
      const imgPath = bodyImagePath || imagePath;
      const imgIndex = bodyImageIndex || imageIndex;

      const docRef = doc(db, 'gst_documents', docId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return NextResponse.json({ success: false, message: 'Document not found' }, { status: 404 });
      }

      const currentImagePaths = JSON.parse(docSnap.data().image_paths || '[]');
      const updatedImagePaths = currentImagePaths.filter((_, index) => index !== parseInt(imgIndex));

      await updateDoc(docRef, {
        image_paths: JSON.stringify(updatedImagePaths),
        updated_at: new Date().toISOString()
      });

      try {
        await fs.unlink(imgPath);
      } catch (fileError) {}

      return NextResponse.json({
        success: true,
        message: 'Image deleted successfully',
        remaining_images: updatedImagePaths.length
      });
    }

    if (documentId) {
      const docRef = doc(db, 'gst_documents', documentId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return NextResponse.json({ success: false, message: 'GST document not found' }, { status: 404 });
      }
      
      const currentImagePaths = JSON.parse(docSnap.data().image_paths || '[]');
      for (const imgPath of currentImagePaths) {
         try {
           await fs.unlink(imgPath);
         } catch(e) {}
      }

      await deleteDoc(docRef);

      return NextResponse.json({ success: true, message: 'GST document deleted successfully' });
    }

    return NextResponse.json({ success: false, message: 'Invalid delete request' }, { status: 400 });
  } catch (error) {
    console.error('Error deleting GST document/image:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete' },
      { status: 500 }
    );
  }
}
