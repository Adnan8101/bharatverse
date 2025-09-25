// Test database connection
import { prisma } from './prisma'

export async function testDatabaseConnection() {
  try {
    await prisma.$connect()
    console.log('✅ Database connected successfully!')
    
    // Test query
    const userCount = await prisma.user.count()
    const productCount = await prisma.product.count()
    const storeCount = await prisma.store.count()
    
    console.log(`📊 Database Stats:`)
    console.log(`   Users: ${userCount}`)
    console.log(`   Products: ${productCount}`)
    console.log(`   Stores: ${storeCount}`)
    
    return {
      success: true,
      stats: { users: userCount, products: productCount, stores: storeCount }
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return { success: false, error: error.message }
  } finally {
    await prisma.$disconnect()
  }
}
