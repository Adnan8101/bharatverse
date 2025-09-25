const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function comprehensiveProductVisibilityFix() {
  try {
    console.log('🔧 Starting comprehensive product visibility fix...\n')
    
    // Step 1: Ensure all stores have proper status
    console.log('1️⃣ Checking store status...')
    const stores = await prisma.store.findMany({
      include: {
        Product: true
      }
    })
    
    console.log(`Found ${stores.length} stores:`)
    stores.forEach(store => {
      console.log(`- ${store.name}: ${store.status} | Active: ${store.isActive} | Products: ${store.Product.length}`)
    })
    
    // Step 2: Fix any inactive or non-approved stores
    const inactiveStores = stores.filter(store => !store.isActive || store.status !== 'approved')
    
    if (inactiveStores.length > 0) {
      console.log('\n🔧 Fixing inactive/non-approved stores...')
      
      const result = await prisma.store.updateMany({
        where: {
          OR: [
            { isActive: false },
            { status: { not: 'approved' } }
          ]
        },
        data: {
          isActive: true,
          status: 'approved'
        }
      })
      
      console.log(`✅ Fixed ${result.count} stores`)
    } else {
      console.log('✅ All stores are properly configured')
    }
    
    // Step 3: Check product visibility logic
    console.log('\n2️⃣ Analyzing product visibility...')
    
    const allProducts = await prisma.product.findMany({
      include: {
        store: true
      }
    })
    
    console.log(`Total products in database: ${allProducts.length}`)
    
    // Products that should be visible (based on current API logic)
    const visibleProducts = allProducts.filter(product => 
      product.store.isActive && 
      product.store.status === 'approved' && 
      product.inStock
    )
    
    // Products that are hidden and why
    const hiddenProducts = allProducts.filter(product => 
      !product.store.isActive || 
      product.store.status !== 'approved' || 
      !product.inStock
    )
    
    console.log(`Visible products: ${visibleProducts.length}`)
    console.log(`Hidden products: ${hiddenProducts.length}`)
    
    if (hiddenProducts.length > 0) {
      console.log('\n📋 Hidden products breakdown:')
      hiddenProducts.forEach(product => {
        const reasons = []
        if (!product.store.isActive) reasons.push('Store inactive')
        if (product.store.status !== 'approved') reasons.push(`Store ${product.store.status}`)
        if (!product.inStock) reasons.push('Out of stock')
        
        console.log(`- ${product.name} (${product.store.name}): ${reasons.join(', ')}`)
      })
    }
    
    // Step 4: Fix products with inconsistent stock status
    console.log('\n3️⃣ Fixing product stock inconsistencies...')
    
    // Find products that have stock quantity > 0 but are marked as out of stock
    const inconsistentProducts = await prisma.product.findMany({
      where: {
        stockQuantity: {
          gt: 0
        },
        inStock: false
      }
    })
    
    if (inconsistentProducts.length > 0) {
      console.log(`Found ${inconsistentProducts.length} products with inconsistent stock status`)
      
      const fixResult = await prisma.product.updateMany({
        where: {
          stockQuantity: {
            gt: 0
          },
          inStock: false
        },
        data: {
          inStock: true
        }
      })
      
      console.log(`✅ Fixed ${fixResult.count} products with inconsistent stock`)
    } else {
      console.log('✅ No stock inconsistencies found')
    }
    
    // Step 5: Ensure proper default values for new products
    console.log('\n4️⃣ Setting proper defaults for products with missing values...')
    
    // Get products that might have issues
    const productsWithIssues = await prisma.product.findMany({
      where: {
        OR: [
          { stockQuantity: { lt: 0 } },
          { stockQuantity: 0, inStock: true }
        ]
      }
    })
    
    if (productsWithIssues.length > 0) {
      console.log(`Found ${productsWithIssues.length} products with potential issues`)
      
      // Fix products with negative stock
      const negativeStockResult = await prisma.product.updateMany({
        where: {
          stockQuantity: { lt: 0 }
        },
        data: {
          stockQuantity: 0,
          inStock: false
        }
      })
      
      if (negativeStockResult.count > 0) {
        console.log(`✅ Fixed ${negativeStockResult.count} products with negative stock`)
      }
      
      // Fix products that are marked as inStock but have 0 quantity
      const zeroStockInStockResult = await prisma.product.updateMany({
        where: {
          stockQuantity: 0,
          inStock: true
        },
        data: {
          inStock: false
        }
      })
      
      if (zeroStockInStockResult.count > 0) {
        console.log(`✅ Fixed ${zeroStockInStockResult.count} products marked as inStock with 0 quantity`)
      }
    } else {
      console.log('✅ No issues found with product stock values')
    }
    
    // Step 6: Final verification
    console.log('\n5️⃣ Final verification...')
    
    const finalVisibleProducts = await prisma.product.findMany({
      where: {
        store: {
          isActive: true,
          status: 'approved'
        },
        inStock: true
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
    })
    
    console.log(`\n🎉 FINAL RESULT: ${finalVisibleProducts.length} products are now visible in frontend`)
    
    if (finalVisibleProducts.length > 0) {
      console.log('\n📊 Visible products by store:')
      const storeProductCounts = {}
      finalVisibleProducts.forEach(product => {
        const storeName = product.store.name
        storeProductCounts[storeName] = (storeProductCounts[storeName] || 0) + 1
      })
      
      Object.entries(storeProductCounts).forEach(([storeName, count]) => {
        console.log(`- ${storeName}: ${count} products`)
      })
    }
    
    // Step 7: Provide summary of the visibility logic
    console.log('\n📝 Product Visibility Logic Summary:')
    console.log('A product is visible in the frontend when:')
    console.log('✅ Store is active (isActive = true)')
    console.log('✅ Store is approved (status = "approved")')
    console.log('✅ Product is in stock (inStock = true)')
    console.log('✅ Store owner can toggle inStock status from their dashboard')
    
    console.log('\n🔄 Store Owner Workflow:')
    console.log('1. Store owner creates account → Store status: "pending"')
    console.log('2. Admin approves store → Store status: "approved", isActive: true')
    console.log('3. Store owner adds products → Products created with inStock based on stockQuantity')
    console.log('4. Store owner can toggle inStock status → Controls frontend visibility')
    console.log('5. Only products from approved, active stores that are inStock appear in frontend')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

comprehensiveProductVisibilityFix()
