const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkCoupons() {
    try {
        const coupons = await prisma.coupon.findMany()
        console.log('Existing coupons:')
        coupons.forEach(coupon => {
            console.log(`Code: ${coupon.code}`)
            console.log(`Description: ${coupon.description}`)
            console.log(`Type: ${coupon.discountType}`)
            console.log(`Value: ${coupon.discountValue}`)
            console.log(`Max Discount: ${coupon.maxDiscountAmount}`)
            console.log(`Min Order: ${coupon.minOrderAmount}`)
            console.log(`Active: ${coupon.isActive}`)
            console.log('---')
        })
        
        // Test NEW10 coupon specifically
        const new10 = await prisma.coupon.findUnique({
            where: { code: 'NEW10' }
        })
        
        if (new10) {
            console.log('\nTesting NEW10 coupon:')
            const subtotal = 2399
            let discount = 0
            
            if (new10.discountType === 'percentage') {
                discount = Math.min((subtotal * new10.discountValue) / 100, new10.maxDiscountAmount || Infinity)
            } else {
                discount = new10.discountValue
            }
            
            console.log(`Subtotal: ₹${subtotal}`)
            console.log(`Discount: ₹${Math.round(discount)}`)
            console.log(`Final Total: ₹${subtotal - Math.round(discount)}`)
        }
        
    } catch (error) {
        console.error('Error:', error)
    } finally {
        await prisma.$disconnect()
    }
}

checkCoupons()
