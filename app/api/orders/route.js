import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { sendOrderConfirmation, sendNewOrderAlert } from '@/lib/emailService'

// Ensure user exists in our database with email from Clerk
async function ensureUser(userId, userEmail, userName) {
    try {
        let user = await prisma.user.findUnique({
            where: { id: userId }
        })

        if (!user) {
            try {
                user = await prisma.user.create({
                    data: {
                        id: userId,
                        email: userEmail || '',
                        name: userName || 'User',
                        image: '', // You can add user image later
                        cart: {}
                    }
                })
            } catch (createError) {
                // If user already exists (race condition), fetch it
                if (createError.code === 'P2002') {
                    user = await prisma.user.findUnique({
                        where: { id: userId }
                    })
                } else {
                    throw createError
                }
            }
        } else if (!user.email && userEmail) {
            // Update user with email if it's missing
            user = await prisma.user.update({
                where: { id: userId },
                data: { email: userEmail, name: userName || user.name }
            })
        }

        return user
    } catch (error) {
        console.error('Error ensuring user exists:', error)
        return null
    }
}

// GET - Fetch user orders
export async function GET() {
    try {
        const { userId } = await auth()
        
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get current user data from Clerk and ensure sync
        const clerkUser = await currentUser()
        if (clerkUser) {
            await ensureUser(
                userId,
                clerkUser.primaryEmailAddress?.emailAddress,
                clerkUser.firstName ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim() : clerkUser.fullName
            )
        }

        const orders = await prisma.order.findMany({
            where: { userId },
            include: {
                orderItems: {
                    include: {
                        product: {
                            include: {
                                store: true
                            }
                        }
                    }
                },
                address: true
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json({ success: true, data: orders })
    } catch (error) {
        console.error('Error fetching orders:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch orders' },
            { status: 500 }
        )
    }
}

// POST - Create new order
export async function POST(request) {
    try {
        const { userId } = await auth()
        
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get current user data from Clerk
        const clerkUser = await currentUser()
        
        if (!clerkUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Ensure user exists in our database with latest Clerk data
        await ensureUser(
            userId,
            clerkUser.primaryEmailAddress?.emailAddress,
            clerkUser.firstName ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim() : clerkUser.fullName
        )

        const { 
            items, 
            addressId, 
            paymentMethod, 
            paymentId,
            subtotal, 
            shipping, 
            couponDiscount = 0, 
            total 
        } = await request.json()

        // Validate required fields
        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Items are required' },
                { status: 400 }
            )
        }

        if (!addressId) {
            return NextResponse.json(
                { success: false, error: 'Address is required' },
                { status: 400 }
            )
        }

        // Get storeId from the first product (all items should be from same store)
        const firstProduct = await prisma.product.findUnique({
            where: { id: items[0].productId },
            select: { storeId: true }
        })

        if (!firstProduct) {
            return NextResponse.json(
                { success: false, error: 'Product not found' },
                { status: 400 }
            )
        }

        // Create order with order items
        const order = await prisma.order.create({
            data: {
                userId,
                storeId: firstProduct.storeId,
                addressId,
                paymentMethod: paymentMethod.toUpperCase(),
                paymentId: paymentId || null,
                total,
                isPaid: paymentMethod.toLowerCase() === 'card' || paymentMethod.toLowerCase() === 'razorpay',
                isCouponUsed: couponDiscount > 0,
                coupon: couponDiscount > 0 ? { 
                    discount: couponDiscount,
                    subtotal: subtotal,
                    shipping: shipping 
                } : {
                    subtotal: subtotal,
                    shipping: shipping
                },
                orderItems: {
                    create: items.map(item => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price
                    }))
                }
            },
            include: {
                orderItems: {
                    include: {
                        product: {
                            include: {
                                store: true
                            }
                        }
                    }
                },
                address: true
            }
        })

        // Clear user's cart
        await prisma.user.update({
            where: { id: userId },
            data: { cart: {} }
        })

        // Get user and store details for email notifications
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true }
        })

        const store = await prisma.store.findUnique({
            where: { id: firstProduct.storeId },
            select: { id: true, name: true, email: true }
        })

        // Send email notifications asynchronously
        if (user && store) {
            // Send order confirmation to customer
            sendOrderConfirmation(order, user, store).catch(error => {
                console.error('Failed to send order confirmation email:', error)
            })

            // Send new order alert to store owner
            sendNewOrderAlert(order, user, store).catch(error => {
                console.error('Failed to send new order alert email:', error)
            })
        }

        return NextResponse.json({ success: true, data: order })
    } catch (error) {
        console.error('Error creating order:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to create order' },
            { status: 500 }
        )
    }
}