'use client'
import { useState, useEffect } from 'react'
import { TrendingUp, RefreshCw, Check, X, Package } from 'lucide-react'
import PageTitle from '@/components/PageTitle'
import Image from 'next/image'

const SmartPricingPage = () => {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [analyzing, setAnalyzing] = useState(false)
    const [recommendations, setRecommendations] = useState([])
    const [applying, setApplying] = useState({})
    const [imageErrors, setImageErrors] = useState({})

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/store-owner/products')
            const data = await response.json()
            if (data.success) {
                setProducts(data.products)
                // Don't automatically analyze pricing - let user trigger it manually
            }
        } catch (error) {
            console.error('Error fetching products:', error)
        } finally {
            setLoading(false)
        }
    }

    const analyzePricing = async (productList = products) => {
        setAnalyzing(true)
        try {
            const response = await fetch('/api/ai/price-optimization', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ products: productList })
            })
            const data = await response.json()
            if (data.success) {
                setRecommendations(data.recommendations)
            }
        } catch (error) {
            console.error('Error analyzing pricing:', error)
        } finally {
            setAnalyzing(false)
        }
    }

    const applyPriceChange = async (productId, newPrice) => {
        setApplying(prev => ({ ...prev, [productId]: true }))
        try {
            const response = await fetch('/api/store-owner/update-price', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, price: newPrice })
            })
            const data = await response.json()
            if (data.success) {
                // Update local state
                setProducts(prev => 
                    prev.map(p => p.id === productId ? { ...p, price: newPrice } : p)
                )
                setRecommendations(prev => 
                    prev.filter(r => r.productId !== productId)
                )
            }
        } catch (error) {
            console.error('Error updating price:', error)
        } finally {
            setApplying(prev => ({ ...prev, [productId]: false }))
        }
    }

    const getPriceChangePercentage = (currentPrice, suggestedPrice) => {
        const change = ((suggestedPrice - currentPrice) / currentPrice) * 100
        return change.toFixed(1)
    }

    const getPriceChangeColor = (percentage) => {
        return parseFloat(percentage) > 0 ? 'text-green-600' : 'text-red-600'
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <PageTitle title="Smart Price Optimization" icon={TrendingUp} />
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex justify-center items-center h-64">
                        <div className="flex flex-col items-center gap-4">
                            <RefreshCw className="animate-spin text-blue-600" size={32} />
                            <p className="text-gray-600">Loading your products...</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <PageTitle title="Smart Price Optimization" icon={TrendingUp} />
            
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">AI-Powered Pricing Recommendations</h2>
                        <p className="text-gray-600 mt-1">Get real-time pricing suggestions based on market trends and competitor analysis</p>
                    </div>
                    <button
                        onClick={() => analyzePricing()}
                        disabled={analyzing}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        <RefreshCw size={16} className={analyzing ? 'animate-spin' : ''} />
                        {analyzing ? 'Analyzing...' : 'Refresh Analysis'}
                    </button>
                </div>

                {analyzing ? (
                    <div className="text-center py-12">
                        <div className="relative">
                            <RefreshCw className="animate-spin mx-auto text-blue-600 mb-4" size={48} />
                            <div className="absolute inset-0 animate-pulse bg-blue-100 rounded-full opacity-20"></div>
                        </div>
                        <h3 className="text-lg font-medium text-gray-600 mb-2">Analyzing Market Trends...</h3>
                        <p className="text-gray-500 mb-2">Please wait while we analyze competitor pricing and market trends.</p>
                        <div className="flex items-center justify-center gap-2 mt-4">
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                    </div>
                ) : recommendations.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="relative">
                            <TrendingUp size={48} className="mx-auto text-gray-400 mb-4" />
                            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-blue-600 to-green-500 rounded-full"></div>
                        </div>
                        <h3 className="text-lg font-medium text-gray-600 mb-2">Ready for Smart Price Analysis</h3>
                        <p className="text-gray-500 mb-6">Get AI-powered pricing recommendations based on market trends and competitor analysis.</p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={() => analyzePricing()}
                                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center gap-2 justify-center transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                <TrendingUp size={18} />
                                Start Price Analysis
                            </button>
                            <button
                                onClick={() => window.location.href = '/store/add-product'}
                                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 flex items-center gap-2 justify-center transition-colors"
                            >
                                <Package size={18} />
                                Add Products First
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {recommendations.map((rec) => {
                            const product = products.find(p => p.id === rec.productId)
                            const changePercentage = getPriceChangePercentage(product?.price || 0, rec.suggestedPrice)
                            
                            return (
                                <div key={rec.productId} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-800">{product?.name}</h3>
                                            <div className="flex items-center gap-4 mt-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-gray-500">Current:</span>
                                                    <span className="font-medium">₹{product?.price}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-gray-500">Suggested:</span>
                                                    <span className="font-medium">₹{rec.suggestedPrice}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-gray-500">Change:</span>
                                                    <span className={`font-medium ${getPriceChangeColor(changePercentage)}`}>
                                                        {parseFloat(changePercentage) > 0 ? '+' : ''}{changePercentage}%
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-2">{rec.reason}</p>
                                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                                <span>Confidence: {rec.confidence}%</span>
                                                <span>Market Trend: {rec.marketTrend}</span>
                                                <span>Competition: {rec.competitionLevel}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 ml-4">
                                            <button
                                                onClick={() => applyPriceChange(rec.productId, rec.suggestedPrice)}
                                                disabled={applying[rec.productId]}
                                                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
                                            >
                                                <Check size={14} />
                                                {applying[rec.productId] ? 'Applying...' : 'Apply'}
                                            </button>
                                            <button
                                                onClick={() => setRecommendations(prev => prev.filter(r => r.productId !== rec.productId))}
                                                className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 flex items-center gap-1"
                                            >
                                                <X size={14} />
                                                Dismiss
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Products ({products.length})</h3>
                {products.length === 0 ? (
                    <div className="text-center py-12">
                        <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-600 mb-2">No Products Found</h3>
                        <p className="text-gray-500 mb-4">You need to add products to your store before using price optimization.</p>
                        <button
                            onClick={() => window.location.href = '/store/add-product'}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                        >
                            Add Your First Product
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <div key={product.id} className="group border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-200 bg-white hover:border-blue-200">
                                <div className="relative w-full h-48 bg-gray-50 rounded-lg mb-4 overflow-hidden">
                                    {product.image && product.image.length > 0 && !imageErrors[product.id] ? (
                                        <Image 
                                            src={product.image} 
                                            alt={product.name}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-200"
                                            onError={() => {
                                                setImageErrors(prev => ({ ...prev, [product.id]: true }))
                                            }}
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                            <Package size={32} className="mb-2" />
                                            <span className="text-sm">No Image Available</span>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    <h4 className="font-semibold text-gray-800 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
                                        {product.name}
                                    </h4>
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-500 uppercase tracking-wide">Price</span>
                                            <span className="font-bold text-green-600 text-lg">₹{product.price}</span>
                                        </div>
                                        <div className="flex flex-col text-right">
                                            <span className="text-xs text-gray-500 uppercase tracking-wide">Stock</span>
                                            <span className={`text-sm font-medium ${product.stockQuantity > 10 ? 'text-green-600' : product.stockQuantity > 0 ? 'text-orange-600' : 'text-red-600'}`}>
                                                {product.stockQuantity}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="pt-2 border-t border-gray-100">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                                {product.category}
                                            </span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.stockQuantity > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {product.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
                                            </span>
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

export default SmartPricingPage
