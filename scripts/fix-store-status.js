const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixStoreStatus() {
  try {
    console.log('🔍 Checking store status...')
    
    // Get all stores
    const stores = await prisma.store.findMany({
      include: {
        Product: true
      }
    })
    
    console.log(`Found ${stores.length} stores:`)
    
    stores.forEach(store => {
      console.log(`- Store: ${store.name}`)
      console.log(`  Status: ${store.status}`)
      console.log(`  Active: ${store.isActive}`)
      console.log(`  Products: ${store.Product.length}`)
      console.log('---')
    })
    
    // Check if there are any pending or inactive stores
    const inactiveStores = stores.filter(store => !store.isActive || store.status !== 'approved')
    
    if (inactiveStores.length > 0) {
      console.log('🔧 Found inactive/pending stores. Activating them...')
      
      // Activate all stores and approve them
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
      
      console.log(`✅ Activated ${result.count} stores`)
    } else {
      console.log('✅ All stores are already active and approved')
    }
    
    // Check products
    console.log('\n🔍 Checking products...')
    const products = await prisma.product.findMany({
      include: {
        store: true
      }
    })
    
    console.log(`Found ${products.length} total products:`)
    
    const visibleProducts = products.filter(product => 
      product.store.isActive && 
      product.store.status === 'approved' && 
      product.inStock
    )
    
    console.log(`${visibleProducts.length} products are visible in frontend`)
    console.log(`${products.length - visibleProducts.length} products are hidden`)
    
    if (products.length - visibleProducts.length > 0) {
      console.log('\n📋 Hidden products:')
      products.forEach(product => {
        if (!product.store.isActive || product.store.status !== 'approved' || !product.inStock) {
          console.log(`- ${product.name} (Store: ${product.store.name})`)
          console.log(`  Store Active: ${product.store.isActive}`)
          console.log(`  Store Status: ${product.store.status}`)
          console.log(`  In Stock: ${product.inStock}`)
          console.log('---')
        }
      })
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixStoreStatus()
