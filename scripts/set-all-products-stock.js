import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setStockForAllProducts() {
  try {
    console.log('🔍 Checking all stores and their products...\n');
    
    // Get all stores with their products
    const stores = await prisma.store.findMany({
      include: {
        Product: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });
    
    console.log(`Found ${stores.length} stores total\n`);
    
    let totalProducts = 0;
    let productsUpdated = 0;
    
    for (const store of stores) {
      console.log(`\n📦 Store: ${store.name} (${store.status})`);
      console.log(`   Owner: ${store.user?.name || 'Unknown'} (${store.user?.email || 'No email'})`);
      console.log(`   Products: ${store.Product.length}`);
      
      if (store.Product.length > 0) {
        console.log(`   Product Details:`);
        
        for (const product of store.Product) {
          console.log(`   - ${product.name}: Stock=${product.stockQuantity}, Status=${product.status}, InStock=${product.inStock}`);
          totalProducts++;
          
          // Update product stock to 100 if it's not already
          if (product.stockQuantity !== 100) {
            await prisma.product.update({
              where: { id: product.id },
              data: {
                stockQuantity: 100,
                inStock: true
              }
            });
            productsUpdated++;
          }
        }
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   Total Stores: ${stores.length}`);
    console.log(`   Total Products: ${totalProducts}`);
    console.log(`   Products Updated: ${productsUpdated}`);
    
    // Verify the update
    console.log(`\n✅ Verifying updates...`);
    
    const updatedProducts = await prisma.product.findMany({
      where: {
        stockQuantity: 100
      },
      include: {
        store: {
          select: {
            name: true
          }
        }
      }
    });
    
    console.log(`   Products with stock=100: ${updatedProducts.length}`);
    
    // Check marketplace visibility
    const marketplaceProducts = await prisma.product.findMany({
      where: {
        store: {
          isActive: true,
          status: 'approved'
        },
        status: 'approved',
        stockQuantity: {
          gt: 0
        }
      }
    });
    
    console.log(`   Products visible in marketplace: ${marketplaceProducts.length}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setStockForAllProducts();
