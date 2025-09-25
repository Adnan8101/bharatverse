'use client'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import Image from 'next/image'
import Loading from '@/components/Loading'
import { Clock, CheckCircle, XCircle, AlertCircle, RefreshCw, Eye, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'

export default function ProductStatusPage() {
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [filter, setFilter] = useState('all') // 'all', 'pending', 'approved', 'rejected'
  const [submitting, setSubmitting] = useState(null)

  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹'

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/store-owner/products', {
        credentials: 'include'
      })
      
      const result = await response.json()
      
      if (result.success) {
        setProducts(result.products)
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
  }, [])

  const resubmitProduct = async (productId) => {
    if (!confirm('Are you sure you want to resubmit this product for admin approval?')) {
      return
    }

    try {
      setSubmitting(productId)
      
      const response = await fetch('/api/store-owner/products/resubmit', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ productId })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setProducts(products.map(p => 
          p.id === productId 
            ? { ...p, status: 'pending', adminNote: null, reviewedBy: null, reviewedAt: null }
            : p
        ))
        toast.success('Product resubmitted for approval')
      } else {
        toast.error(result.message || 'Failed to resubmit product')
      }
    } catch (error) {
      console.error('Error resubmitting product:', error)
      toast.error('Failed to resubmit product')
    } finally {
      setSubmitting(null)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status) => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
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

  const getStatusMessage = (status) => {
    switch (status) {
      case 'pending':
        return 'Your product is being reviewed by our admin team. You will be notified once reviewed.'
      case 'approved':
        return 'Your product is approved and live in the marketplace!'
      case 'rejected':
        return 'Your product was rejected. Please review the feedback and resubmit after making improvements.'
      default:
        return 'Unknown status'
    }
  }

  const filteredProducts = products.filter(product => {
    if (filter === 'all') return true
    return product.status === filter
  })

  const statusCounts = {
    all: products.length,
    pending: products.filter(p => p.status === 'pending').length,
    approved: products.filter(p => p.status === 'approved').length,
    rejected: products.filter(p => p.status === 'rejected').length,
  }

  if (loading) {
    return <Loading />
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Status</h1>
            <p className="text-gray-600">Track the approval status of all your products</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchProducts}
              disabled={loading}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <Link
              href="/store/add-product"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Add New Product
            </Link>
          </div>
        </div>

        {/* Status Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div 
            className={`bg-white p-6 rounded-lg shadow-md cursor-pointer transition-all ${
              filter === 'all' ? 'ring-2 ring-blue-500' : 'hover:shadow-lg'
            }`}
            onClick={() => setFilter('all')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{statusCounts.all}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          
          <div 
            className={`bg-white p-6 rounded-lg shadow-md cursor-pointer transition-all ${
              filter === 'pending' ? 'ring-2 ring-yellow-500' : 'hover:shadow-lg'
            }`}
            onClick={() => setFilter('pending')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </div>

          <div 
            className={`bg-white p-6 rounded-lg shadow-md cursor-pointer transition-all ${
              filter === 'approved' ? 'ring-2 ring-green-500' : 'hover:shadow-lg'
            }`}
            onClick={() => setFilter('approved')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{statusCounts.approved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div 
            className={`bg-white p-6 rounded-lg shadow-md cursor-pointer transition-all ${
              filter === 'rejected' ? 'ring-2 ring-red-500' : 'hover:shadow-lg'
            }`}
            onClick={() => setFilter('rejected')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{statusCounts.rejected}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
          </div>
        </div>

        {/* Product List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filter === 'all' ? 'No products found' : `No ${filter} products`}
              </h3>
              <p className="text-gray-600 mb-6">
                {filter === 'all' 
                  ? 'Start by adding your first product to the marketplace'
                  : `You don't have any ${filter} products at the moment`
                }
              </p>
              {filter === 'all' && (
                <Link
                  href="/store/add-product"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Your First Product
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <div key={product.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <Image
                        src={product.images[0] || '/placeholder-product.png'}
                        alt={product.name}
                        width={80}
                        height={80}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {product.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {product.description}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                            <span>Category: {product.category}</span>
                            <span>Price: {currency}{product.price}</span>
                            <span>Stock: {product.stockQuantity}</span>
                            <span>Created: {new Date(product.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex-shrink-0 ml-4">
                          <div className={getStatusBadge(product.status)}>
                            {getStatusIcon(product.status)}
                            <span className="capitalize">{product.status}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status Message */}
                      <div className="mb-4">
                        <p className="text-sm text-gray-600">
                          {getStatusMessage(product.status)}
                        </p>
                        {product.status === 'approved' && (
                          <div className="mt-2 text-xs text-green-600 font-medium">
                            ✅ Your product is now live and can be purchased by customers!
                          </div>
                        )}
                      </div>

                      {/* Admin Feedback */}
                      {product.adminNote && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                          <h4 className="text-sm font-medium text-red-800 mb-2">Admin Feedback:</h4>
                          <p className="text-sm text-red-700">{product.adminNote}</p>
                          {product.reviewedAt && (
                            <p className="text-xs text-red-600 mt-2">
                              Reviewed on {new Date(product.reviewedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-3">
                        <Link
                          href={`/store/manage-product`}
                          className="inline-flex items-center px-3 py-2 text-sm border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Product
                        </Link>

                        {product.status === 'approved' && (
                          <Link
                            href={`/product/${product.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-2 text-sm border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Live
                          </Link>
                        )}

                        {product.status === 'rejected' && (
                          <button
                            onClick={() => resubmitProduct(product.id)}
                            disabled={submitting === product.id}
                            className="inline-flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                          >
                            {submitting === product.id ? (
                              <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                Resubmitting...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Resubmit for Review
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Product Approval Process</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Pending Review</h4>
                <p className="text-blue-700">Your product is in the admin review queue. This usually takes 24-48 hours.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Approved</h4>
                <p className="text-blue-700">Your product is live in the marketplace and customers can purchase it.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Rejected</h4>
                <p className="text-blue-700">Review the admin feedback, make improvements, and resubmit for review.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
