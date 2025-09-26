import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function removeDefaultImages() {
  try {
    console.log('🧹 Starting to remove default images from products...');
    
    // Get all products with their current images
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        images: true,
        storeId: true
      }
    });
    
    console.log(`📊 Found ${products.length} products to check`);
    
    let updatedCount = 0;
    let productsWithDefaultImages = [];
    
    for (const product of products) {
      // Check if product has default/placeholder images
      const hasDefaultImages = product.images.some(image => 
        image.includes('/assets/product_img') ||
        image.includes('/assets/gs_logo.jpg') ||
        image.includes('/assets/profile_pic') ||
        image.includes('placeholder') ||
        image.includes('via.placeholder.com') ||
        image.includes('/assets/') ||
        image === '' ||
        image === null
      );
      
      if (hasDefaultImages || product.images.length === 0) {
        // Remove all default images, keep only real uploaded images
        const cleanImages = product.images.filter(image => 
          image && 
          !image.includes('/assets/product_img') &&
          !image.includes('/assets/gs_logo.jpg') &&
          !image.includes('/assets/profile_pic') &&
          !image.includes('placeholder') &&
          !image.includes('via.placeholder.com') &&
          !image.startsWith('/assets/') &&
          image.trim() !== ''
        );
        
        // Update the product with cleaned images (empty array if all were default)
        await prisma.product.update({
          where: { id: product.id },
          data: { images: cleanImages }
        });
        
        productsWithDefaultImages.push({
          id: product.id,
          name: product.name,
          originalImages: product.images,
          cleanedImages: cleanImages,
          removedCount: product.images.length - cleanImages.length
        });
        
        updatedCount++;
      }
    }
    
    console.log(`\n✅ Successfully processed ${updatedCount} products`);
    console.log(`📋 Products that had default images removed:`);
    
    productsWithDefaultImages.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   - Removed ${product.removedCount} default image(s)`);
      console.log(`   - Remaining images: ${product.cleanedImages.length}`);
      if (product.cleanedImages.length === 0) {
        console.log(`   - ⚠️  No images left (ready for AI generation)`);
      }
      console.log('');
    });
    
    const productsWithoutImages = productsWithDefaultImages.filter(p => p.cleanedImages.length === 0);
    console.log(`\n🎯 ${productsWithoutImages.length} products are now ready for AI image generation!`);
    
    if (productsWithoutImages.length > 0) {
      console.log(`\n📝 Products without any images:`);
      productsWithoutImages.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} (ID: ${product.id})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error removing default images:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
removeDefaultImages();
