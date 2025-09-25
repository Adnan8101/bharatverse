import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function diagnoseStoreIssues() {
  try {
    console.log('🔍 Diagnosing Store and Product Issues...\n');
    
    // 1. Check the specific product mentioned
    const specificProduct = await prisma.product.findUnique({
      where: {
        id: 'cmfyzvfsb0003r0qghti6zqn8'
      },
      include: {
        store: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    });
    
    if (specificProduct) {
      console.log('🎯 Specific Product Analysis:');
      console.log(`   Product: ${specificProduct.name}`);
      console.log(`   Status: ${specificProduct.status}`);
      console.log(`   Stock: ${specificProduct.stockQuantity}`);
      console.log(`   InStock: ${specificProduct.inStock}`);
      console.log(`   Store: ${specificProduct.store.name}`);
      console.log(`   Store Status: ${specificProduct.store.status}`);
      console.log(`   Store Active: ${specificProduct.store.isActive}`);
      console.log(`   Store Owner: ${specificProduct.store.user?.name || 'Unknown'}`);
      
      // Check if this product should be visible
      const shouldBeVisible = (
        specificProduct.status === 'approved' &&
        specificProduct.store.status === 'approved' &&
        specificProduct.store.isActive &&
        specificProduct.stockQuantity > 0
      );
      
      console.log(`   Should be visible: ${shouldBeVisible ? 'YES' : 'NO'}`);
      
      if (!shouldBeVisible) {
        console.log('   ❌ Issues preventing visibility:');
        if (specificProduct.status !== 'approved') console.log(`      - Product not approved (${specificProduct.status})`);
        if (specificProduct.store.status !== 'approved') console.log(`      - Store not approved (${specificProduct.store.status})`);
        if (!specificProduct.store.isActive) console.log(`      - Store not active`);
        if (specificProduct.stockQuantity <= 0) console.log(`      - No stock (${specificProduct.stockQuantity})`);
      }
    } else {
      console.log('❌ Product cmfyzvfsb0003r0qghti6zqn8 not found');
    }
    
    // 2. Check all stores and their status
    console.log('\n🏪 All Stores Analysis:');
    const allStores = await prisma.store.findMany({
      include: {
        Product: {
          select: {
            id: true,
            name: true,
            status: true,
            stockQuantity: true,
            inStock: true
          }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });
    
    allStores.forEach((store, index) => {
      console.log(`\n   Store ${index + 1}: ${store.name}`);
      console.log(`   Status: ${store.status} | Active: ${store.isActive}`);
      console.log(`   Owner: ${store.user?.name || 'Unknown'} (${store.user?.email || 'No email'})`);
      console.log(`   Products: ${store.Product.length}`);
      
      if (store.Product.length > 0) {
        const approvedProducts = store.Product.filter(p => p.status === 'approved');
        const visibleProducts = approvedProducts.filter(p => 
          store.status === 'approved' && 
          store.isActive && 
          p.stockQuantity > 0
        );
        
        console.log(`   Approved Products: ${approvedProducts.length}`);
        console.log(`   Visible Products: ${visibleProducts.length}`);
        
        if (approvedProducts.length > visibleProducts.length) {
          console.log(`   ⚠️  ${approvedProducts.length - visibleProducts.length} approved products not visible due to store status`);
        }
      }
    });
    
    // 3. Find all approved products not visible in marketplace
    console.log('\n🔍 Products Not Visible in Marketplace:');
    const allApprovedProducts = await prisma.product.findMany({
      where: {
        status: 'approved'
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
    
    const invisibleProducts = allApprovedProducts.filter(product => 
      !(product.store.status === 'approved' && 
        product.store.isActive && 
        product.stockQuantity > 0)
    );
    
    if (invisibleProducts.length > 0) {
      console.log(`   Found ${invisibleProducts.length} approved products not visible:`);
      invisibleProducts.forEach(product => {
        console.log(`   - ${product.name} (Store: ${product.store.name})`);
        console.log(`     Issues: Store Status=${product.store.status}, Active=${product.store.isActive}, Stock=${product.stockQuantity}`);
      });
    } else {
      console.log('   ✅ All approved products are visible');
    }
    
    // 4. Check product route accessibility
    console.log('\n🔗 Checking Product Route Access:');
    if (specificProduct) {
      console.log(`   Product URL: /product/${specificProduct.id}`);
      console.log(`   This product should be accessible directly but may not show in marketplace listings`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

diagnoseStoreIssues();
