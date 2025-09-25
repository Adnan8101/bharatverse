'use client'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import Image from 'next/image'
import Loading from '@/components/Loading'
import { Check, X, Eye, Clock, CheckCircle, XCircle, AlertCircle, Filter, Search } from 'lucide-react'

export default function AdminProductApproval() {
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [summary, setSummary] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 })
  const [selectedStatus, setSelectedStatus] = useState('pending')
  const [searchTerm, setSearchTerm] = useState('')
  const [approving, setApproving] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [actionType, setActionType] = useState('')
  const [adminNote, setAdminNote] = useState('')

  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹'

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/products?status=${selectedStatus}`, {
        credentials: 'include'
      })
      
      const result = await response.json()
      
      if (result.success) {
        setProducts(result.products)
        setSummary(result.summary)
      } else {
        toast.error(result.message || 'Failed to fetch products')
        setProducts([])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to fetch products')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [selectedStatus])

  const openModal = (product, action) => {
    setSelectedProduct(product)
    setActionType(action)
    setAdminNote('')
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedProduct(null)
    setActionType('')
    setAdminNote('')
  }

  const handleApproval = async () => {
    if (!selectedProduct || !actionType) return
    
    try {
      setApproving(selectedProduct.id)
      
      const response = await fetch('/api/admin/products/approve', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          productId: selectedProduct.id,
          status: actionType,
          adminNote: adminNote.trim() || null
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success(result.message)
        fetchProducts() // Refresh the list
        closeModal()
      } else {
        toast.error(result.message || `Failed to ${actionType} product`)
      }
    } catch (error) {
      console.error('Error updating product:', error)
      toast.error(`Failed to ${actionType} product`)
    } finally {
      setApproving(null)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium"
    switch (status) {
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <Loading />
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Approval</h1>
          <p className="text-gray-600">Review and approve products submitted by store owners</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{summary.total}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{summary.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{summary.approved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{summary.rejected}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">Pending Approval</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="all">All Products</option>
              </select>
            </div>
            <div className="flex items-center gap-2 flex-1">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by product name, store, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Products List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600">
                {searchTerm ? 'Try adjusting your search criteria' : `No ${selectedStatus} products at the moment`}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Store
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
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
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-16 w-16">
                            <Image
                              src={product.images[0] || '/placeholder-product.png'}
                              alt={product.name}
                              width={64}
                              height={64}
                              className="h-16 w-16 rounded-lg object-cover"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.category}</div>
                            <div className="text-xs text-gray-400">Stock: {product.stockQuantity}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{product.store.name}</div>
                        <div className="text-sm text-gray-500">@{product.store.username}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{currency}{product.price}</div>
                        <div className="text-sm text-gray-500 line-through">{currency}{product.mrp}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(product.status)}
                          <span className={getStatusBadge(product.status)}>
                            {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                          </span>
                        </div>
                        {product.adminNote && (
                          <div className="text-xs text-gray-500 mt-1">
                            Note: {product.adminNote}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(product.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          {product.status === 'pending' && (
                            <>
                              <button
                                onClick={() => openModal(product, 'approved')}
                                disabled={approving === product.id}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                              >
                                <Check className="w-3 h-3 mr-1" />
                                Approve
                              </button>
                              <button
                                onClick={() => openModal(product, 'rejected')}
                                disabled={approving === product.id}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                              >
                                <X className="w-3 h-3 mr-1" />
                                Reject
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => {
                              setSelectedProduct(product)
                              setShowModal(true)
                              setActionType('view')
                            }}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
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

        {/* Modal */}
        {showModal && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {actionType === 'view' ? 'Product Details' : 
                     actionType === 'approved' ? 'Approve Product' : 'Reject Product'}
                  </h3>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Product Images */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Product Images</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {selectedProduct.images.map((image, index) => (
                        <Image
                          key={index}
                          src={image}
                          alt={`${selectedProduct.name} ${index + 1}`}
                          width={150}
                          height={150}
                          className="w-full h-32 object-cover rounded-md"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Product Name</label>
                      <p className="text-sm text-gray-900">{selectedProduct.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Category</label>
                      <p className="text-sm text-gray-900">{selectedProduct.category}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Price</label>
                      <p className="text-sm text-gray-900">{currency}{selectedProduct.price}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">MRP</label>
                      <p className="text-sm text-gray-900">{currency}{selectedProduct.mrp}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
                      <p className="text-sm text-gray-900">{selectedProduct.stockQuantity}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Store</label>
                      <p className="text-sm text-gray-900">{selectedProduct.store.name}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedProduct.description}</p>
                  </div>

                  {/* Store Details */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Store Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Store Name</label>
                        <p className="text-sm text-gray-900">{selectedProduct.store.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Username</label>
                        <p className="text-sm text-gray-900">@{selectedProduct.store.username}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <p className="text-sm text-gray-900">{selectedProduct.store.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Contact</label>
                        <p className="text-sm text-gray-900">{selectedProduct.store.contact}</p>
                      </div>
                    </div>
                  </div>

                  {/* Admin Note (for approval/rejection) */}
                  {(actionType === 'approved' || actionType === 'rejected') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Admin Note {actionType === 'rejected' ? '(Required for rejection)' : '(Optional)'}
                      </label>
                      <textarea
                        value={adminNote}
                        onChange={(e) => setAdminNote(e.target.value)}
                        placeholder={actionType === 'approved' ? 
                          'Optional note for the store owner...' : 
                          'Please provide feedback for improvement...'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                      />
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  {(actionType === 'approved' || actionType === 'rejected') && (
                    <button
                      onClick={handleApproval}
                      disabled={approving === selectedProduct.id || (actionType === 'rejected' && !adminNote.trim())}
                      className={`px-4 py-2 rounded-md text-sm font-medium text-white disabled:opacity-50 ${
                        actionType === 'approved' 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-red-600 hover:bg-red-700'
                      }`}
                    >
                      {approving === selectedProduct.id ? 'Processing...' : 
                       actionType === 'approved' ? 'Approve Product' : 'Reject Product'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
