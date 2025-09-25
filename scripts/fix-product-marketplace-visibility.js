import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixProductVisibility() {
  try {
    console.log('🔍 Checking approved products visibility...\n');
    
    // Get all approved products
    const approvedProducts = await prisma.product.findMany({
      where: {
        status: 'approved'
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            status: true,
            isActive: true
          }
        }
      }
    });
    
    console.log(`Found ${approvedProducts.length} approved products\n`);
    
    // Check which products should be visible in marketplace
    const visibleProducts = approvedProducts.filter(product => 
      product.store.status === 'approved' && 
      product.store.isActive && 
      product.stockQuantity > 0
    );
    
    console.log(`${visibleProducts.length} products should be visible in marketplace`);
    
    // Check which approved products have inconsistent inStock status
    const inconsistentProducts = approvedProducts.filter(product => 
      (product.stockQuantity > 0 && !product.inStock) || 
      (product.stockQuantity === 0 && product.inStock)
    );
    
    if (inconsistentProducts.length > 0) {
      console.log(`\n⚠️  Found ${inconsistentProducts.length} products with inconsistent stock status:`);
      
      for (const product of inconsistentProducts) {
        console.log(`- ${product.name}: stockQuantity=${product.stockQuantity}, inStock=${product.inStock}`);
        
        // Fix the inconsistency
        await prisma.product.update({
          where: { id: product.id },
          data: {
            inStock: product.stockQuantity > 0
          }
        });
      }
      
      console.log('\n✅ Fixed inconsistent stock statuses');
    }
    
    // Verify marketplace visibility
    console.log('\n🔍 Testing marketplace API filter...');
    
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
    
    console.log(`✅ Marketplace API would return ${marketplaceProducts.length} products`);
    
    if (marketplaceProducts.length > 0) {
      console.log('\nSample products that should be visible:');
      marketplaceProducts.slice(0, 5).forEach(product => {
        console.log(`- ${product.name} (Store: ${product.store.name}, Stock: ${product.stockQuantity})`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixProductVisibility();
