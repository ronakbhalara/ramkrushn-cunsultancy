import pool from '../../../lib/db';
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Get document path from environment variable
const DOCUMENT_PATH = process.env.GST_DOCUMENT || 'D:\\Gst-Document';

// Ensure document directory exists
async function ensureDirectoryExists(dirPath) {
  try {
    await fs.access(dirPath);
    console.log(`Directory already exists: ${dirPath}`);
  } catch (error) {
    try {
      await fs.mkdir(dirPath, { recursive: true });
      console.log(`Directory created successfully: ${dirPath}`);
    } catch (mkdirError) {
      console.error(`Failed to create directory ${dirPath}:`, mkdirError);
      throw mkdirError;
    }
  }
}

// POST - Create new GST document
export async function POST(request) {
  try {
    // Ensure document directory exists
    await ensureDirectoryExists(DOCUMENT_PATH);

    const formData = await request.formData();

    const month_year = formData.get('month_year');
    const bill_type = formData.get('bill_type');
    const gst_number = formData.get('gst_number');
    const name = formData.get('name');
    const amount = formData.get('amount');
    const gst_record_id = formData.get('gst_record_id');
    const document_path = formData.get('document_path');

    // Get all images
    const images = formData.getAll('images');

    // Generate document number series
    const numberSeriesResult = await pool.query(
      `SELECT 'GD-' || LPAD((COALESCE(MAX(CAST(SUBSTRING(document_number, 4) AS INTEGER)), 0) + 1)::TEXT, 3, '0') as document_number 
       FROM gst_documents WHERE document_number LIKE 'GD-%'`
    );
    const document_number = numberSeriesResult.rows[0].document_number;

    // Handle multiple image uploads
    const imagePaths = [];
    if (images && images.length > 0) {
      for (let index = 0; index < images.length; index++) {
        const image = images[index];
        if (image.size > 0) {
          // Create unique filename
          const imagePath = `${DOCUMENT_PATH}\\${document_number}_${index + 1}_${image.name}`;
          imagePaths.push(imagePath);

          // Save file to filesystem
          try {
            const buffer = Buffer.from(await image.arrayBuffer());
            await fs.writeFile(imagePath, buffer);
            console.log(`File saved successfully: ${imagePath}`);
          } catch (fileError) {
            console.error(`Failed to save file ${imagePath}:`, fileError);
            // Continue with other files even if one fails
          }
        }
      }
    }

    const result = await pool.query(
      `INSERT INTO gst_documents (
        document_number, month_year, bill_type, gst_number, name, amount, 
        gst_record_id, document_path, image_paths, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
      RETURNING *`,
      [
        document_number,
        month_year,
        bill_type,
        gst_number,
        name,
        amount,
        gst_record_id,
        DOCUMENT_PATH,
        JSON.stringify(imagePaths)
      ]
    );

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating GST document:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create GST document' },
      { status: 500 }
    );
  }
}

// GET - Get GST documents (all or by gst_record_id)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const gst_record_id = searchParams.get('gst_record_id');

    let query;
    let params = [];

    if (gst_record_id) {
      // Get documents for specific GST record
      query = `
        SELECT gd.*, gr.name as gst_record_name 
        FROM gst_documents gd 
        LEFT JOIN gst_records gr ON gd.gst_record_id = gr.id 
        WHERE gd.gst_record_id = $1 
        ORDER BY gd.created_at DESC
      `;
      params = [gst_record_id];
    } else {
      // Get all documents
      query = `
        SELECT gd.*, gr.name as gst_record_name 
        FROM gst_documents gd 
        LEFT JOIN gst_records gr ON gd.gst_record_id = gr.id 
        ORDER BY gd.created_at DESC
      `;
    }

    const result = await pool.query(query, params);
    return NextResponse.json({ success: true, data: result.rows });
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
    // Ensure document directory exists
    await ensureDirectoryExists(DOCUMENT_PATH);

    const formData = await request.formData();

    const documentId = formData.get('document_id');
    const month_year = formData.get('month_year');
    const bill_type = formData.get('bill_type');
    const gst_number = formData.get('gst_number');
    const name = formData.get('name');
    const amount = formData.get('amount');

    // Get new images
    const newImages = formData.getAll('images');

    // Get existing document to preserve existing images
    const existingDocResult = await pool.query(
      'SELECT image_paths FROM gst_documents WHERE id = $1',
      [documentId]
    );

    if (existingDocResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'GST document not found' },
        { status: 404 }
      );
    }

    const existingImagePaths = JSON.parse(existingDocResult.rows[0].image_paths || '[]');
    const imagePaths = [...existingImagePaths];

    // Handle new image uploads
    if (newImages && newImages.length > 0) {
      for (let index = 0; index < newImages.length; index++) {
        const image = newImages[index];
        if (image.size > 0) {
          // Create unique filename
          const imagePath = `${DOCUMENT_PATH}\\GD-UPDATE_${documentId}_${index + 1}_${image.name}`;
          imagePaths.push(imagePath);

          // Save file to filesystem
          try {
            const buffer = Buffer.from(await image.arrayBuffer());
            await fs.writeFile(imagePath, buffer);
            console.log(`File saved successfully: ${imagePath}`);
          } catch (fileError) {
            console.error(`Failed to save file ${imagePath}:`, fileError);
          }
        }
      }
    }

    const result = await pool.query(
      `UPDATE gst_documents SET 
        month_year = $1, bill_type = $2, gst_number = $3, 
        name = $4, amount = $5, image_paths = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 RETURNING *`,
      [
        month_year,
        bill_type,
        gst_number,
        name,
        amount,
        JSON.stringify(imagePaths),
        documentId
      ]
    );

    return NextResponse.json({ success: true, data: result.rows[0] });
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

    // Delete specific image from document
    if ((bodyImagePath || imagePath) && (document_id || documentId)) {
      const docId = document_id || documentId;
      const imgPath = bodyImagePath || imagePath;
      const imgIndex = bodyImageIndex || imageIndex;

      // Get current document
      const docResult = await pool.query(
        'SELECT image_paths FROM gst_documents WHERE id = $1',
        [docId]
      );

      if (docResult.rows.length === 0) {
        return NextResponse.json(
          { success: false, message: 'Document not found' },
          { status: 404 }
        );
      }

      const currentImagePaths = JSON.parse(docResult.rows[0].image_paths || '[]');

      // Remove image from array
      const updatedImagePaths = currentImagePaths.filter((_, index) =>
        index !== parseInt(imgIndex)
      );

      // Update database
      await pool.query(
        'UPDATE gst_documents SET image_paths = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [JSON.stringify(updatedImagePaths), docId]
      );

      // Try to delete file from filesystem
      try {
        await fs.unlink(imgPath);
        console.log(`Deleted file: ${imgPath}`);
      } catch (fileError) {
        console.error(`Failed to delete file ${imgPath}:`, fileError);
        // Continue with database update even if file deletion fails
      }

      return NextResponse.json({
        success: true,
        message: 'Image deleted successfully',
        remaining_images: updatedImagePaths.length
      });
    }

    // Delete entire document
    if (documentId) {
      const result = await pool.query(
        'DELETE FROM gst_documents WHERE id = $1 RETURNING *',
        [documentId]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { success: false, message: 'GST document not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, message: 'GST document deleted successfully' });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid delete request' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error deleting GST document/image:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete' },
      { status: 500 }
    );
  }
}
