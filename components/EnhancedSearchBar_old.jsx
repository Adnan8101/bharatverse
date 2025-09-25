'use client'
import { useState, useRef } from 'react';
import { Search, Camera, X, Upload, Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function EnhancedSearchBar() {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [showVisualSearch, setShowVisualSearch] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const fileInputRef = useRef(null);

    const handleSearch = (e) => {
        e.preventDefault();
        if (search.trim()) {
            router.push(`/shop?search=${search}`);
        }
    };

    const handleDrag = (e, active) => {
        e.preventDefault();
        setDragActive(active);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleImageUpload(files[0]);
        }
    };

    const handleImageUpload = async (file) => {
        if (!file || !file.type.startsWith('image/')) {
            alert('Please select a valid image file');
            return;
        }

        // Reset previous results
        setSearchResults([]);
        setIsUploading(true);
        
        try {
            // Store selected image for preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setSelectedImage({
                    file,
                    url: e.target.result
                });
            };
            reader.readAsDataURL(file);

            const formData = new FormData();
            formData.append('image', file);

            // Use the AI visual search endpoint instead
            const response = await fetch('/api/ai/visual-search', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            
            if (data.success) {
                setSearchResults(data.results || []);
            } else {
                // Don't show alert immediately, let the UI handle the empty state
                setSearchResults([]);
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            setSearchResults([]);
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            handleImageUpload(file);
        }
    };

    const handleProductClick = (productId) => {
        setShowVisualSearch(false);
        router.push(`/product/${productId}`);
    };

    const resetSearch = () => {
        setSelectedImage(null);
        setSearchResults([]);
        setIsUploading(false);
    };

    return (
        <>
            {/* Enhanced Search Bar */}
            <form onSubmit={handleSearch} className="relative flex-1 max-w-2xl">
                <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-full hover:border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                    <Search size={18} className="text-slate-500 ml-4" />
                    <input 
                        className="flex-1 bg-transparent px-4 py-3 outline-none placeholder-slate-500 text-slate-700" 
                        type="text" 
                        placeholder="Search products, brands, categories..." 
                        value={search} 
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    
                    {/* Visual Search Button */}
                    <button
                        type="button"
                        onClick={() => setShowVisualSearch(true)}
                        className="flex items-center gap-2 px-4 py-2 mr-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors text-sm"
                        title="Search with image"
                    >
                        <Camera size={16} />
                        <span className="hidden sm:inline">Visual</span>
                    </button>
                </div>

                {/* Search suggestions could go here */}
                {search && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-40 max-h-60 overflow-y-auto">
                        <div className="px-4 py-2 text-sm text-gray-500">
                            Search suggestions for "{search}"
                        </div>
                        {/* Mock suggestions */}
                        <button 
                            type="button"
                            onClick={() => {setSearch(search + ' phone'); handleSearch({preventDefault: () => {}});}}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                        >
                            {search} phone
                        </button>
                        <button 
                            type="button"
                            onClick={() => {setSearch(search + ' accessories'); handleSearch({preventDefault: () => {}});}}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                        >
                            {search} accessories
                        </button>
                    </div>
                )}
            </form>

            {/* Visual Search Modal */}
            {showVisualSearch && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold text-gray-900">Visual Search</h3>
                            <button
                                onClick={() => {
                                    setShowVisualSearch(false);
                                    resetSearch();
                                }}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {!selectedImage ? (
                            <>
                                {/* Upload Area */}
                                <div
                                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                                        dragActive 
                                            ? 'border-blue-500 bg-blue-50' 
                                            : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                    onDragEnter={(e) => handleDrag(e, true)}
                                    onDragLeave={(e) => handleDrag(e, false)}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={handleDrop}
                                >
                                    {isUploading ? (
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader size={32} className="text-blue-600 animate-spin" />
                                            <p className="text-gray-600">Processing image...</p>
                                        </div>
                                    ) : (
                                        <>
                                            <Camera size={48} className="text-gray-400 mx-auto mb-4" />
                                            <h4 className="text-lg font-medium text-gray-900 mb-2">
                                                Search with an image
                                            </h4>
                                            <p className="text-gray-500 mb-4">
                                                Drag and drop an image here, or click to select
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
                                            >
                                                <Upload size={16} />
                                                Select Image
                                            </button>
                                        </>
                                    )}
                                </div>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />

                                <p className="text-xs text-gray-500 mt-4 text-center">
                                    Supported formats: JPG, PNG, GIF. Max size: 10MB
                                </p>
                            </>
                        ) : (
                            <div className="space-y-6">
                                {/* Image Preview and Actions */}
                                <div className="flex items-start gap-6">
                                    <div className="flex-shrink-0">
                                        <img
                                            src={selectedImage.url}
                                            alt="Search image"
                                            className="w-32 h-32 object-cover rounded-lg border"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-lg font-medium text-gray-800 mb-2">
                                            Search Results
                                        </h4>
                                        <p className="text-gray-600 mb-4">
                                            Found similar products in our store
                                        </p>
                                        <button
                                            onClick={resetSearch}
                                            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 text-sm"
                                        >
                                            Try Another Image
                                        </button>
                                    </div>
                                </div>

                                {/* Search Results */}
                                {searchResults.length > 0 && (
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-800 mb-4">
                                            Similar Products Found ({searchResults.length})
                                        </h4>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                                            {searchResults.map((product) => (
                                                <div
                                                    key={product.id}
                                                    onClick={() => handleProductClick(product.id)}
                                                    className="border border-gray-200 rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow"
                                                >
                                                    <img
                                                        src={product.images?.[0] || product.image}
                                                        alt={product.name}
                                                        className="w-full h-32 object-cover rounded-lg mb-2"
                                                    />
                                                    <h5 className="font-medium text-sm text-gray-800 mb-1 line-clamp-2">
                                                        {product.name}
                                                    </h5>
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-semibold text-green-600 text-sm">
                                                            ₹{product.price}
                                                        </span>
                                                        <span className="text-xs text-blue-600">
                                                            {product.similarity}% match
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {searchResults.length === 0 && !isUploading && selectedImage && (
                                    <div className="text-center py-8 text-gray-500">
                                        <Search size={48} className="mx-auto mb-4 text-gray-300" />
                                        <p className="mb-2">No similar products found</p>
                                        <p className="text-sm">Try uploading a different image or browse all products</p>
                                        <button
                                            onClick={() => {
                                                setShowVisualSearch(false);
                                                resetSearch();
                                                router.push('/shop');
                                            }}
                                            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                                        >
                                            Browse All Products
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
