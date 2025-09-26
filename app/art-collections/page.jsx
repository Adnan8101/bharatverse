'use client'
import { useState, useEffect } from 'react'
import ProductCard from '@/components/ProductCard'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { GiPaintBrush, GiIndianPalace, GiFlowerPot } from 'react-icons/gi'
import { Palette, Award, Users, ChevronRight, Heart, Eye } from 'lucide-react'

const ArtCollectionsPage = () => {
    const [products, setProducts] = useState([])
    const [filteredProducts, setFilteredProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedCategory, setSelectedCategory] = useState('all')

    const categories = [
        { id: 'all', name: 'All Collections', icon: <Palette size={20} />, color: 'from-green-500 to-orange-500' },
        { id: 'painting', name: 'Paintings', icon: <GiPaintBrush size={20} />, color: 'from-orange-500 to-red-500' },
        { id: 'sculpture', name: 'Sculptures', icon: <GiIndianPalace size={20} />, color: 'from-purple-500 to-pink-500' },
        { id: 'pottery', name: 'Pottery', icon: <GiFlowerPot size={20} />, color: 'from-amber-500 to-orange-500' }
    ]

    const fetchArtProducts = async (category = '') => {
        try {
            setLoading(true)
            const response = await fetch(`/api/art-collections${category ? `?category=${category}` : ''}`)
            if (response.ok) {
                const data = await response.json()
                setProducts(data.products || [])
                setFilteredProducts(data.products || [])
            } else {
                console.error('Failed to fetch art products')
                setProducts([])
                setFilteredProducts([])
            }
        } catch (error) {
            console.error('Error fetching art products:', error)
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
        fetchArtProducts()
    }, [])

    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-green-50 via-orange-50 to-green-50 py-16 sm:py-24 overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-green-400 to-orange-400 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-20 right-10 w-48 h-48 bg-gradient-to-r from-orange-400 to-green-400 rounded-full blur-3xl animate-pulse delay-1000"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-green-200 to-orange-200 rounded-full blur-3xl opacity-30"></div>
                </div>
                
                <div className="relative max-w-7xl mx-auto px-6 text-center">
                    <div className="flex justify-center mb-8">
                        <div className="bg-gradient-to-r from-green-500 to-orange-500 p-5 rounded-2xl shadow-2xl transform hover:scale-110 transition-transform duration-300">
                            <GiPaintBrush className="text-white" size={56} />
                        </div>
                    </div>
                    
                    <div className="inline-flex items-center gap-3 bg-white/90 backdrop-blur-sm text-green-700 pr-4 p-2 rounded-full text-xs sm:text-sm font-medium shadow-lg border border-green-200 mb-8">
                        <span className='bg-gradient-to-r from-green-600 to-green-700 px-4 py-2 rounded-full text-white text-xs font-semibold'>CURATED</span> 
                        Handpicked Masterpieces from Master Artists
                        <ChevronRight className='transition-transform duration-300' size={16} />
                    </div>
                    
                    <h1 className="text-4xl sm:text-7xl font-bold bg-gradient-to-r from-green-600 via-orange-600 to-green-600 bg-clip-text text-transparent mb-8 leading-tight">
                        Art Collections
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-700 max-w-4xl mx-auto mb-12 leading-relaxed">
                        Discover an exquisite collection of handpicked artworks that celebrate India's rich cultural heritage. 
                        From contemporary masterpieces to traditional crafts, each piece tells a unique story of artistic excellence.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-green-100 group">
                            <Palette className="text-green-600 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" size={40} />
                            <h3 className="font-bold text-gray-900 mb-3 text-lg">Premium Curation</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">Carefully selected artworks from renowned artists and emerging talents</p>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-orange-100 group">
                            <Award className="text-orange-600 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" size={40} />
                            <h3 className="font-bold text-gray-900 mb-3 text-lg">Authentic Quality</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">Certificate of authenticity with every purchase</p>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-green-100 group">
                            <Users className="text-green-600 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" size={40} />
                            <h3 className="font-bold text-gray-900 mb-3 text-lg">Artist Support</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">Directly supporting artists and their creative journey</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* About Art Collections Section */}
            <div className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">The Art of Collection</h2>
                        <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
                            Art collections bring together centuries of creativity, innovation, and cultural expression. Each collection 
                            is a testament to the diversity and richness of Indian heritage, from ancient sculptures to contemporary paintings. 
                            Our curated collections showcase the finest works that represent different regions, styles, and artistic movements.
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="bg-green-100 p-3 rounded-xl">
                                    <Heart className="text-green-600" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Passion for Art</h3>
                                    <p className="text-gray-600">Every piece in our collection is chosen with love and deep appreciation for artistic excellence and cultural significance.</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-4">
                                <div className="bg-orange-100 p-3 rounded-xl">
                                    <Eye className="text-orange-600" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Expert Curation</h3>
                                    <p className="text-gray-600">Our team of art historians and critics carefully evaluate each piece to ensure authenticity and artistic merit.</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-gradient-to-br from-green-50 to-orange-50 rounded-3xl p-8 shadow-lg">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Collection Highlights</h3>
                            <ul className="space-y-3 text-gray-700">
                                <li className="flex items-center gap-3">
                                    <ChevronRight className="text-green-600" size={16} />
                                    <span>Traditional paintings from across India</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <ChevronRight className="text-green-600" size={16} />
                                    <span>Contemporary sculptures by renowned artists</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <ChevronRight className="text-green-600" size={16} />
                                    <span>Handcrafted pottery with cultural significance</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <ChevronRight className="text-green-600" size={16} />
                                    <span>Limited edition prints and originals</span>
                                </li>
                            </ul>
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
                                <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-green-600"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <GiPaintBrush className="text-green-600" size={24} />
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
                                    <div className="bg-gray-50 rounded-3xl p-12 max-w-md mx-auto">
                                        <GiPaintBrush className="mx-auto text-gray-400 mb-6" size={80} />
                                        <h3 className="text-2xl font-bold text-gray-600 mb-4">No artworks found</h3>
                                        <p className="text-gray-500">Try selecting a different category or check back later for new additions to our collection.</p>
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

export default ArtCollectionsPage
