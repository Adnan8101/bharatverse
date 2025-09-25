import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function uploadImages(files, folder = 'products') {
  try {
    const uploadedPaths = [];
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', folder);
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }
    
    for (const file of files) {
      if (!file || !file.size) continue;
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        console.warn(`Skipping non-image file: ${file.name}`);
        continue;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        console.warn(`Skipping large file: ${file.name} (${file.size} bytes)`);
        continue;
      }
      
      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2);
      const extension = file.name.split('.').pop() || 'jpg';
      const filename = `${folder}_${timestamp}_${randomString}.${extension}`;
      
      // Convert file to buffer and save
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filepath = join(uploadsDir, filename);
      
      await writeFile(filepath, buffer);
      
      // Store the public URL path
      uploadedPaths.push(`/uploads/${folder}/${filename}`);
      console.log(`Successfully uploaded: ${filename}`);
    }
    
    return uploadedPaths;
    
  } catch (error) {
    console.error('Image upload error:', error);
    throw new Error(`Failed to upload images: ${error.message}`);
  }
}

export async function uploadSingleImage(file, folder = 'stores') {
  if (!file || !file.size) return null;
  
  try {
    const uploadedPaths = await uploadImages([file], folder);
    return uploadedPaths.length > 0 ? uploadedPaths[0] : null;
  } catch (error) {
    console.error('Single image upload error:', error);
    return null;
  }
}
