'use client'
import { useState, useRef } from 'react';
import { Search, Camera, X, Upload, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function EnhancedSearchBar() {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [showVisualSearch, setShowVisualSearch] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [searchState, setSearchState] = useState('idle'); // 'idle', 'uploading', 'searching', 'success', 'error', 'no-results'
    const [searchResults, setSearchResults] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
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
            setErrorMessage('Please select a valid image file (JPG, PNG, GIF)');
            setSearchState('error');
            return;
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            setErrorMessage('Image size should be less than 10MB');
            setSearchState('error');
            return;
        }

        // Reset states
        setSearchResults([]);
        setErrorMessage('');
        setSearchState('uploading');
        
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

            // Simulate processing delay for better UX
            await new Promise(resolve => setTimeout(resolve, 800));
            
            setSearchState('searching');

            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch('/api/ai/visual-search', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            
            if (data.success && data.results && data.results.length > 0) {
                setSearchResults(data.results);
                setSearchState('success');
            } else {
                setSearchResults([]);
                setSearchState('no-results');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            setErrorMessage('Failed to process image. Please try again.');
            setSearchState('error');
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
        setSearchState('idle');
        setErrorMessage('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const getStatusContent = () => {
        switch (searchState) {
            case 'uploading':
                return {
                    icon: <Loader size={20} className="animate-spin text-blue-600" />,
                    title: "Uploading Image",
                    message: "Processing your image...",
                    bgColor: "bg-blue-50",
                    textColor: "text-blue-700"
                };
            case 'searching':
                return {
                    icon: <Loader size={20} className="animate-spin text-purple-600" />,
                    title: "Finding Similar Products",
                    message: "Analyzing image features and searching our catalog...",
                    bgColor: "bg-purple-50",
                    textColor: "text-purple-700"
                };
            case 'success':
                return {
                    icon: <CheckCircle size={20} className="text-green-600" />,
                    title: "Search Complete!",
                    message: `Found ${searchResults.length} similar products in our store`,
                    bgColor: "bg-green-50",
                    textColor: "text-green-700"
                };
            case 'no-results':
                return {
                    icon: <AlertCircle size={20} className="text-orange-600" />,
                    title: "No Similar Products Found",
                    message: "We couldn't find similar products. Try a different image or browse our categories.",
                    bgColor: "bg-orange-50",
                    textColor: "text-orange-700"
                };
            case 'error':
                return {
                    icon: <AlertCircle size={20} className="text-red-600" />,
                    title: "Search Failed",
                    message: errorMessage || "Something went wrong. Please try again.",
                    bgColor: "bg-red-50",
                    textColor: "text-red-700"
                };
            default:
                return null;
        }
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

                {/* Search suggestions */}
                {search && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-40 max-h-60 overflow-y-auto">
                        <div className="px-4 py-2 text-sm text-gray-500">
                            Search suggestions for "{search}"
                        </div>
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
                                    <Camera size={48} className="text-gray-400 mx-auto mb-4" />
                                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                                        Search with an image
                                    </h4>
                                    <p className="text-gray-500 mb-6">
                                        Drag and drop an image here, or click to select
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={searchState === 'uploading' || searchState === 'searching'}
                                    >
                                        <Upload size={16} />
                                        Select Image
                                    </button>
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
                                {/* Image Preview and Status */}
                                <div className="flex items-start gap-6">
                                    <div className="flex-shrink-0">
                                        <img
                                            src={selectedImage.url}
                                            alt="Search image"
                                            className="w-32 h-32 object-cover rounded-lg border shadow-sm"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        {(() => {
                                            const status = getStatusContent();
                                            if (!status) return null;
                                            
                                            return (
                                                <div>
                                                    <div className="flex items-center gap-3 mb-3">
                                                        {status.icon}
                                                        <h4 className="text-lg font-medium text-gray-800">
                                                            {status.title}
                                                        </h4>
                                                    </div>
                                                    <p className="text-gray-600 mb-4">
                                                        {status.message}
                                                    </p>
                                                    
                                                    {searchState === 'uploading' || searchState === 'searching' ? (
                                                        <div className={`${status.bgColor} rounded-lg p-4`}>
                                                            <div className={`flex items-center gap-2 ${status.textColor} text-sm`}>
                                                                <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                                                                {searchState === 'uploading' ? 'Processing image...' : 'Searching products...'}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex gap-3">
                                                            <button
                                                                onClick={resetSearch}
                                                                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm transition-colors"
                                                            >
                                                                Try Another Image
                                                            </button>
                                                            {searchState === 'no-results' && (
                                                                <button
                                                                    onClick={() => {
                                                                        setShowVisualSearch(false);
                                                                        router.push('/shop');
                                                                    }}
                                                                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 text-sm transition-colors"
                                                                >
                                                                    Browse All Products
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>

                                {/* Search Results */}
                                {searchResults.length > 0 && searchState === 'success' && (
                                    <div className="animate-fade-in">
                                        <h4 className="text-lg font-semibold text-gray-800 mb-4">
                                            Similar Products Found ({searchResults.length})
                                        </h4>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                                            {searchResults.map((product, index) => (
                                                <div
                                                    key={product.id}
                                                    onClick={() => handleProductClick(product.id)}
                                                    className="border border-gray-200 rounded-lg p-3 cursor-pointer hover:shadow-md transition-all duration-200 bg-white hover:bg-gray-50 animate-slide-up"
                                                    style={{ animationDelay: `${index * 100}ms` }}
                                                >
                                                    <img
                                                        src={product.images?.[0] || product.image}
                                                        alt={product.name}
                                                        className="w-full h-32 object-cover rounded-lg mb-2"
                                                    />
                                                    <h5 className="font-medium text-sm text-gray-800 mb-2 line-clamp-2">
                                                        {product.name}
                                                    </h5>
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-semibold text-green-600 text-sm">
                                                            ₹{product.price}
                                                        </span>
                                                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full font-medium">
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
            )}

            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out;
                }
                
                .animate-slide-up {
                    animation: slide-up 0.6s ease-out both;
                }
                
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>
        </>
    );
}
