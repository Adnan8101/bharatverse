'use client'
import { useState, useEffect } from 'react'
import ProductCard from '@/components/ProductCard'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { GiPaintBrush, GiIndianPalace, GiFlowerPot } from 'react-icons/gi'
import { Palette, History, Award, Users, ChevronRight, Sparkles, Crown } from 'lucide-react'

const TraditionalArtPage = () => {
    const [products, setProducts] = useState([])
    const [filteredProducts, setFilteredProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedCategory, setSelectedCategory] = useState('all')

    const categories = [
        { id: 'all', name: 'All Traditional Art', icon: <Palette size={20} />, color: 'from-orange-500 to-red-500' },
        { id: 'painting', name: 'Traditional Paintings', icon: <GiPaintBrush size={20} />, color: 'from-red-500 to-pink-500' },
        { id: 'sculpture', name: 'Ancient Sculptures', icon: <GiIndianPalace size={20} />, color: 'from-amber-500 to-orange-500' },
        { id: 'pottery', name: 'Traditional Pottery', icon: <GiFlowerPot size={20} />, color: 'from-yellow-500 to-orange-500' }
    ]

    const fetchTraditionalArtProducts = async (category = '') => {
        try {
            setLoading(true)
            const response = await fetch(`/api/traditional-art${category ? `?category=${category}` : ''}`)
            if (response.ok) {
                const data = await response.json()
                setProducts(data.products || [])
                setFilteredProducts(data.products || [])
            } else {
                console.error('Failed to fetch traditional art products')
                setProducts([])
                setFilteredProducts([])
            }
        } catch (error) {
            console.error('Error fetching traditional art products:', error)
            setProducts([])
            setFilteredProducts([])
        } finally {
            setLoading(false)
        }
    }

    const handleCategoryFilter = (categoryId) => {
        setSelectedCategory(categoryId)
        if (categoryId === 'all') {
            setFilteredProducts(products)
        } else {
            const filtered = products.filter(product => 
                product.category?.toLowerCase() === categoryId.toLowerCase()
            )
            setFilteredProducts(filtered)
        }
    }

    useEffect(() => {
        fetchTraditionalArtProducts()
    }, [])

    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-orange-50 via-red-50 to-orange-50 py-16 sm:py-24 overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-16 right-20 w-40 h-40 bg-gradient-to-r from-orange-400 to-red-400 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-16 left-16 w-56 h-56 bg-gradient-to-r from-red-400 to-orange-400 rounded-full blur-3xl animate-pulse delay-1000"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-orange-200 to-red-200 rounded-full blur-3xl opacity-40"></div>
                </div>
                
                <div className="relative max-w-7xl mx-auto px-6 text-center">
                    <div className="flex justify-center mb-8">
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 rounded-3xl shadow-2xl transform hover:scale-110 hover:rotate-3 transition-all duration-500">
                            <GiPaintBrush className="text-white" size={60} />
                        </div>
                    </div>
                    
                    <div className="inline-flex items-center gap-3 bg-white/90 backdrop-blur-sm text-orange-700 pr-4 p-2 rounded-full text-xs sm:text-sm font-medium shadow-lg border border-orange-200 mb-8">
                        <span className='bg-gradient-to-r from-orange-600 to-red-600 px-4 py-2 rounded-full text-white text-xs font-semibold'>HERITAGE</span> 
                        5000+ Years of Artistic Legacy
                        <ChevronRight className='transition-transform duration-300' size={16} />
                    </div>
                    
                    <h1 className="text-4xl sm:text-7xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-orange-600 bg-clip-text text-transparent mb-8 leading-tight">
                        Traditional Art
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-700 max-w-4xl mx-auto mb-12 leading-relaxed">
                        Experience timeless masterpieces that preserve India's rich artistic heritage. From ancient painting techniques 
                        to classical sculptures, each piece tells a story of our cultural legacy passed down through generations.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-orange-100 group">
                            <History className="text-orange-600 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" size={40} />
                            <h3 className="font-bold text-gray-900 mb-3 text-lg">5000+ Years of Heritage</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">Preserving ancient techniques passed down through generations of master artists</p>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-red-100 group">
                            <Award className="text-red-600 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" size={40} />
                            <h3 className="font-bold text-gray-900 mb-3 text-lg">Authentic Masterpieces</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">Handpicked collection from renowned traditional artists and cultural centers</p>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-orange-100 group">
                            <Users className="text-orange-600 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" size={40} />
                            <h3 className="font-bold text-gray-900 mb-3 text-lg">Supporting Artisans</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">Directly supporting traditional craftsmen and their families across India</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* About Traditional Art */}
            <div className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">The Legacy of Traditional Indian Art</h2>
                        <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
                            Traditional Indian art forms have flourished for millennia, each region contributing its unique style and technique. 
                            From the intricate miniature paintings of Rajasthan to the sacred sculptures of South India, these art forms 
                            represent the spiritual and cultural essence of our civilization.
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                        <div className="space-y-8">
                            <div className="bg-white rounded-3xl p-8 shadow-lg border border-orange-100">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="bg-orange-100 p-3 rounded-xl">
                                        <GiPaintBrush className="text-orange-600" size={32} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900">Classical Paintings</h3>
                                </div>
                                <p className="text-gray-600 leading-relaxed">Miniature paintings, Madhubani, Warli, and other traditional painting styles that capture stories, myths, and daily life with intricate detail and vibrant colors.</p>
                            </div>
                            
                            <div className="bg-white rounded-3xl p-8 shadow-lg border border-red-100">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="bg-red-100 p-3 rounded-xl">
                                        <GiIndianPalace className="text-red-600" size={32} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900">Sacred Sculptures</h3>
                                </div>
                                <p className="text-gray-600 leading-relaxed">Bronze, stone, and wooden sculptures depicting deities, mythological figures, and architectural elements from ancient temples and palaces.</p>
                            </div>
                        </div>
                        
                        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl p-8 shadow-xl">
                            <div className="flex items-center gap-4 mb-6">
                                <Crown className="text-orange-600" size={32} />
                                <h3 className="text-2xl font-bold text-gray-900">Royal Heritage</h3>
                            </div>
                            
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <Sparkles className="text-orange-600 mt-1" size={20} />
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-1">Rajasthani Miniatures</h4>
                                        <p className="text-sm text-gray-600">Intricate court paintings with gold leaf work</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start gap-4">
                                    <Sparkles className="text-red-600 mt-1" size={20} />
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-1">Tanjore Art</h4>
                                        <p className="text-sm text-gray-600">Sacred paintings with precious stones and gold</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start gap-4">
                                    <Sparkles className="text-orange-600 mt-1" size={20} />
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-1">Chola Bronzes</h4>
                                        <p className="text-sm text-gray-600">Masterful bronze sculptures from ancient temples</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start gap-4">
                                    <Sparkles className="text-red-600 mt-1" size={20} />
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-1">Blue Pottery</h4>
                                        <p className="text-sm text-gray-600">Persian-influenced ceramic art from Jaipur</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Filter */}
            <div className="py-12 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-wrap justify-center gap-4 mb-12">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => handleCategoryFilter(category.id)}
                                className={`flex items-center gap-3 px-8 py-4 rounded-2xl border-2 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 ${
                                    selectedCategory === category.id
                                        ? `bg-gradient-to-r ${category.color} text-white border-transparent shadow-2xl scale-105`
                                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <div className={selectedCategory === category.id ? 'text-white' : 'text-gray-500'}>
                                    {category.icon}
                                </div>
                                <span>{category.name}</span>
                                {selectedCategory === category.id && (
                                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Products Grid */}
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="relative">
                                <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-orange-600"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <GiPaintBrush className="text-orange-600" size={24} />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map((product) => (
                                    <div key={product.id} className="transform hover:scale-105 transition-transform duration-300">
                                        <ProductCard product={product} />
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-20">
                                    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl p-12 max-w-md mx-auto">
                                        <GiPaintBrush className="mx-auto text-orange-400 mb-6" size={80} />
                                        <h3 className="text-2xl font-bold text-gray-600 mb-4">No traditional art found</h3>
                                        <p className="text-gray-500">Try selecting a different category or check back later for new additions to our heritage collection.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    )
}

export default TraditionalArtPage
