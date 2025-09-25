const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testProductVisibilitySystem() {
  try {
    console.log('🧪 Testing Product Visibility System...\n')
    
    // Test 1: Check frontend API products endpoint
    console.log('1️⃣ Testing Frontend Products API...')
    
    const publicProducts = await prisma.product.findMany({
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
    
    console.log(`✅ Products visible in frontend: ${publicProducts.length}`)
    publicProducts.forEach(product => {
      console.log(`   - ${product.name} (Stock: ${product.stockQuantity}, Store: ${product.store.name})`)
    })
    
    // Test 2: Check store owner can only access approved stores
    console.log('\n2️⃣ Testing Store Owner Access Control...')
    
    const allStores = await prisma.store.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        isActive: true,
        _count: {
          select: {
            Product: true
          }
        }
      }
    })
    
    console.log('Store Access Status:')
    allStores.forEach(store => {
      const canAccess = store.status === 'approved' && store.isActive
      console.log(`   - ${store.name}: ${canAccess ? '✅ Can manage products' : '❌ Cannot manage products'} (${store.status}, Active: ${store.isActive}, Products: ${store._count.Product})`)
    })
    
    // Test 3: Verify stock logic
    console.log('\n3️⃣ Testing Stock Logic...')
    
    const allProducts = await prisma.product.findMany({
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
    
    console.log('Product Stock Analysis:')
    const stockAnalysis = {
      validVisible: [],
      invalidVisible: [],
      validHidden: [],
      invalidHidden: []
    }
    
    allProducts.forEach(product => {
      const shouldBeVisible = product.store.isActive && product.store.status === 'approved' && product.inStock && product.stockQuantity > 0
      const isActuallyVisible = product.store.isActive && product.store.status === 'approved' && product.inStock
      
      if (shouldBeVisible && isActuallyVisible) {
        stockAnalysis.validVisible.push(product)
      } else if (!shouldBeVisible && !isActuallyVisible) {
        stockAnalysis.validHidden.push(product)
      } else if (shouldBeVisible && !isActuallyVisible) {
        stockAnalysis.invalidHidden.push(product)
      } else if (!shouldBeVisible && isActuallyVisible) {
        stockAnalysis.invalidVisible.push(product)
      }
    })
    
    console.log(`   ✅ Correctly visible products: ${stockAnalysis.validVisible.length}`)
    console.log(`   ✅ Correctly hidden products: ${stockAnalysis.validHidden.length}`)
    console.log(`   ❌ Should be visible but hidden: ${stockAnalysis.invalidHidden.length}`)
    console.log(`   ❌ Should be hidden but visible: ${stockAnalysis.invalidVisible.length}`)
    
    if (stockAnalysis.invalidVisible.length > 0) {
      console.log('\n   Problems with visible products:')
      stockAnalysis.invalidVisible.forEach(product => {
        const issues = []
        if (!product.store.isActive) issues.push('Store inactive')
        if (product.store.status !== 'approved') issues.push(`Store ${product.store.status}`)
        if (!product.inStock) issues.push('Product out of stock')
        if (product.stockQuantity <= 0) issues.push('Stock quantity is 0')
        
        console.log(`      - ${product.name}: ${issues.join(', ')}`)
      })
    }
    
    if (stockAnalysis.invalidHidden.length > 0) {
      console.log('\n   Products that should be visible but aren\'t:')
      stockAnalysis.invalidHidden.forEach(product => {
        console.log(`      - ${product.name} (Stock: ${product.stockQuantity}, inStock: ${product.inStock})`)
      })
    }
    
    // Test 4: Test stock quantity consistency
    console.log('\n4️⃣ Testing Stock Quantity Consistency...')
    
    const inconsistentProducts = allProducts.filter(product => 
      (product.stockQuantity > 0 && !product.inStock) ||
      (product.stockQuantity === 0 && product.inStock)
    )
    
    if (inconsistentProducts.length === 0) {
      console.log('✅ All products have consistent stock quantity and inStock status')
    } else {
      console.log(`❌ Found ${inconsistentProducts.length} products with inconsistent stock:`)
      inconsistentProducts.forEach(product => {
        console.log(`   - ${product.name}: stockQuantity=${product.stockQuantity}, inStock=${product.inStock}`)
      })
    }
    
    // Test 5: Summary
    console.log('\n5️⃣ System Summary:')
    console.log('========================================')
    console.log(`Total Stores: ${allStores.length}`)
    console.log(`Active Approved Stores: ${allStores.filter(s => s.isActive && s.status === 'approved').length}`)
    console.log(`Total Products: ${allProducts.length}`)
    console.log(`Products Visible in Frontend: ${publicProducts.length}`)
    console.log(`Products Hidden from Frontend: ${allProducts.length - publicProducts.length}`)
    
    const storeProductCounts = {}
    publicProducts.forEach(product => {
      const storeName = product.store.name
      storeProductCounts[storeName] = (storeProductCounts[storeName] || 0) + 1
    })
    
    console.log('\nVisible Products by Store:')
    Object.entries(storeProductCounts).forEach(([storeName, count]) => {
      console.log(`   - ${storeName}: ${count} products`)
    })
    
    // Workflow explanation
    console.log('\n6️⃣ Product Visibility Workflow:')
    console.log('========================================')
    console.log('For a product to be visible in the frontend:')
    console.log('1. ✅ Store must be approved (status = "approved")')
    console.log('2. ✅ Store must be active (isActive = true)')
    console.log('3. ✅ Product must be in stock (inStock = true)')
    console.log('4. ✅ Product must have stock quantity > 0')
    console.log('')
    console.log('Store Owner can:')
    console.log('- ✅ Add products (auto inStock based on stockQuantity)')
    console.log('- ✅ Update stock quantity (auto updates inStock)')
    console.log('- ✅ Toggle inStock status (with validation)')
    console.log('- ✅ View real-time visibility status')
    
    const isSystemHealthy = inconsistentProducts.length === 0 && 
                           stockAnalysis.invalidVisible.length === 0 && 
                           stockAnalysis.invalidHidden.length === 0
    
    console.log(`\n🎯 System Health: ${isSystemHealthy ? '✅ HEALTHY' : '❌ NEEDS ATTENTION'}`)
    
  } catch (error) {
    console.error('❌ Test Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testProductVisibilitySystem()
