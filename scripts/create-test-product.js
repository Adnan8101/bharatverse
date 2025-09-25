const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createTestProduct() {
  try {
    console.log('🔄 Creating test product for GreatStack store...')
    
    // Find GreatStack store
    const greatStackStore = await prisma.store.findUnique({
      where: { username: 'greatstack' }
    })
    
    if (!greatStackStore) {
      console.log('❌ GreatStack store not found')
      return
    }
    
    console.log(`✅ Found GreatStack store: ${greatStackStore.name} (Active: ${greatStackStore.isActive})`)
    
    // Create a test product
    const product = await prisma.product.create({
      data: {
        name: 'Test Product from GreatStack',
        description: 'This is a test product created by GreatStack store to verify the product creation and display functionality.',
        mrp: 5000,
        price: 3999,
        images: ['/product_img1.png'],
        category: 'Test',
        inStock: true,
        stockQuantity: 10,
        storeId: greatStackStore.id
      }
    })
    
    console.log(`✅ Created test product: ${product.name} (ID: ${product.id})`)
    
    // Verify the product can be fetched
    const products = await prisma.product.findMany({
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
            username: true,
            isActive: true,
            status: true
          }
        }
      }
    })
    
    console.log(`\n📊 Total active products: ${products.length}`)
    const storeProductCounts = {}
    products.forEach(product => {
      const storeName = product.store.name
      storeProductCounts[storeName] = (storeProductCounts[storeName] || 0) + 1
    })
    
    Object.entries(storeProductCounts).forEach(([storeName, count]) => {
      console.log(`- ${storeName}: ${count} products`)
    })
    
  } catch (error) {
    console.error('❌ Error creating test product:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestProduct()
