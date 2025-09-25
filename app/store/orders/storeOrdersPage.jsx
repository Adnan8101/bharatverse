'use client'
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import Loading from "@/components/Loading"
import { User, Mail, Phone, MapPin, Package, Calendar, CreditCard, X, Eye } from "lucide-react"

export default function StoreOrders() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const fetchOrders = async () => {
        try {
            // Add timestamp to prevent caching
            const response = await fetch(`/api/store-owner/orders?t=${Date.now()}`, {
                credentials: 'include',
                cache: 'no-store' // Ensure fresh data
            });
            
            const result = await response.json();
            
            if (result.success) {
                setOrders(result.orders);
            } else {
                toast.error(result.message || 'Failed to fetch orders');
                setOrders([]);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Failed to fetch orders');
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }

    const updateOrderStatus = async (orderId, status) => {
        try {
            const response = await fetch('/api/store-owner/orders', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    orderId: orderId,
                    status: status
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                setOrders(orders.map(order => 
                    order.id === orderId 
                        ? { ...order, status: status }
                        : order
                ));
                toast.success('Order status updated successfully');
            } else {
                toast.error(result.message || 'Failed to update order status');
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            toast.error('Failed to update order status');
        }
    }

    const openModal = (order) => {
        setSelectedOrder(order)
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setSelectedOrder(null)
        setIsModalOpen(false)
    }

    const getStatusColor = (status) => {
        const colors = {
            'ORDER_PLACED': 'bg-blue-100 text-blue-800',
            'PROCESSING': 'bg-yellow-100 text-yellow-800',
            'SHIPPED': 'bg-purple-100 text-purple-800',
            'DELIVERED': 'bg-green-100 text-green-800'
        }
        return colors[status] || 'bg-gray-100 text-gray-800'
    }

    const formatAddress = (address) => {
        if (!address) return 'No address provided'
        const parts = [
            address.street,
            address.city,
            address.state,
            address.pincode
        ].filter(Boolean)
        return parts.join(', ')
    }

    useEffect(() => {
        fetchOrders()
    }, [])

    if (loading) return <Loading />

    return (
        <>
            <div className="p-6 bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8 flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Store Orders</h1>
                            <p className="text-gray-600">Manage and track all your store orders</p>
                        </div>
                        <button
                            onClick={() => {
                                setLoading(true);
                                fetchOrders();
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <Package size={16} />
                            Refresh Orders
                        </button>
                    </div>

                    {/* Orders Table */}
                    {orders.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm border p-12 text-center">
                            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
                            <p className="text-gray-600">Your orders will appear here once customers start purchasing.</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {orders.map((order, index) => (
                                            <tr
                                                key={order.id}
                                                className="hover:bg-gray-50 transition-colors duration-150"
                                            >
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                    #{index + 1}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                            <User size={16} className="text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">{order.user?.name}</div>
                                                            <div className="text-sm text-gray-500">{order.address?.name}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <Mail size={14} />
                                                            <span className="truncate max-w-[150px]">{order.user?.email}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <Phone size={14} />
                                                            <span>{order.address?.phone || 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-semibold text-gray-900">${order.total}</div>
                                                    {order.isCouponUsed && (
                                                        <div className="text-xs text-green-600">Discount: {order.coupon?.discount || 'N/A'}%</div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900">{order.paymentMethod}</div>
                                                    <div className={`text-xs ${order.isPaid ? 'text-green-600' : 'text-red-600'}`}>
                                                        {order.isPaid ? 'Paid' : 'Unpaid'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4" onClick={(e) => { e.stopPropagation() }}>
                                                    <select
                                                        value={order.status}
                                                        onChange={e => updateOrderStatus(order.id, e.target.value)}
                                                        className={`px-3 py-1 rounded-full text-xs font-medium border-0 focus:ring-2 focus:ring-blue-500 ${getStatusColor(order.status)}`}
                                                    >
                                                        <option value="ORDER_PLACED">Order Placed</option>
                                                        <option value="PROCESSING">Processing</option>
                                                        <option value="SHIPPED">Shipped</option>
                                                        <option value="DELIVERED">Delivered</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => openModal(order)}
                                                        className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                                                    >
                                                        <Eye size={14} />
                                                        View Details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Enhanced Modal */}
            {isModalOpen && selectedOrder && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-900">
                                Order Details
                            </h2>
                            <button
                                onClick={closeModal}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Customer Information */}
                            <div className="bg-blue-50 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <User size={20} className="text-blue-600" />
                                    Customer Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                <User size={16} className="text-blue-600" />
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-500">Customer Name</div>
                                                <div className="font-medium text-gray-900">{selectedOrder.user?.name}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                                <Mail size={16} className="text-green-600" />
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-500">Email Address</div>
                                                <div className="font-medium text-gray-900">{selectedOrder.user?.email}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                                <Phone size={16} className="text-purple-600" />
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-500">Phone Number</div>
                                                <div className="font-medium text-gray-900">{selectedOrder.address?.phone || 'Not provided'}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mt-1">
                                                <MapPin size={16} className="text-orange-600" />
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-500">Delivery Address</div>
                                                <div className="font-medium text-gray-900 max-w-xs">
                                                    {selectedOrder.address?.name && (
                                                        <div className="text-sm font-semibold text-blue-600 mb-1">
                                                            {selectedOrder.address.name}
                                                        </div>
                                                    )}
                                                    {formatAddress(selectedOrder.address)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Order Information */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-green-50 rounded-xl p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                            <CreditCard size={16} className="text-green-600" />
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-500">Total Amount</div>
                                            <div className="text-xl font-bold text-gray-900">${selectedOrder.total}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-purple-50 rounded-xl p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                            <CreditCard size={16} className="text-purple-600" />
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-500">Payment Method</div>
                                            <div className="text-lg font-semibold text-gray-900">{selectedOrder.paymentMethod}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-blue-50 rounded-xl p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                            <Calendar size={16} className="text-blue-600" />
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-500">Order Date</div>
                                            <div className="text-lg font-semibold text-gray-900">
                                                {new Date(selectedOrder.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Package size={20} className="text-blue-600" />
                                    Order Items
                                </h3>
                                <div className="space-y-3">
                                    {selectedOrder.orderItems.map((item, i) => (
                                        <div key={i} className="flex items-center gap-4 bg-gray-50 rounded-xl p-4">
                                            <img
                                                src={item.product.images?.[0]?.src || item.product.images?.[0]}
                                                alt={item.product?.name}
                                                className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                                            />
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-900">{item.product?.name}</h4>
                                                <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                                                    <div>
                                                        <span className="text-gray-500">Quantity:</span>
                                                        <span className="font-medium text-gray-900 ml-1">{item.quantity}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Price:</span>
                                                        <span className="font-medium text-gray-900 ml-1">${item.price}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Total:</span>
                                                        <span className="font-semibold text-green-600 ml-1">${(item.price * item.quantity).toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Additional Info */}
                            {(selectedOrder.isCouponUsed || selectedOrder.isPaid) && (
                                <div className="bg-yellow-50 rounded-xl p-4">
                                    <h4 className="font-semibold text-gray-900 mb-3">Additional Information</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Payment Status:</span>
                                            <span className={`font-medium ${selectedOrder.isPaid ? 'text-green-600' : 'text-red-600'}`}>
                                                {selectedOrder.isPaid ? 'Paid' : 'Unpaid'}
                                            </span>
                                        </div>
                                        {selectedOrder.isCouponUsed && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Coupon Applied:</span>
                                                <span className="font-medium text-green-600">
                                                    {selectedOrder.coupon?.discount || 0}% discount
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Order Status:</span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                                                {selectedOrder.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                            <button
                                onClick={closeModal}
                                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
