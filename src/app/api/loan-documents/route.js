import pool from '../../../lib/db';
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// GET documents for a specific loan
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const loanId = searchParams.get('loanId');

    if (!loanId) {
      return NextResponse.json(
        { success: false, message: 'Loan ID is required' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      'SELECT * FROM loan_documents WHERE loan_id = $1 ORDER BY created_at DESC',
      [loanId]
    );

    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching loan documents:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch loan documents' },
      { status: 500 }
    );
  }
}

// POST - Save document metadata to database
export async function POST(request) {
  try {
    const body = await request.json();
    const documents = Array.isArray(body) ? body : [body];

    if (documents.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No documents to save' },
        { status: 400 }
      );
    }

    const savedDocuments = [];

    for (const doc of documents) {
      const result = await pool.query(
        `INSERT INTO loan_documents (loan_id, document_name, original_name, file_size, mime_type)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [doc.loan_id, doc.document_name, doc.original_name, doc.file_size, doc.mime_type]
      );
      savedDocuments.push(result.rows[0]);
    }

    return NextResponse.json({ 
      success: true, 
      message: `${savedDocuments.length} documents saved successfully`,
      data: savedDocuments 
    });
  } catch (error) {
    console.error('Error saving loan documents:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save loan documents' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a document
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('id');

    if (!documentId) {
      return NextResponse.json(
        { success: false, message: 'Document ID is required' },
        { status: 400 }
      );
    }

    // First get the document info to get the filename
    const docResult = await pool.query(
      'SELECT * FROM loan_documents WHERE id = $1',
      [documentId]
    );

    if (docResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Document not found' },
        { status: 404 }
      );
    }

    const document = docResult.rows[0];

    // Delete the file from the uploads folder
    try {
      const uploadDir = process.env.LOAN_DOCUMENT || 'D:/Loan-Document';
      const filePath = path.join(uploadDir, document.document_name);
      console.log('Attempting to delete file:', filePath);
      console.log('Document info:', document);
      
      // Check if file exists before deleting
      await fs.access(filePath);
      await fs.unlink(filePath);
      console.log(`File deleted successfully: ${filePath}`);
    } catch (fileError) {
      console.error('File deletion error:', fileError.message);
      console.warn('File not found or already deleted:', fileError.message);
      // Continue with database deletion even if file doesn't exist
    }

    // Delete the database record
    const result = await pool.query(
      'DELETE FROM loan_documents WHERE id = $1 RETURNING *',
      [documentId]
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Document and file deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting loan document:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete loan document' },
      { status: 500 }
    );
  }
}
