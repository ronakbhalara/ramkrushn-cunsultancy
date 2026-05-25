import { db } from '../../../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const series = searchParams.get('series');

    if (!series) {
      return NextResponse.json(
        { success: false, message: 'Series number is required' },
        { status: 400 }
      );
    }

    let collectionName = '';

    // Determine collection based on prefix
    if (series.startsWith('L-')) {
      collectionName = 'loans';
    } else if (series.startsWith('G-')) {
      collectionName = 'gst_records';
    } else if (series.startsWith('I-')) {
      collectionName = 'income_tax_records';
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid series format' },
        { status: 400 }
      );
    }

    const q = query(collection(db, collectionName), where('number_series', '==', series));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const data = snapshot.docs[0].data();
      return NextResponse.json({ 
        success: true, 
        data: {
          name: data.name || '',
          phone_no: data.phone_no || '',
          reference_name: data.reference_name || '',
          reference_phone: data.reference_phone || ''
        } 
      });
    } else {
      return NextResponse.json(
        { success: false, message: 'Record not found for this series number' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error searching series:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
