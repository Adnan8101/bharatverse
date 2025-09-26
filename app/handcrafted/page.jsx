'use client'
import { useState, useEffect } from 'react'
import ProductCard from '@/components/ProductCard'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Hammer, Lightbulb, Shirt, Watch } from 'lucide-react'
import { Heart, Users, TreePine, ChevronRight, Leaf, Zap, Globe } from 'lucide-react'

const HandcraftedPage = () => {
    const [products, setProducts] = useState([])
    const [filteredProducts, setFilteredProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedCategory, setSelectedCategory] = useState('all')

    const categories = [
        { id: 'all', name: 'All Handcrafted', icon: <Hammer size={20} />, color: 'from-green-500 to-blue-500' },
        { id: 'textile', name: 'Handwoven Textiles', icon: <Shirt size={20} />, color: 'from-blue-500 to-purple-500' },
        { id: 'accessories', name: 'Handmade Accessories', icon: <Watch size={20} />, color: 'from-purple-500 to-pink-500' },
        { id: 'lighting', name: 'Artisan Lighting', icon: <Lightbulb size={20} />, color: 'from-yellow-500 to-orange-500' },
        { id: 'wellness', name: 'Wellness Crafts', icon: <Heart size={20} />, color: 'from-pink-500 to-red-500' }
    ]

    const fetchHandcraftedProducts = async (category = '') => {
        try {
            setLoading(true)
            const response = await fetch(`/api/handcrafted${category ? `?category=${category}` : ''}`)
            if (response.ok) {
                const data = await response.json()
                setProducts(data.products || [])
                setFilteredProducts(data.products || [])
            } else {
                console.error('Failed to fetch handcrafted products')
                setProducts([])
                setFilteredProducts([])
            }
        } catch (error) {
            console.error('Error fetching handcrafted products:', error)
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
        fetchHandcraftedProducts()
    }, [])

    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-green-50 via-blue-50 to-green-50 py-16 sm:py-24 overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-16 w-44 h-44 bg-gradient-to-r from-green-400 to-blue-400 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-20 right-20 w-60 h-60 bg-gradient-to-r from-blue-400 to-green-400 rounded-full blur-3xl animate-pulse delay-1000"></div>
                    <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-gradient-to-r from-green-200 to-blue-200 rounded-full blur-3xl opacity-30"></div>
                </div>
                
                <div className="relative max-w-7xl mx-auto px-6 text-center">
                    <div className="flex justify-center mb-8">
                        <div className="bg-gradient-to-r from-green-500 to-blue-500 p-6 rounded-3xl shadow-2xl transform hover:scale-110 hover:-rotate-2 transition-all duration-500">
                            <Hammer className="text-white" size={60} />
                        </div>
                    </div>
                    
                    <div className="inline-flex items-center gap-3 bg-white/90 backdrop-blur-sm text-green-700 pr-4 p-2 rounded-full text-xs sm:text-sm font-medium shadow-lg border border-green-200 mb-8">
                        <span className='bg-gradient-to-r from-green-600 to-blue-600 px-4 py-2 rounded-full text-white text-xs font-semibold'>SUSTAINABLE</span> 
                        Eco-Friendly & Ethically Made
                        <ChevronRight className='transition-transform duration-300' size={16} />
                    </div>
                    
                    <h1 className="text-4xl sm:text-7xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-green-600 bg-clip-text text-transparent mb-8 leading-tight">
                        Handcrafted
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-700 max-w-4xl mx-auto mb-12 leading-relaxed">
                        Experience the beauty of handmade craftsmanship. Every piece is lovingly created by skilled artisans using 
                        traditional techniques passed down through generations, bringing you authentic, sustainable, and unique creations.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-green-100 group">
                            <Heart className="text-green-600 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" size={40} />
                            <h3 className="font-bold text-gray-900 mb-3 text-lg">Made with Love</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">Each item crafted with passion, care, and attention to every detail</p>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-blue-100 group">
                            <TreePine className="text-blue-600 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" size={40} />
                            <h3 className="font-bold text-gray-900 mb-3 text-lg">Sustainable Materials</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">Eco-friendly and ethically sourced materials for a better planet</p>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-green-100 group">
                            <Users className="text-green-600 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" size={40} />
                            <h3 className="font-bold text-gray-900 mb-3 text-lg">Supporting Communities</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">Empowering local artisan communities and preserving traditions</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* About Handcrafted */}
            <div className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">The Art of Handcraftsmanship</h2>
                        <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
                            In a world of mass production, handcrafted items stand as a testament to human creativity and skill. 
                            Our collection celebrates the beauty of imperfection, the uniqueness of individual touch, and the 
                            sustainability of traditional making processes. Each piece carries the maker's story and supports 
                            the continuation of ancient crafts.
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100">
                                <div className="bg-green-100 p-4 rounded-2xl w-fit mb-4">
                                    <Shirt className="text-green-600" size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Handwoven Textiles</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">Traditional looms create beautiful fabrics with natural fibers and organic dyes.</p>
                            </div>
                            
                            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100">
                                <div className="bg-blue-100 p-4 rounded-2xl w-fit mb-4">
                                    <Watch className="text-blue-600" size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Artisan Accessories</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">Handmade jewelry, bags, and accessories using traditional metalwork and weaving.</p>
                            </div>
                            
                            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-yellow-100">
                                <div className="bg-yellow-100 p-4 rounded-2xl w-fit mb-4">
                                    <Lightbulb className="text-yellow-600" size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Artisan Lighting</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">Hand-crafted lamps and lighting fixtures using natural materials.</p>
                            </div>
                            
                            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-pink-100">
                                <div className="bg-pink-100 p-4 rounded-2xl w-fit mb-4">
                                    <Heart className="text-pink-600" size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Wellness Crafts</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">Handmade items for health and wellness, including natural skincare.</p>
                            </div>
                        </div>
                        
                        <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-3xl p-10 shadow-xl">
                            <div className="flex items-center gap-4 mb-8">
                                <Globe className="text-green-600" size={40} />
                                <h3 className="text-3xl font-bold text-gray-900">Sustainable Impact</h3>
                            </div>
                            
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="bg-green-500 rounded-full p-2 mt-1">
                                        <Leaf className="text-white" size={16} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 mb-2">Environmental Benefits</h4>
                                        <p className="text-sm text-gray-600 leading-relaxed">Handcrafted items use less energy and create minimal environmental impact compared to mass production.</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start gap-4">
                                    <div className="bg-blue-500 rounded-full p-2 mt-1">
                                        <Users className="text-white" size={16} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 mb-2">Community Empowerment</h4>
                                        <p className="text-sm text-gray-600 leading-relaxed">Supporting local artisans provides fair wages and preserves traditional skills for future generations.</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start gap-4">
                                    <div className="bg-purple-500 rounded-full p-2 mt-1">
                                        <Zap className="text-white" size={16} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 mb-2">Unique Quality</h4>
                                        <p className="text-sm text-gray-600 leading-relaxed">Every handcrafted piece is unique, carrying the personality and skill of its maker.</p>
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
                                <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-green-600"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Hammer className="text-green-600" size={24} />
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
                                    <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-3xl p-12 max-w-md mx-auto">
                                        <Hammer className="mx-auto text-green-400 mb-6" size={80} />
                                        <h3 className="text-2xl font-bold text-gray-600 mb-4">No handcrafted items found</h3>
                                        <p className="text-gray-500">Try selecting a different category or check back later for new artisan creations.</p>
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

export default HandcraftedPage
