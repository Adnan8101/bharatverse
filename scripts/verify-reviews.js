const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verifyReviews() {
  console.log('🔍 Verifying Indian reviews in the database...\n')

  try {
    // Get products with their reviews and users
    const products = await prisma.product.findMany({
      include: {
        rating: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    console.log(`📦 Found ${products.length} products with reviews\n`)

    for (const product of products) {
      console.log(`🔥 ${product.name}`)
      console.log(`   Reviews: ${product.rating.length}`)
      
      if (product.rating.length > 0) {
        const avgRating = product.rating.reduce((sum, r) => sum + r.rating, 0) / product.rating.length
        console.log(`   Average Rating: ${avgRating.toFixed(1)}/5.0`)
        
        console.log(`   Latest Reviews:`)
        product.rating.slice(0, 3).forEach((review, index) => {
          console.log(`     ${index + 1}. ${review.user.name} (${review.rating}/5): "${review.review.substring(0, 60)}..."`)
        })
      }
      console.log('')
    }

    // Summary statistics
    const totalReviews = await prisma.rating.count()
    const avgRatingAll = await prisma.rating.aggregate({
      _avg: {
        rating: true
      }
    })

    const indianUsers = await prisma.user.findMany({
      where: {
        name: {
          in: ['Adnan', 'Harsh', 'Aadil', 'Ralph', 'Mitesh', 'Rahul', 'Hamza', 'Aamir', 'Sanket', 'Amitab', 'Arjun', 'Priya', 'Ravi', 'Kavya', 'Vikash']
        }
      }
    })

    console.log('📊 Summary Statistics:')
    console.log(`   Total Reviews: ${totalReviews}`)
    console.log(`   Average Rating: ${avgRatingAll._avg.rating?.toFixed(2)}/5.0`)
    console.log(`   Indian Users: ${indianUsers.length}`)
    console.log(`   Products with Reviews: ${products.filter(p => p.rating.length > 0).length}`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyReviews()
