const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testProductApproval() {
  try {
    console.log('🧪 Testing Product Approval System...\n')

    // Get all products with their current status
    const products = await prisma.product.findMany({
      include: {
        store: {
          select: {
            name: true,
            username: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    console.log('📋 Current Product Status:')
    products.forEach(product => {
      console.log(`- ${product.name} (${product.store.name}): ${product.status}`)
    })

    if (products.length < 2) {
      console.log('❌ Need at least 2 products to test')
      return
    }

    // Approve the first product
    const firstProduct = await prisma.product.update({
      where: { id: products[0].id },
      data: {
        status: 'approved',
        reviewedBy: 'admin',
        reviewedAt: new Date(),
        adminNote: 'Great product! Approved for marketplace.'
      }
    })

    console.log(`\n✅ Approved: ${firstProduct.name}`)

    // Reject the second product
    const secondProduct = await prisma.product.update({
      where: { id: products[1].id },
      data: {
        status: 'rejected',
        reviewedBy: 'admin',
        reviewedAt: new Date(),
        adminNote: 'Please improve the product description and add more detailed images.'
      }
    })

    console.log(`❌ Rejected: ${secondProduct.name}`)

    // Show products visible in frontend (approved + active store + in stock)
    const publicProducts = await prisma.product.findMany({
      where: {
        store: {
          isActive: true,
          status: 'approved'
        },
        inStock: true,
        status: 'approved'  // New condition
      },
      include: {
        store: {
          select: {
            name: true
          }
        }
      }
    })

    console.log(`\n🌐 Products visible in frontend: ${publicProducts.length}`)
    publicProducts.forEach(product => {
      console.log(`- ${product.name} (${product.store.name})`)
    })

    // Show pending products for admin
    const pendingProducts = await prisma.product.findMany({
      where: {
        status: 'pending'
      },
      include: {
        store: {
          select: {
            name: true
          }
        }
      }
    })

    console.log(`\n⏳ Products pending approval: ${pendingProducts.length}`)
    pendingProducts.forEach(product => {
      console.log(`- ${product.name} (${product.store.name})`)
    })

    // Show rejected products for store owners
    const rejectedProducts = await prisma.product.findMany({
      where: {
        status: 'rejected'
      },
      include: {
        store: {
          select: {
            name: true
          }
        }
      }
    })

    console.log(`\n🚫 Products rejected (need resubmission): ${rejectedProducts.length}`)
    rejectedProducts.forEach(product => {
      console.log(`- ${product.name} (${product.store.name}): ${product.adminNote}`)
    })

    console.log('\n✅ Product approval system test completed!')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testProductApproval()
