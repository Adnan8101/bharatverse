const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createTestCoupon() {
    try {
        const coupon = await prisma.coupon.create({
            data: {
                code: 'NEW10',
                description: '10% discount for new users',
                discountType: 'percentage',
                discountValue: 10,
                maxDiscountAmount: 500,
                minOrderAmount: 100,
                forNewUser: true,
                forMember: false,
                isPublic: true,
                isActive: true,
                expiresAt: new Date('2024-12-31')
            }
        })
        
        console.log('Test coupon created:', coupon)
        
        // Test calculation
        const subtotal = 2399
        const discount = Math.min((subtotal * coupon.discountValue) / 100, coupon.maxDiscountAmount || Infinity)
        console.log(`For subtotal ₹${subtotal}, discount would be: ₹${Math.round(discount)}`)
        
    } catch (error) {
        console.error('Error:', error)
    } finally {
        await prisma.$disconnect()
    }
}

createTestCoupon()
