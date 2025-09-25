'use client'
import { useEffect, useState } from "react"
import { format } from "date-fns"
import toast from "react-hot-toast"
import { Plus, Edit2, Trash2, Eye, Clock, CheckCircle, XCircle, Percent, DollarSign } from "lucide-react"

export default function StoreCoupons() {
    const [coupons, setCoupons] = useState([])
    const [loading, setLoading] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [editingCoupon, setEditingCoupon] = useState(null)

    const [formData, setFormData] = useState({
        code: '',
        description: '',
        discountType: 'percentage',
        discountValue: '',
        maxDiscountAmount: '',
        minOrderAmount: '',
        forNewUser: false,
        forMember: false,
        usageLimit: '',
        expiresAt: ''
    })

    const fetchCoupons = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/store/coupons')
            const result = await response.json()
            
            if (result.success) {
                setCoupons(result.data)
            } else {
                toast.error('Failed to fetch coupons')
            }
        } catch (error) {
            console.error('Error fetching coupons:', error)
            toast.error('Failed to fetch coupons')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (!formData.code || !formData.description || !formData.discountValue || !formData.expiresAt) {
            toast.error('Please fill in all required fields')
            return
        }

        try {
            const url = editingCoupon 
                ? `/api/store/coupons/${editingCoupon.id}`
                : '/api/store/coupons'
            
            const method = editingCoupon ? 'PUT' : 'POST'
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })

            const result = await response.json()

            if (result.success) {
                toast.success(result.message)
                resetForm()
                fetchCoupons()
            } else {
                toast.error(result.error)
            }
        } catch (error) {
            console.error('Error saving coupon:', error)
            toast.error('Failed to save coupon')
        }
    }

    const handleEdit = (coupon) => {
        // Only allow editing pending or rejected coupons
        if (coupon.status === 'approved') {
            toast.error('Cannot edit approved coupon')
            return
        }

        setEditingCoupon(coupon)
        setFormData({
            code: coupon.code,
            description: coupon.description,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue.toString(),
            maxDiscountAmount: coupon.maxDiscountAmount?.toString() || '',
            minOrderAmount: coupon.minOrderAmount?.toString() || '',
            forNewUser: coupon.forNewUser,
            forMember: coupon.forMember,
            usageLimit: coupon.usageLimit?.toString() || '',
            expiresAt: new Date(coupon.expiresAt).toISOString().split('T')[0]
        })
        setShowForm(true)
    }

    const handleDelete = async (couponId) => {
        if (!confirm('Are you sure you want to delete this coupon?')) {
            return
        }

        try {
            const response = await fetch(`/api/store/coupons/${couponId}`, {
                method: 'DELETE'
            })

            const result = await response.json()

            if (result.success) {
                toast.success(result.message)
                fetchCoupons()
            } else {
                toast.error(result.error)
            }
        } catch (error) {
            console.error('Error deleting coupon:', error)
            toast.error('Failed to delete coupon')
        }
    }

    const resetForm = () => {
        setFormData({
            code: '',
            description: '',
            discountType: 'percentage',
            discountValue: '',
            maxDiscountAmount: '',
            minOrderAmount: '',
            forNewUser: false,
            forMember: false,
            usageLimit: '',
            expiresAt: ''
        })
        setEditingCoupon(null)
        setShowForm(false)
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

    useEffect(() => {
        fetchCoupons()
    }, [])

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Store Coupons</h1>
                    <p className="text-gray-600 mt-1">Create and manage coupons for your store products</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                >
                    <Plus size={18} />
                    Add Coupon
                </button>
            </div>

            {/* Coupon Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">
                            {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
                        </h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Coupon Code *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.code}
                                        onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                                        placeholder="e.g., STORE10"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Expires At *
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.expiresAt}
                                        onChange={(e) => setFormData({...formData, expiresAt: e.target.value})}
                                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                                        min={new Date().toISOString().split('T')[0]}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description *
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                                    rows="3"
                                    placeholder="Describe your coupon offer"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Discount Type *
                                    </label>
                                    <select
                                        value={formData.discountType}
                                        onChange={(e) => setFormData({...formData, discountType: e.target.value})}
                                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="percentage">Percentage</option>
                                        <option value="fixed">Fixed Amount</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Discount Value *
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.discountValue}
                                        onChange={(e) => setFormData({...formData, discountValue: e.target.value})}
                                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                                        placeholder={formData.discountType === 'percentage' ? '10' : '100'}
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>

                                {formData.discountType === 'percentage' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Max Discount (₹)
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.maxDiscountAmount}
                                            onChange={(e) => setFormData({...formData, maxDiscountAmount: e.target.value})}
                                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                                            placeholder="500"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Min Order Amount (₹)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.minOrderAmount}
                                        onChange={(e) => setFormData({...formData, minOrderAmount: e.target.value})}
                                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                                        placeholder="0"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Usage Limit
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.usageLimit}
                                        onChange={(e) => setFormData({...formData, usageLimit: e.target.value})}
                                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                                        placeholder="Unlimited"
                                        min="1"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.forNewUser}
                                        onChange={(e) => setFormData({...formData, forNewUser: e.target.checked})}
                                        className="mr-2"
                                    />
                                    For New Users Only
                                </label>

                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.forMember}
                                        onChange={(e) => setFormData({...formData, forMember: e.target.checked})}
                                        className="mr-2"
                                    />
                                    For Members Only
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
                                >
                                    {editingCoupon ? 'Update Coupon' : 'Submit for Approval'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Coupons List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading coupons...</p>
                    </div>
                ) : coupons.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="text-gray-600">No coupons found. Create your first coupon!</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
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
                                        Usage
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Expires
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
                                            {coupon.adminNote && coupon.status === 'rejected' && (
                                                <div className="text-xs text-red-600 mt-1">
                                                    {coupon.adminNote}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {coupon.usedCount} / {coupon.usageLimit || '∞'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {format(new Date(coupon.expiresAt), 'MMM dd, yyyy')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {coupon.status !== 'approved' && (
                                                    <button
                                                        onClick={() => handleEdit(coupon)}
                                                        className="text-blue-600 hover:text-blue-800"
                                                        title="Edit"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(coupon.id)}
                                                    className="text-red-600 hover:text-red-800"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
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
