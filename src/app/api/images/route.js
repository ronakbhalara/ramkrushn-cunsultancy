import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const imagePath = searchParams.get('path');
    
    if (!imagePath) {
      return NextResponse.json(
        { success: false, message: 'Image path required' },
        { status: 400 }
      );
    }

    // Security: Only allow images from GST_DOCUMENT directory
    const DOCUMENT_PATH = process.env.GST_DOCUMENT || 'D:\\Gst-Document';
    
    if (!imagePath.startsWith(DOCUMENT_PATH)) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    // Read file
    const imageBuffer = await fs.readFile(imagePath);
    
    // Get file extension for content type
    const ext = path.extname(imagePath).toLowerCase();
    const contentType = ext === '.jpg' || ext === '.jpeg' 
      ? 'image/jpeg' 
      : ext === '.png' 
        ? 'image/png' 
        : ext === '.gif' 
          ? 'image/gif' 
          : 'image/jpeg';

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    console.error('Error serving image:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to serve image' },
      { status: 500 }
    );
  }
}
