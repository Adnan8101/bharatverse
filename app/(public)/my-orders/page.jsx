'use client'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Package, Truck, CheckCircle, Clock, MapPin, Phone, CreditCard } from 'lucide-react'
import Image from 'next/image'
import Loading from '@/components/Loading'
import { useDynamicLanguage } from '@/contexts/DynamicLanguageContext'
import { useDynamicTranslation } from '@/hooks/useDynamicTranslation'

export default function MyOrders() {
    const { isSignedIn, user } = useUser()
    const router = useRouter()
    // const { t } = useLanguage() // Remove this line since we're using dynamic translation
    const { currentLanguage } = useDynamicLanguage() // Use dynamic language context instead
    useDynamicTranslation() // Hook to trigger page translation
    
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

    // Redirect if not signed in
    useEffect(() => {
        if (!isSignedIn) {
            router.push('/sign-in')
            return
        }
    }, [isSignedIn, router])

    // Load orders on mount
    useEffect(() => {
        if (isSignedIn) {
            loadOrders()
        }
    }, [isSignedIn])

    const loadOrders = async () => {
        try {
            const response = await fetch('/api/orders')
            if (response.ok) {
                const data = await response.json()
                setOrders(data.data || [])
            } else {
                console.error('Failed to load orders')
            }
        } catch (error) {
            console.error('Error loading orders:', error)
        } finally {
            setLoading(false)
        }
    }

    const getPaymentMethodName = (method) => {
        switch (method) {
            case 'cod':
                return 'Cash on Delivery'
            case 'card':
                return 'Card Payment'
            default:
                return 'Razorpay (UPI/Cards/Wallets)'
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'ORDER_PLACED':
                return <Clock className="w-6 h-6 text-white" />
            case 'PROCESSING':
                return <Package className="w-6 h-6 text-white" />
            case 'SHIPPED':
                return <Truck className="w-6 h-6 text-white" />
            case 'DELIVERED':
                return <CheckCircle className="w-6 h-6 text-white" />
            default:
                return <Clock className="w-6 h-6 text-white" />
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'ORDER_PLACED':
                return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
            case 'PROCESSING':
                return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
            case 'SHIPPED':
                return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
            case 'DELIVERED':
                return 'bg-gradient-to-r from-green-500 to-green-600 text-white'
            default:
                return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
        }
    }

    if (!isSignedIn) {
        return null // Will redirect
    }

    if (loading) {
        return <Loading />
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                                My Orders
                            </h1>
                            <p className="text-slate-600 mt-2">
                                {orders.length > 0 ? `${orders.length} orders found` : 'Track your order journey'}
                            </p>
                        </div>
                        <button 
                            onClick={() => router.push('/shop')}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                            Continue Shopping
                        </button>
                    </div>
                    <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full w-24"></div>
                </div>

                {orders.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md mx-auto">
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Package className="w-12 h-12 text-blue-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-4">No Orders Yet</h2>
                            <p className="text-slate-600 mb-8">You haven't placed any orders yet. Start shopping to see your orders here!</p>
                            <button 
                                onClick={() => router.push('/shop')}
                                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                Start Shopping
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {orders.map((order, index) => (
                            <div 
                                key={order.id} 
                                className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 animate-slideUp"
                                style={{
                                    animationDelay: `${index * 0.1}s`
                                }}
                            >
                                {/* Order Header */}
                                <div className="bg-gradient-to-r from-slate-50 to-blue-50/50 p-6 border-b border-slate-200/50">
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                        <div className="flex items-center gap-6">
                                            <div className="relative">
                                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                                                    {getStatusIcon(order.status)}
                                                </div>
                                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                                    <CheckCircle className="w-4 h-4 text-white" />
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-slate-800 mb-1">
                                                    Order #{order.id.slice(-8).toUpperCase()}
                                                </h3>
                                                <p className="text-slate-600 flex items-center gap-2">
                                                    <Clock className="w-4 h-4" />
                                                    Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="relative">
                                                <span className={`px-4 py-2 rounded-full text-sm font-semibold shadow-lg ${getStatusColor(order.status)} border border-white/20`}>
                                                    {order.status.replace('_', ' ')}
                                                </span>
                                                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full blur opacity-20"></div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                                                    {currency}{order.total.toLocaleString()}
                                                </p>
                                                <p className="text-sm text-slate-600 flex items-center gap-1">
                                                    <CreditCard className="w-3 h-3" />
                                                    {getPaymentMethodName(order.paymentMethod)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="p-6">
                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                        {/* Items */}
                                        <div>
                                            <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                                <Package className="w-5 h-5 text-blue-600" />
                                                Items Ordered
                                            </h4>
                                            <div className="space-y-4">
                                                {order.orderItems.map((item, index) => (
                                                    <div key={index} className="group bg-gradient-to-r from-slate-50 to-blue-50/30 p-4 rounded-xl border border-slate-200/50 hover:shadow-lg transition-all duration-300">
                                                        <div className="flex items-center gap-4">
                                                            <div className="relative w-16 h-16 bg-white rounded-xl shadow-md flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                                                                <Image 
                                                                    src={item.product.images?.[0] || '/api/placeholder/150/150'} 
                                                                    alt={item.product.name}
                                                                    width={50} 
                                                                    height={50}
                                                                    className="w-12 h-12 object-cover rounded-lg"
                                                                />
                                                                <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                                                                    {item.quantity}
                                                                </div>
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">{item.product.name}</p>
                                                                <p className="text-sm text-slate-600 bg-slate-200 px-2 py-1 rounded-full inline-block mt-1">{item.product.category}</p>
                                                                <p className="text-sm text-slate-700 mt-2 font-medium">
                                                                    {currency}{item.price.toLocaleString()} × {item.quantity}
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                                                                            <div className="text-right">
                                                                <p className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                                                    {currency}{(item.price * item.quantity).toLocaleString()}
                                                                </p>
                                                            </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Delivery Address */}
                                        <div>
                                            <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                                <MapPin className="w-5 h-5 text-green-600" />
                                                Delivery Address
                                            </h4>
                                            <div className="bg-gradient-to-r from-green-50 to-emerald-50/50 rounded-xl p-6 border border-green-200/50 shadow-sm">
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                                                            <span className="text-white font-bold text-sm">{order.address.name[0]}</span>
                                                        </div>
                                                        <span className="font-bold text-slate-800 text-lg">{order.address.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-slate-700">
                                                        <Phone className="w-5 h-5 text-blue-600" />
                                                        <span className="font-medium">{order.address.phone}</span>
                                                    </div>
                                                    <div className="flex items-start gap-3 text-slate-700">
                                                        <MapPin className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                                                        <div className="space-y-1">
                                                            <p className="font-medium">{order.address.street}</p>
                                                            {order.address.landmark && (
                                                                <p className="text-sm text-slate-600 bg-yellow-100 px-2 py-1 rounded-full inline-block">
                                                                    📍 Near: {order.address.landmark}
                                                                </p>
                                                            )}
                                                            <p className="text-slate-600">
                                                                <span className="font-medium">{order.address.city}</span>, {order.address.state} - <span className="font-bold">{order.address.pincode}</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Summary */}
                                    <div className="mt-8 bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-xl p-6 border border-slate-200/50">
                                        <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                            <CreditCard className="w-5 h-5 text-purple-600" />
                                            Order Summary
                                        </h4>
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-slate-700">
                                                <span>Subtotal</span>
                                                <span>{currency}{(order.total - (order.shipping || 0) + (order.couponDiscount || 0)).toLocaleString()}</span>
                                            </div>
                                            {order.shipping && order.shipping > 0 && (
                                                <div className="flex justify-between text-slate-700">
                                                    <span>Shipping</span>
                                                    <span>{currency}{order.shipping.toLocaleString()}</span>
                                                </div>
                                            )}
                                            {order.couponDiscount && order.couponDiscount > 0 && (
                                                <div className="flex justify-between text-green-600">
                                                    <span>Coupon Discount</span>
                                                    <span>-{currency}{order.couponDiscount.toLocaleString()}</span>
                                                </div>
                                            )}
                                            <hr className="border-slate-300" />
                                            <div className="flex justify-between text-lg font-bold text-slate-800">
                                                <span>Total</span>
                                                <span>{currency}{order.total.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
