'use client'
import { useState, useEffect } from 'react'
import { DataService } from '@/lib/data-service'

export default function DatabaseTestPage() {
  const [stats, setStats] = useState({})
  const [products, setProducts] = useState([])
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, storesData, couponsData, ratingsData] = await Promise.all([
          DataService.fetchProducts(),
          DataService.fetchStores(),
          DataService.fetchCoupons(),
          DataService.fetchRatings()
        ])

        setProducts(productsData)
        setStores(storesData)
        setStats({
          products: productsData.length,
          stores: storesData.length,
          coupons: couponsData.length,
          ratings: ratingsData.length
        })
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Database Test - Loading...</h1>
          <div className="animate-pulse">
            <div className="bg-gray-200 h-32 rounded mb-4"></div>
            <div className="bg-gray-200 h-64 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Database Test Dashboard</h1>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700">Products</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.products}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700">Stores</h3>
            <p className="text-3xl font-bold text-green-600">{stats.stores}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700">Coupons</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.coupons}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700">Ratings</h3>
            <p className="text-3xl font-bold text-orange-600">{stats.ratings}</p>
          </div>
        </div>

        {/* Products Preview */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Recent Products</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.slice(0, 6).map((product) => (
                <div key={product.id} className="border rounded-lg p-4">
                  <img 
                    src={product.images[0]} 
                    alt={product.name}
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                  <h3 className="font-semibold truncate">{product.name}</h3>
                  <p className="text-gray-600 text-sm truncate">{product.description}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-lg font-bold text-green-600">
                      ₹{product.price.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500 line-through">
                      ₹{product.mrp.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Category: {product.category}
                  </div>
                  {product.rating && product.rating.length > 0 && (
                    <div className="text-sm text-yellow-600 mt-1">
                      ⭐ {DataService.calculateAverageRating(product.rating)} ({product.rating.length} reviews)
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stores Preview */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Stores</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stores.map((store) => (
                <div key={store.id} className="border rounded-lg p-4">
                  <div className="flex items-center gap-4">
                    <img 
                      src={store.logo} 
                      alt={store.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div>
                      <h3 className="font-semibold">{store.name}</h3>
                      <p className="text-gray-600 text-sm">@{store.username}</p>
                      <p className="text-sm text-gray-500">{store.email}</p>
                      <span className={`inline-block px-2 py-1 rounded text-xs ${
                        store.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {store.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{store.description}</p>
                  <div className="text-sm text-gray-500 mt-2">
                    Products: {store.Product ? store.Product.length : 0}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 text-center">
          <a 
            href="/" 
            className="inline-block bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 mr-4"
          >
            Go to Homepage
          </a>
          <a 
            href="/shop" 
            className="inline-block bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
          >
            Visit Shop
          </a>
        </div>
      </div>
    </div>
  )
}
