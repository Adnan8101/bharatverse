'use client'
import { useEffect, useState } from "react"
import { format } from "date-fns"
import toast from "react-hot-toast"
import { Trash, Edit2, Plus, Save, X, Eye, Percent, DollarSign } from "lucide-react"

export default function AdminCoupons() {
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
        isPublic: true,
        isActive: true,
        usageLimit: '',
        expiresAt: ''
    })

    const fetchCoupons = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/admin/coupons')
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
                ? `/api/admin/coupons/${editingCoupon.code}`
                : '/api/admin/coupons'
            
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
            isPublic: coupon.isPublic,
            isActive: coupon.isActive,
            usageLimit: coupon.usageLimit?.toString() || '',
            expiresAt: new Date(coupon.expiresAt).toISOString().split('T')[0]
        })
        setShowForm(true)
    }

    const handleDelete = async (code) => {
        if (!confirm('Are you sure you want to delete this coupon?')) return

        try {
            const response = await fetch(`/api/admin/coupons/${code}`, {
                method: 'DELETE'
            })

            const result = await response.json()

            if (result.success) {
                toast.success('Coupon deleted successfully')
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
            isPublic: true,
            isActive: true,
            usageLimit: '',
            expiresAt: ''
        })
        setEditingCoupon(null)
        setShowForm(false)
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    useEffect(() => {
        fetchCoupons()
    }, [])

    return (
        <div className="text-slate-500 mb-40">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Coupon Management</h1>
                    <p className="text-slate-600 mt-2">Create and manage discount coupons</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2 font-semibold"
                >
                    <Plus size={20} />
                    Add New Coupon
                </button>
            </div>
            {/* Coupon Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-slate-800">
                                    {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
                                </h2>
                                <button
                                    onClick={resetForm}
                                    className="text-slate-400 hover:text-slate-600"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Coupon Code */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Coupon Code *
                                    </label>
                                    <input
                                        type="text"
                                        name="code"
                                        value={formData.code}
                                        onChange={handleChange}
                                        disabled={editingCoupon}
                                        placeholder="e.g., SAVE20, WELCOME10"
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                        required
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Description *
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Brief description of the coupon"
                                        rows={3}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                {/* Discount Type & Value */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Discount Type *
                                        </label>
                                        <select
                                            name="discountType"
                                            value={formData.discountType}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="percentage">Percentage (%)</option>
                                            <option value="fixed">Fixed Amount (₹)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Discount Value *
                                        </label>
                                        <input
                                            type="number"
                                            name="discountValue"
                                            value={formData.discountValue}
                                            onChange={handleChange}
                                            placeholder={formData.discountType === 'percentage' ? '10' : '100'}
                                            min="0"
                                            max={formData.discountType === 'percentage' ? '100' : ''}
                                            step="0.01"
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Additional Settings */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Max Discount Amount (₹)
                                        </label>
                                        <input
                                            type="number"
                                            name="maxDiscountAmount"
                                            value={formData.maxDiscountAmount}
                                            onChange={handleChange}
                                            placeholder="Optional - for percentage discounts"
                                            min="0"
                                            step="0.01"
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Min Order Amount (₹)
                                        </label>
                                        <input
                                            type="number"
                                            name="minOrderAmount"
                                            value={formData.minOrderAmount}
                                            onChange={handleChange}
                                            placeholder="0"
                                            min="0"
                                            step="0.01"
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Usage Limit
                                        </label>
                                        <input
                                            type="number"
                                            name="usageLimit"
                                            value={formData.usageLimit}
                                            onChange={handleChange}
                                            placeholder="Unlimited"
                                            min="1"
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Expires At *
                                        </label>
                                        <input
                                            type="date"
                                            name="expiresAt"
                                            value={formData.expiresAt}
                                            onChange={handleChange}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Checkboxes */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            name="forNewUser"
                                            checked={formData.forNewUser}
                                            onChange={handleChange}
                                            className="w-4 h-4 text-blue-600 rounded"
                                        />
                                        <label className="text-sm font-medium text-slate-700">
                                            For New Users Only
                                        </label>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            name="forMember"
                                            checked={formData.forMember}
                                            onChange={handleChange}
                                            className="w-4 h-4 text-blue-600 rounded"
                                        />
                                        <label className="text-sm font-medium text-slate-700">
                                            For Members Only
                                        </label>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            name="isPublic"
                                            checked={formData.isPublic}
                                            onChange={handleChange}
                                            className="w-4 h-4 text-blue-600 rounded"
                                        />
                                        <label className="text-sm font-medium text-slate-700">
                                            Public Coupon
                                        </label>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            name="isActive"
                                            checked={formData.isActive}
                                            onChange={handleChange}
                                            className="w-4 h-4 text-blue-600 rounded"
                                        />
                                        <label className="text-sm font-medium text-slate-700">
                                            Active
                                        </label>
                                    </div>
                                </div>

                                {/* Form Actions */}
                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-semibold"
                                    >
                                        <Save size={20} />
                                        {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Coupons List */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200">
                    <h2 className="text-xl font-semibold text-slate-800">All Coupons ({coupons.length})</h2>
                </div>

                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-slate-600">Loading coupons...</p>
                    </div>
                ) : coupons.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        <p className="text-lg">No coupons found</p>
                        <p className="text-sm mt-1">Create your first coupon to get started</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Code</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Discount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Min Order</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Usage</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Expires</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {coupons.map((coupon) => (
                                    <tr key={coupon.code} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-slate-900">{coupon.code}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-slate-900 max-w-xs truncate">{coupon.description}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1">
                                                {coupon.discountType === 'percentage' ? (
                                                    <>
                                                        <Percent size={14} className="text-green-600" />
                                                        <span className="text-green-600 font-medium">{coupon.discountValue}%</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <DollarSign size={14} className="text-green-600" />
                                                        <span className="text-green-600 font-medium">₹{coupon.discountValue}</span>
                                                    </>
                                                )}
                                                {coupon.maxDiscountAmount && (
                                                    <span className="text-xs text-slate-500 ml-1">
                                                        (max ₹{coupon.maxDiscountAmount})
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                            ₹{coupon.minOrderAmount || 0}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                            {coupon.usageLimit ? `${coupon.usedCount || 0}/${coupon.usageLimit}` : 'Unlimited'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                            {format(new Date(coupon.expiresAt), 'MMM dd, yyyy')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex gap-2">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    coupon.isActive 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {coupon.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                                {new Date(coupon.expiresAt) < new Date() && (
                                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                                        Expired
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(coupon)}
                                                    className="text-blue-600 hover:text-blue-800 p-1"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(coupon.code)}
                                                    className="text-red-600 hover:text-red-800 p-1"
                                                    title="Delete"
                                                >
                                                    <Trash size={16} />
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