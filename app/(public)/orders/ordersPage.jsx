'use client'
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Truck, CheckCircle, XCircle, Clock, Package } from 'lucide-react';
import PageTitle from '@/components/PageTitle';

export default function OrdersPage() {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹';
    const { user } = useUser();
    const router = useRouter();
    
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user) {
            fetchOrders();
        } else if (user === null) {
            // User is definitively not authenticated, redirect
            router.push('/sign-in?redirect=/orders');
        }
    }, [user]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/orders');
            const result = await response.json();
            
            if (result.success) {
                setOrders(result.data);
            } else {
                setError('Failed to fetch orders');
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            setError('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return <Clock size={16} className="text-yellow-600" />;
            case 'confirmed':
                return <CheckCircle size={16} className="text-blue-600" />;
            case 'shipped':
                return <Truck size={16} className="text-blue-600" />;
            case 'delivered':
                return <CheckCircle size={16} className="text-green-600" />;
            case 'cancelled':
                return <XCircle size={16} className="text-red-600" />;
            default:
                return <Package size={16} className="text-gray-600" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'confirmed':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'shipped':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'delivered':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!user) {
        return null; // Return null while waiting for auth state or redirect
    }

    if (loading) {
        return (
            <div className="min-h-screen mx-6">
                <div className="max-w-6xl mx-auto">
                    <PageTitle heading="My Orders" text="Track your orders" />
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-500">Loading your orders...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen mx-6">
                <div className="max-w-6xl mx-auto">
                    <PageTitle heading="My Orders" text="Track your orders" />
                    <div className="text-center py-20">
                        <XCircle size={48} className="mx-auto mb-4 text-red-500" />
                        <p className="text-red-500 mb-4">{error}</p>
                        <button
                            onClick={fetchOrders}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen mx-6">
            <div className="max-w-6xl mx-auto">
                <PageTitle heading="My Orders" text="Track your orders" linkText="Continue Shopping" linkUrl="/shop" />
                
                {orders.length === 0 ? (
                    <div className="text-center py-20">
                        <ShoppingBag size={64} className="mx-auto mb-4 text-gray-300" />
                        <h2 className="text-2xl font-semibold mb-2 text-gray-600">No orders yet</h2>
                        <p className="text-gray-500 mb-6">Start shopping to see your orders here!</p>
                        <button
                            onClick={() => router.push('/shop')}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                                {/* Order Header */}
                                <div className="bg-gray-50 px-6 py-4 border-b">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-gray-900">Order #{order.id}</h3>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                                                    <div className="flex items-center gap-1">
                                                        {getStatusIcon(order.status)}
                                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                    </div>
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                Placed on {formatDate(order.createdAt)}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-lg">{currency}{order.total.toLocaleString()}</p>
                                            <p className="text-sm text-gray-600">{order.orderItems.length} item(s)</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="px-6 py-4">
                                    <div className="space-y-4">
                                        {order.orderItems.map((item, index) => (
                                            <div key={index} className="flex items-center gap-4">
                                                <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center">
                                                    <img 
                                                        src={item.product.images[0]} 
                                                        alt={item.product.name}
                                                        className="w-12 h-12 object-contain"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                                                    <p className="text-sm text-gray-600">{item.product.category}</p>
                                                    <p className="text-sm text-gray-600">
                                                        Qty: {item.quantity} × {currency}{item.price.toLocaleString()}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium">
                                                        {currency}{(item.quantity * item.price).toLocaleString()}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        by {item.product.store.name}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Delivery Address */}
                                {order.address && (
                                    <div className="px-6 py-4 bg-gray-50 border-t">
                                        <h4 className="font-medium text-gray-900 mb-2">Delivery Address</h4>
                                        <div className="text-sm text-gray-600">
                                            <p className="font-medium">{order.address.name}</p>
                                            <p>{order.address.phone}</p>
                                            <p>
                                                {order.address.street}, {order.address.city}, {order.address.state} - {order.address.pincode}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Order Summary */}
                                <div className="px-6 py-4 border-t">
                                    <div className="flex justify-between items-center text-sm mb-2">
                                        <span>Subtotal:</span>
                                        <span>{currency}{(order.coupon?.subtotal || order.total).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm mb-2">
                                        <span>Shipping:</span>
                                        <span className={(order.coupon?.shipping || 0) === 0 ? 'text-green-600' : ''}>
                                            {(order.coupon?.shipping || 0) === 0 ? 'FREE' : `${currency}${order.coupon?.shipping || 0}`}
                                        </span>
                                    </div>
                                    {(order.coupon?.discount || 0) > 0 && (
                                        <div className="flex justify-between items-center text-sm mb-2 text-green-600">
                                            <span>Coupon Discount:</span>
                                            <span>-{currency}{(order.coupon?.discount || 0).toLocaleString()}</span>
                                        </div>
                                    )}
                                    <hr className="my-2" />
                                    <div className="flex justify-between items-center font-semibold">
                                        <span>Total:</span>
                                        <span>{currency}{order.total.toLocaleString()}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Payment Method: {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card Payment'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}