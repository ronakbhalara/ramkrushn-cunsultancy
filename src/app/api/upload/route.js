import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files');
    const loanId = formData.get('loanId');

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No files uploaded' },
        { status: 400 }
      );
    }

    const uploadDir = process.env.LOAN_DOCUMENT || 'D:/Loan-Document';
    
    // Ensure upload directory exists
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      console.error('Error creating upload directory:', error);
    }

    const uploadedFiles = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generate unique filename
      const fileExtension = path.extname(file.name);
      const uniqueFilename = `${uuidv4()}${fileExtension}`;
      const filePath = path.join(uploadDir, uniqueFilename);

      // Save file to disk
      await writeFile(filePath, buffer);

      uploadedFiles.push({
        document_name: uniqueFilename,
        original_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        loan_id: parseInt(loanId)
      });
    }

    return NextResponse.json({
      success: true,
      message: `${uploadedFiles.length} files uploaded successfully`,
      data: uploadedFiles
    });

  } catch (error) {
    console.error('Error uploading files:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to upload files' },
      { status: 500 }
    );
  }
}
