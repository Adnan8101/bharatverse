import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixStoreActivationIssues() {
  try {
    console.log('🔧 Fixing Store Activation Issues...\n');
    
    // 1. Activate all approved stores
    console.log('1️⃣ Activating all approved stores...');
    const updateResult = await prisma.store.updateMany({
      where: {
        status: 'approved',
        isActive: false
      },
      data: {
        isActive: true
      }
    });
    
    console.log(`   ✅ Activated ${updateResult.count} stores`);
    
    // 2. Verify the fix
    console.log('\n2️⃣ Verifying marketplace visibility after fix...');
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
    
    console.log(`   ✅ Now ${marketplaceProducts.length} products visible in marketplace`);
    
    // 3. Check the specific product again
    const specificProduct = await prisma.product.findUnique({
      where: {
        id: 'cmfyzvfsb0003r0qghti6zqn8'
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
    
    if (specificProduct) {
      const isNowVisible = (
        specificProduct.status === 'approved' &&
        specificProduct.store.status === 'approved' &&
        specificProduct.store.isActive &&
        specificProduct.stockQuantity > 0
      );
      
      console.log(`\n3️⃣ Specific product check:`);
      console.log(`   Product: ${specificProduct.name}`);
      console.log(`   Store: ${specificProduct.store.name}`);
      console.log(`   Store Active: ${specificProduct.store.isActive}`);
      console.log(`   Now visible in marketplace: ${isNowVisible ? 'YES ✅' : 'NO ❌'}`);
    }
    
    // 4. Final marketplace count verification
    console.log('\n4️⃣ Final marketplace statistics:');
    const totalApproved = await prisma.product.count({
      where: { status: 'approved' }
    });
    
    const totalVisible = await prisma.product.count({
      where: {
        store: {
          isActive: true,
          status: 'approved'
        },
        status: 'approved',
        stockQuantity: { gt: 0 }
      }
    });
    
    console.log(`   Total approved products: ${totalApproved}`);
    console.log(`   Total visible products: ${totalVisible}`);
    console.log(`   Coverage: ${totalVisible}/${totalApproved} (${Math.round(totalVisible/totalApproved*100)}%)`);
    
    if (totalVisible === totalApproved) {
      console.log('\n🎉 SUCCESS: All approved products are now visible in marketplace!');
    } else {
      console.log(`\n⚠️  ${totalApproved - totalVisible} approved products still not visible`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixStoreActivationIssues();
