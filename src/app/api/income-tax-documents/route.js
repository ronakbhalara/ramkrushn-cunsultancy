import pool from '../../../lib/db';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const UPLOAD_DIR = process.env.INCOME_TAX_DOCUMENT || 'D:\\Income-Tax-Document';

// GET documents for a specific income tax record
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const incomeTaxId = searchParams.get('incomeTaxId');

    if (!incomeTaxId) {
      return NextResponse.json({ success: false, message: 'incomeTaxId is required' }, { status: 400 });
    }

    const result = await pool.query(
      'SELECT * FROM income_tax_documents WHERE income_tax_id = $1 ORDER BY created_at DESC',
      [incomeTaxId]
    );

    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch documents' }, { status: 500 });
  }
}

// DELETE a document
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID is required' }, { status: 400 });
    }

    // 1. Get document info to delete file from disk
    const docResult = await pool.query('SELECT * FROM income_tax_documents WHERE id = $1', [id]);
    
    if (docResult.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Document not found' }, { status: 404 });
    }

    const document = docResult.rows[0];
    const filePath = path.join(UPLOAD_DIR, document.document_name);

    // 2. Delete from disk
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // 3. Delete from database
    await pool.query('DELETE FROM income_tax_documents WHERE id = $1', [id]);

    return NextResponse.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete document' }, { status: 500 });
  }
}
