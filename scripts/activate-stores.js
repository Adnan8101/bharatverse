const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function activateAllStores() {
  try {
    console.log('🔄 Activating all stores...')
    
    const result = await prisma.store.updateMany({
      data: {
        isActive: true,
        status: 'approved'
      }
    })
    
    console.log(`✅ Activated ${result.count} stores`)
    
    // Show all stores status
    const stores = await prisma.store.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        isActive: true,
        status: true,
        _count: {
          select: {
            Product: true
          }
        }
      }
    })
    
    console.log('\n📊 Store Status:')
    stores.forEach(store => {
      console.log(`- ${store.name} (@${store.username}): ${store.isActive ? '✅ Active' : '❌ Inactive'} | ${store.status} | ${store._count.Product} products`)
    })
    
  } catch (error) {
    console.error('❌ Error activating stores:', error)
  } finally {
    await prisma.$disconnect()
  }
}

activateAllStores()
