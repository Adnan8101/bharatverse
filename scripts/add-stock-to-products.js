import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addStockToProducts() {
  try {
    console.log('🔍 Adding stock to approved products...\n');
    
    // Get all approved products with 0 stock
    const productsWithoutStock = await prisma.product.findMany({
      where: {
        status: 'approved',
        stockQuantity: 0
      },
      include: {
        store: {
          select: {
            name: true,
            status: true,
            isActive: true
          }
        }
      }
    });
    
    console.log(`Found ${productsWithoutStock.length} approved products with 0 stock\n`);
    
    if (productsWithoutStock.length > 0) {
      // Update all approved products to have stock
      const updateResult = await prisma.product.updateMany({
        where: {
          status: 'approved',
          stockQuantity: 0
        },
        data: {
          stockQuantity: 50, // Set reasonable default stock
          inStock: true
        }
      });
      
      console.log(`✅ Updated ${updateResult.count} products with stock quantity of 50`);
    }
    
    // Verify the fix
    console.log('\n🔍 Verifying marketplace visibility...');
    
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
      },
      include: {
        store: {
          select: {
            name: true,
            status: true,
            isActive: true
          }
        }
      }
    });
    
    console.log(`✅ Marketplace API now returns ${marketplaceProducts.length} products`);
    
    if (marketplaceProducts.length > 0) {
      console.log('\nProducts now visible in marketplace:');
      marketplaceProducts.forEach(product => {
        console.log(`- ${product.name} (Store: ${product.store.name}, Stock: ${product.stockQuantity})`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addStockToProducts();
