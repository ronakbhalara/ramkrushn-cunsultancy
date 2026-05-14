import pool from '../../../lib/db';
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// GET all loans
export async function GET() {
  try {
    const result = await pool.query(
      'SELECT *, TO_CHAR(emi_date, \'YYYY-MM-DD\') as emi_date FROM loans ORDER BY created_at DESC'
    );
    return NextResponse.json({ success: true, data: result.rows });
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

    // Generate number series
    const numberSeriesResult = await pool.query(
      `SELECT 'L-' || LPAD((COALESCE(MAX(CAST(SUBSTRING(number_series, 3) AS INTEGER)), 0) + 1)::TEXT, 2, '0') as number_series FROM loans WHERE number_series LIKE 'L-%'`
    );
    const number_series = numberSeriesResult.rows[0].number_series;

    const result = await pool.query(
      `INSERT INTO loans (
        number_series, name, phone_no, email_id, loan_status, loan_type, reference_name, reference_phone,
        stage, bank_name, loan_ac_no, loan_amount, emi_date, emi_amount, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        number_series,
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
      ]
    );

    const newLoan = result.rows[0];
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
        throw error;
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
          [newLoan.id, uniqueFilename, file.name, file.size, file.type]
        );

        uploadedDocuments.push(docResult.rows[0]);
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
