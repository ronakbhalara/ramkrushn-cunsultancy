import pool from '../../../lib/db';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const UPLOAD_DIR = process.env.INCOME_TAX_DOCUMENT || 'D:\\Income-Tax-Document';

// Ensure directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// GET all Income Tax records
export async function GET() {
  try {
    const result = await pool.query(
      'SELECT * FROM income_tax_records ORDER BY created_at DESC'
    );
    return NextResponse.json({ success: true, data: result.rows });
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
    const name = formData.get('name');
    const phone_no = formData.get('phone_no');
    const reference_name = formData.get('reference_name');
    const reference_phone = formData.get('reference_phone');
    const pan_card_no = formData.get('pan_card_no');
    const password = formData.get('password');
    const assessment_year = formData.get('assessment_year');
    const status = formData.get('status');
    const stage = formData.get('stage');
    const note = formData.get('note');
    const files = formData.getAll('files');

    // Generate number series
    const numberSeriesResult = await pool.query(
      `SELECT 'I-' || LPAD((COALESCE(MAX(CAST(SUBSTRING(number_series, 3) AS INTEGER)), 0) + 1)::TEXT, 2, '0') as number_series FROM income_tax_records WHERE number_series LIKE 'I-%'`
    );
    const number_series = numberSeriesResult.rows[0]?.number_series || 'I-01';

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const result = await client.query(
        `INSERT INTO income_tax_records (
          number_series, name, phone_no, reference_name, reference_phone,
          pan_card_no, password, assessment_year, status, stage, note
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *`,
        [
          number_series,
          name,
          phone_no,
          reference_name,
          reference_phone,
          pan_card_no,
          password,
          assessment_year,
          status || 'Pending',
          stage || 'Document Pending',
          note
        ]
      );

      const incomeTaxId = result.rows[0].id;

      // Process and save files
      for (const file of files) {
        if (file instanceof File) {
          const buffer = Buffer.from(await file.arrayBuffer());
          const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
          const filePath = path.join(UPLOAD_DIR, fileName);
          
          fs.writeFileSync(filePath, buffer);

          await client.query(
            `INSERT INTO income_tax_documents (
              income_tax_id, document_name, original_name, mime_type, file_size
            ) VALUES ($1, $2, $3, $4, $5)`,
            [incomeTaxId, fileName, file.name, file.type, file.size]
          );
        }
      }

      await client.query('COMMIT');
      return NextResponse.json({ success: true, data: result.rows[0] });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
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
    const name = formData.get('name');
    const phone_no = formData.get('phone_no');
    const reference_name = formData.get('reference_name');
    const reference_phone = formData.get('reference_phone');
    const pan_card_no = formData.get('pan_card_no');
    const password = formData.get('password');
    const assessment_year = formData.get('assessment_year');
    const status = formData.get('status');
    const stage = formData.get('stage');
    const note = formData.get('note');
    const files = formData.getAll('files');

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const result = await client.query(
        `UPDATE income_tax_records SET 
          name = $1, phone_no = $2, reference_name = $3, reference_phone = $4,
          pan_card_no = $5, password = $6, assessment_year = $7, 
          status = $8, stage = $9, note = $10,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $11
        RETURNING *`,
        [
          name,
          phone_no,
          reference_name,
          reference_phone,
          pan_card_no,
          password,
          assessment_year,
          status,
          stage,
          note,
          id
        ]
      );

      // Process and save new files
      for (const file of files) {
        if (file instanceof File) {
          const buffer = Buffer.from(await file.arrayBuffer());
          const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
          const filePath = path.join(UPLOAD_DIR, fileName);
          
          fs.writeFileSync(filePath, buffer);

          await client.query(
            `INSERT INTO income_tax_documents (
              income_tax_id, document_name, original_name, mime_type, file_size
            ) VALUES ($1, $2, $3, $4, $5)`,
            [id, fileName, file.name, file.type, file.size]
          );
        }
      }

      await client.query('COMMIT');
      return NextResponse.json({ success: true, data: result.rows[0] });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
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

    const result = await pool.query(
      'DELETE FROM income_tax_records WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Income Tax record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Income Tax record deleted successfully' });
  } catch (error) {
    console.error('Error deleting Income Tax record:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete Income Tax record' },
      { status: 500 }
    );
  }
}
