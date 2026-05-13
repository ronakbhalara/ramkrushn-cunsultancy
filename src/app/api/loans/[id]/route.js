import pool from '../../../../lib/db';
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// GET single loan by ID
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const result = await pool.query(
      'SELECT * FROM loans WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Loan not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: result.rows[0] });
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
      name: formData.get('name'),
      phone_no: formData.get('phone_no'),
      email_id: formData.get('email_id'),
      loan_status: formData.get('loan_status'),
      loan_type: formData.get('loan_type'),
      reference_name: formData.get('reference_name'),
      reference_phone: formData.get('reference_phone'),
      stage: formData.get('stage'),
      bank_name: formData.get('bank_name'),
      loan_ac_no: formData.get('loan_ac_no'),
      loan_amount: formData.get('loan_amount'),
      emi_date: formData.get('emi_date'),
      emi_amount: formData.get('emi_amount'),
      notes: formData.get('notes')
    };

    const result = await pool.query(
      `UPDATE loans SET
        name = $1,
        phone_no = $2,
        email_id = $3,
        loan_status = $4,
        loan_type = $5,
        reference_name = $6,
        reference_phone = $7,
        stage = $8,
        bank_name = $9,
        loan_ac_no = $10,
        loan_amount = $11,
        emi_date = $12,
        emi_amount = $13,
        notes = $14,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $15
      RETURNING *`,
      [
        loanData.name,
        loanData.phone_no,
        loanData.email_id,
        loanData.loan_status,
        loanData.loan_type,
        loanData.reference_name,
        loanData.reference_phone,
        loanData.stage,
        loanData.bank_name,
        loanData.loan_ac_no,
        loanData.loan_amount,
        loanData.emi_date,
        loanData.emi_amount,
        loanData.notes,
        id,
      ]
    );

    const updatedLoan = result.rows[0];
    let uploadedDocuments = [];

    // Handle file uploads if any
    if (files && files.length > 0) {
      const uploadDir = process.env.LOAN_DOCUMENT || 'D:/Loan-Document';
      
      // Ensure upload directory exists
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (error) {
        console.error('Error creating upload directory:', error);
      }

      for (const file of files) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Generate unique filename
        const fileExtension = path.extname(file.name);
        const uniqueFilename = `${uuidv4()}${fileExtension}`;
        const filePath = path.join(uploadDir, uniqueFilename);

        // Save file to disk
        await writeFile(filePath, buffer);

        // Save document metadata to database
        const docResult = await pool.query(
          `INSERT INTO loan_documents (loan_id, document_name, original_name, file_size, mime_type)
           VALUES ($1, $2, $3, $4, $5) RETURNING *`,
          [id, uniqueFilename, file.name, file.size, file.type]
        );
        
        uploadedDocuments.push(docResult.rows[0]);
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
    const result = await pool.query(
      'DELETE FROM loans WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Loan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Loan deleted successfully' });
  } catch (error) {
    console.error('Error deleting loan:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete loan' },
      { status: 500 }
    );
  }
}
