'use client'
import { useEffect, useState } from "react"
import { format } from "date-fns"
import toast from "react-hot-toast"
import { CheckCircle, XCircle, Clock, Eye, Percent, DollarSign, User, Store } from "lucide-react"

export default function AdminStoreCoupons() {
    const [coupons, setCoupons] = useState([])
    const [loading, setLoading] = useState(false)
    const [selectedCoupon, setSelectedCoupon] = useState(null)
    const [reviewNote, setReviewNote] = useState('')
    const [actionLoading, setActionLoading] = useState(false)

    const fetchCoupons = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/admin/store-coupons')
            const result = await response.json()
            
            if (result.success) {
                setCoupons(result.data)
            } else {
                toast.error('Failed to fetch store coupons')
            }
        } catch (error) {
            console.error('Error fetching store coupons:', error)
            toast.error('Failed to fetch store coupons')
        } finally {
            setLoading(false)
        }
    }

    const handleReview = async (couponId, action) => {
        if (!couponId || !action) return

        setActionLoading(true)
        try {
            const response = await fetch(`/api/admin/store-coupons/${couponId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action,
                    note: reviewNote
                })
            })

            const result = await response.json()

            if (result.success) {
                toast.success(result.message)
                setSelectedCoupon(null)
                setReviewNote('')
                fetchCoupons()
            } else {
                toast.error(result.error)
            }
        } catch (error) {
            console.error('Error reviewing coupon:', error)
            toast.error('Failed to review coupon')
        } finally {
            setActionLoading(false)
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'text-yellow-600 bg-yellow-50'
            case 'approved': return 'text-green-600 bg-green-50'
            case 'rejected': return 'text-red-600 bg-red-50'
            default: return 'text-gray-600 bg-gray-50'
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return <Clock size={16} />
            case 'approved': return <CheckCircle size={16} />
            case 'rejected': return <XCircle size={16} />
            default: return null
        }
    }

    const formatDateTime = (dateString) => {
        return format(new Date(dateString), 'MMM dd, yyyy HH:mm')
    }

    useEffect(() => {
        fetchCoupons()
    }, [])

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Store Coupons</h1>
                    <p className="text-gray-600 mt-1">Review and manage coupons submitted by stores</p>
                </div>
                <div className="flex gap-2">
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                        Pending: {coupons.filter(c => c.status === 'pending').length}
                    </span>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                        Approved: {coupons.filter(c => c.status === 'approved').length}
                    </span>
                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                        Rejected: {coupons.filter(c => c.status === 'rejected').length}
                    </span>
                </div>
            </div>

            {/* Review Modal */}
            {selectedCoupon && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">Review Coupon</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Coupon Details */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900">Coupon Details</h3>
                                
                                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Code</label>
                                        <p className="text-lg font-bold text-green-600">{selectedCoupon.code}</p>
                                    </div>
                                    
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Description</label>
                                        <p className="text-gray-900">{selectedCoupon.description}</p>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Discount</label>
                                            <div className="flex items-center gap-1">
                                                {selectedCoupon.discountType === 'percentage' ? (
                                                    <Percent size={16} className="text-green-600" />
                                                ) : (
                                                    <DollarSign size={16} className="text-green-600" />
                                                )}
                                                <span className="font-medium">
                                                    {selectedCoupon.discountType === 'percentage' 
                                                        ? `${selectedCoupon.discountValue}%` 
                                                        : `₹${selectedCoupon.discountValue}`
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Min Order</label>
                                            <p className="font-medium">₹{selectedCoupon.minOrderAmount}</p>
                                        </div>
                                    </div>
                                    
                                    {selectedCoupon.maxDiscountAmount && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Max Discount</label>
                                            <p className="font-medium">₹{selectedCoupon.maxDiscountAmount}</p>
                                        </div>
                                    )}
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Usage Limit</label>
                                            <p className="font-medium">{selectedCoupon.usageLimit || 'Unlimited'}</p>
                                        </div>
                                        
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Expires</label>
                                            <p className="font-medium">{format(new Date(selectedCoupon.expiresAt), 'MMM dd, yyyy')}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-4">
                                        {selectedCoupon.forNewUser && (
                                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                                New Users Only
                                            </span>
                                        )}
                                        {selectedCoupon.forMember && (
                                            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                                                Members Only
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Store Details */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900">Store Information</h3>
                                
                                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Store Name</label>
                                        <p className="font-medium">{selectedCoupon.store.name}</p>
                                    </div>
                                    
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Username</label>
                                        <p className="font-medium">@{selectedCoupon.store.username}</p>
                                    </div>
                                    
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Email</label>
                                        <p className="font-medium">{selectedCoupon.store.email}</p>
                                    </div>
                                    
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Submitted</label>
                                        <p className="font-medium">{formatDateTime(selectedCoupon.createdAt)}</p>
                                    </div>
                                </div>

                                {/* Review Section */}
                                {selectedCoupon.status === 'pending' && (
                                    <div className="space-y-3">
                                        <h4 className="font-semibold text-gray-900">Review Action</h4>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Admin Note (optional)
                                            </label>
                                            <textarea
                                                value={reviewNote}
                                                onChange={(e) => setReviewNote(e.target.value)}
                                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                                                rows="3"
                                                placeholder="Add a note for the store owner..."
                                            />
                                        </div>
                                        
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleReview(selectedCoupon.id, 'approve')}
                                                disabled={actionLoading}
                                                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                                            >
                                                <CheckCircle size={18} className="inline mr-2" />
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleReview(selectedCoupon.id, 'reject')}
                                                disabled={actionLoading}
                                                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                                            >
                                                <XCircle size={18} className="inline mr-2" />
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Review History */}
                                {selectedCoupon.status !== 'pending' && (
                                    <div className="space-y-3">
                                        <h4 className="font-semibold text-gray-900">Review History</h4>
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                {getStatusIcon(selectedCoupon.status)}
                                                <span className="font-medium capitalize">{selectedCoupon.status}</span>
                                                <span className="text-sm text-gray-600">
                                                    by {selectedCoupon.reviewedBy}
                                                </span>
                                            </div>
                                            {selectedCoupon.reviewedAt && (
                                                <p className="text-sm text-gray-600 mb-2">
                                                    {formatDateTime(selectedCoupon.reviewedAt)}
                                                </p>
                                            )}
                                            {selectedCoupon.adminNote && (
                                                <p className="text-sm">{selectedCoupon.adminNote}</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t">
                            <button
                                onClick={() => {
                                    setSelectedCoupon(null)
                                    setReviewNote('')
                                }}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Coupons List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading store coupons...</p>
                    </div>
                ) : coupons.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="text-gray-600">No store coupons found.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Store
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Coupon
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Discount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Submitted
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {coupons.map((coupon) => (
                                    <tr key={coupon.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Store size={16} className="text-gray-400" />
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {coupon.store.name}
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        @{coupon.store.username}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {coupon.code}
                                                </div>
                                                <div className="text-sm text-gray-600 max-w-xs truncate">
                                                    {coupon.description}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1">
                                                {coupon.discountType === 'percentage' ? (
                                                    <Percent size={16} className="text-green-600" />
                                                ) : (
                                                    <DollarSign size={16} className="text-green-600" />
                                                )}
                                                <span className="text-sm font-medium">
                                                    {coupon.discountType === 'percentage' 
                                                        ? `${coupon.discountValue}%` 
                                                        : `₹${coupon.discountValue}`
                                                    }
                                                </span>
                                            </div>
                                            {coupon.minOrderAmount > 0 && (
                                                <div className="text-xs text-gray-500">
                                                    Min: ₹{coupon.minOrderAmount}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(coupon.status)}`}>
                                                {getStatusIcon(coupon.status)}
                                                {coupon.status.charAt(0).toUpperCase() + coupon.status.slice(1)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {format(new Date(coupon.createdAt), 'MMM dd, yyyy')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => setSelectedCoupon(coupon)}
                                                className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                                title="Review"
                                            >
                                                <Eye size={16} />
                                                Review
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
