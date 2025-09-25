const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function ensureProductsInStock() {
  try {
    console.log('🔍 Checking product stock status...')
    
    // Get all products
    const products = await prisma.product.findMany({
      include: {
        store: true
      }
    })
    
    console.log(`Found ${products.length} total products`)
    
    // Count products by stock status
    const inStockCount = products.filter(p => p.inStock).length
    const outOfStockCount = products.filter(p => !p.inStock).length
    
    console.log(`📦 ${inStockCount} products in stock`)
    console.log(`❌ ${outOfStockCount} products out of stock`)
    
    if (outOfStockCount > 0) {
      console.log('\n🔧 Setting all products to in stock...')
      
      const result = await prisma.product.updateMany({
        where: {
          inStock: false
        },
        data: {
          inStock: true,
          stockQuantity: { 
            gte: 1 // Only update if stockQuantity is at least 1, otherwise set to 10
          }
        }
      })
      
      // For products with 0 stock, set stock quantity to 10
      await prisma.product.updateMany({
        where: {
          stockQuantity: 0
        },
        data: {
          stockQuantity: 10,
          inStock: true
        }
      })
      
      console.log(`✅ Updated stock status for products`)
    }
    
    // Final check
    const finalProducts = await prisma.product.findMany({
      where: {
        store: {
          isActive: true,
          status: 'approved'
        },
        inStock: true
      },
      include: {
        store: true
      }
    })
    
    console.log(`\n🎉 Final result: ${finalProducts.length} products are now visible in the frontend`)
    console.log('\nProducts visible in shop:')
    finalProducts.forEach(product => {
      console.log(`- ${product.name} (${product.category}) - ${product.store.name}`)
    })
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

ensureProductsInStock()
