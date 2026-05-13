import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET(request, { params }) {
  try {
    const { filename } = await params;
    
    // Security check - prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return NextResponse.json(
        { success: false, message: 'Invalid filename' },
        { status: 400 }
      );
    }

    const loanDir = process.env.LOAN_DOCUMENT || 'D:/Loan-Document';
    const itDir = process.env.INCOME_TAX_DOCUMENT || 'D:/Income-Tax-Document';
    
    const filePaths = [
      path.join(loanDir, filename),
      path.join(itDir, filename)
    ];

    let fileBuffer = null;

    for (const filePath of filePaths) {
      try {
        fileBuffer = await readFile(filePath);
        if (fileBuffer) break;
      } catch (e) {
        // File not in this directory, try the next one
      }
    }

    try {
      if (!fileBuffer) throw new Error('File not found in any directory');
      
      // Determine content type
      const ext = path.extname(filename).toLowerCase();
      let contentType = 'application/octet-stream';
      
      const mimeTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.pdf': 'application/pdf',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.xls': 'application/vnd.ms-excel',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      };
      
      if (mimeTypes[ext]) {
        contentType = mimeTypes[ext];
      }

      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
        },
      });
    } catch (fileError) {
      console.error('File not found:', fileError);
      return NextResponse.json(
        { success: false, message: 'File not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error serving file:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to serve file' },
      { status: 500 }
    );
  }
}
