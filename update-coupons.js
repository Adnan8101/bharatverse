const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function updateCoupons() {
    try {
        // Update existing coupons with proper discount values
        const updates = [
            { code: 'NEW10', discountValue: 10, maxDiscountAmount: 500 },
            { code: 'NEW20', discountValue: 20, maxDiscountAmount: 1000 },
            { code: 'OFF10', discountValue: 10, maxDiscountAmount: 500 },
            { code: 'OFF20', discountValue: 20, maxDiscountAmount: 1000 },
            { code: 'PLUS10', discountValue: 10, maxDiscountAmount: 500 }
        ]
        
        for (const update of updates) {
            await prisma.coupon.update({
                where: { code: update.code },
                data: {
                    discountValue: update.discountValue,
                    maxDiscountAmount: update.maxDiscountAmount,
                    minOrderAmount: 100
                }
            })
            console.log(`Updated ${update.code} with ${update.discountValue}% discount`)
        }
        
        console.log('\nTesting NEW10 after update:')
        const new10 = await prisma.coupon.findUnique({
            where: { code: 'NEW10' }
        })
        
        const subtotal = 2399
        const discount = Math.min((subtotal * new10.discountValue) / 100, new10.maxDiscountAmount || Infinity)
        
        console.log(`Subtotal: ₹${subtotal}`)
        console.log(`Discount (${new10.discountValue}%): ₹${Math.round(discount)}`)
        console.log(`Final Total: ₹${subtotal - Math.round(discount)}`)
        
    } catch (error) {
        console.error('Error:', error)
    } finally {
        await prisma.$disconnect()
    }
}

updateCoupons()
