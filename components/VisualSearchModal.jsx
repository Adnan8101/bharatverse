'use client'
import { useState, useRef } from 'react'
import { Camera, X, Search, Loader } from 'lucide-react'
import { useRouter } from 'next/navigation'

const VisualSearchModal = ({ isOpen, onClose }) => {
    const [selectedImage, setSelectedImage] = useState(null)
    const [searching, setSearching] = useState(false)
    const [searchResults, setSearchResults] = useState([])
    const fileInputRef = useRef(null)
    const router = useRouter()

    const handleImageSelect = (event) => {
        const file = event.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
                setSelectedImage({
                    file,
                    url: e.target.result
                })
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSearch = async () => {
        if (!selectedImage) return

        setSearching(true)
        try {
            // Add a small delay for better UX
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const formData = new FormData()
            formData.append('image', selectedImage.file)

            const response = await fetch('/api/ai/visual-search', {
                method: 'POST',
                body: formData
            })

            const data = await response.json()
            if (data.success && data.results && data.results.length > 0) {
                setSearchResults(data.results)
            } else {
                setSearchResults([])
                console.log('No similar products found')
            }
        } catch (error) {
            console.error('Error performing visual search:', error)
            setSearchResults([])
        } finally {
            setSearching(false)
        }
    }

    const handleProductClick = (productId) => {
        onClose()
        router.push(`/product/${productId}`)
    }

    const resetSearch = () => {
        setSelectedImage(null)
        setSearchResults([])
        setSearching(false)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-800">Visual Search</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6">
                    {!selectedImage ? (
                        <div className="text-center">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 mb-4">
                                <Camera size={48} className="mx-auto text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium text-gray-700 mb-2">
                                    Upload an image to find similar products
                                </h3>
                                <p className="text-gray-500 mb-6">
                                    Take a photo or upload an image of any product to find similar items in our store
                                </p>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Upload Image
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                    className="hidden"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-start gap-6">
                                <div className="flex-shrink-0">
                                    <img
                                        src={selectedImage.url}
                                        alt="Search image"
                                        className="w-32 h-32 object-cover rounded-lg border"
                                    />
                                </div>
                                <div className="flex-1">
                                    {searching ? (
                                        <div>
                                            <div className="flex items-center gap-3 mb-3">
                                                <Loader size={20} className="animate-spin text-blue-600" />
                                                <h3 className="text-lg font-medium text-gray-800">
                                                    Finding Similar Products
                                                </h3>
                                            </div>
                                            <p className="text-gray-600 mb-4">
                                                Analyzing your image and searching our catalog...
                                            </p>
                                            <div className="bg-blue-50 rounded-lg p-4">
                                                <div className="flex items-center gap-2 text-blue-700 text-sm">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                                    Processing image features
                                                </div>
                                            </div>
                                        </div>
                                    ) : searchResults.length > 0 ? (
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                <h3 className="text-lg font-medium text-gray-800">
                                                    Search Complete!
                                                </h3>
                                            </div>
                                            <p className="text-gray-600 mb-4">
                                                Found {searchResults.length} similar products in our store
                                            </p>
                                            <button
                                                onClick={resetSearch}
                                                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 text-sm"
                                            >
                                                Try Another Image
                                            </button>
                                        </div>
                                    ) : (
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-800 mb-2">
                                                Search for similar products
                                            </h3>
                                            <p className="text-gray-600 mb-4">
                                                We'll analyze your image and find similar products in our store
                                            </p>
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={handleSearch}
                                                    disabled={searching}
                                                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                                                >
                                                    <Search size={16} />
                                                    Find Similar
                                                </button>
                                                <button
                                                    onClick={resetSearch}
                                                    className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
                                                >
                                                    Try Another Image
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {!searching && selectedImage && searchResults.length === 0 && (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Search size={24} className="text-orange-600" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                                        No Similar Products Found
                                    </h3>
                                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                        We couldn't find similar products. Try uploading a different image or browse our categories.
                                    </p>
                                    <div className="flex gap-3 justify-center">
                                        <button
                                            onClick={resetSearch}
                                            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                                        >
                                            Try Another Image
                                        </button>
                                        <button
                                            onClick={() => {
                                                onClose();
                                                router.push('/shop');
                                            }}
                                            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
                                        >
                                            Browse All Products
                                        </button>
                                    </div>
                                </div>
                            )}

                            {searchResults.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                        Similar Products Found ({searchResults.length})
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {searchResults.map((product) => (
                                            <div
                                                key={product.id}
                                                onClick={() => handleProductClick(product.id)}
                                                className="border border-gray-200 rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow bg-white hover:bg-gray-50"
                                            >
                                                <img
                                                    src={product.images?.[0] || product.image}
                                                    alt={product.name}
                                                    className="w-full h-32 object-cover rounded-lg mb-2"
                                                />
                                                <h4 className="font-medium text-sm text-gray-800 mb-1 line-clamp-2">
                                                    {product.name}
                                                </h4>
                                                <div className="flex items-center justify-between">
                                                    <span className="font-semibold text-green-600">
                                                        ₹{product.price}
                                                    </span>
                                                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                                                        {product.similarity}% match
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default VisualSearchModal
