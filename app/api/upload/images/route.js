import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request) {
  try {
    const data = await request.formData();
    const files = [];
    
    // Extract up to 4 image files
    for (let i = 1; i <= 4; i++) {
      const file = data.get(`image${i}`);
      if (file && file.size > 0) {
        files.push({ file, index: i });
      }
    }
    
    if (files.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No images provided' },
        { status: 400 }
      );
    }
    
    const uploadedPaths = [];
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'products');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }
    
    for (const { file, index } of files) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        continue;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        continue;
      }
      
      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2);
      const extension = file.name.split('.').pop();
      const filename = `product_${timestamp}_${randomString}.${extension}`;
      
      // Convert file to buffer and save
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filepath = join(uploadsDir, filename);
      
      await writeFile(filepath, buffer);
      
      // Store the public URL path
      uploadedPaths.push(`/uploads/products/${filename}`);
    }
    
    return NextResponse.json({
      success: true,
      imagePaths: uploadedPaths,
      message: `${uploadedPaths.length} images uploaded successfully`
    });
    
  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to upload images' },
      { status: 500 }
    );
  }
}
