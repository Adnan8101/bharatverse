'use client'
import { useDynamicLanguage } from '@/contexts/DynamicLanguageContext'
import { languages } from '@/lib/languages'
import { Loader2, Globe, Zap, Star } from 'lucide-react'

const DynamicLanguageDemo = () => {
    const { currentLanguage, currentLanguageInfo, changeLanguage, isTranslating, translationCache } = useDynamicLanguage()

    return (
        <div className="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-lg">
            {/* Header */}
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-3">
                    <Globe className="w-10 h-10 text-blue-600" />
                    Dynamic Language Translation System
                    <Zap className="w-8 h-8 text-yellow-500" />
                </h1>
                <p className="text-lg text-gray-600">
                    Powered by Google Gemini AI - Real-time translation of entire page content
                </p>
                <div className="mt-4 flex items-center justify-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                        <span className="text-sm">Current: <strong>{currentLanguageInfo?.nativeName}</strong></span>
                    </div>
                    {isTranslating && (
                        <div className="flex items-center gap-2 text-blue-600">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm">Translating...</span>
                        </div>
                    )}
                    <div className="text-sm text-gray-500">
                        Cache: {translationCache} items
                    </div>
                </div>
            </div>

            {/* Language Switcher */}
            <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                <h2 className="text-2xl font-semibold mb-4 text-center">Quick Language Switch</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {languages.slice(0, 12).map((language) => (
                        <button
                            key={language.code}
                            onClick={() => changeLanguage(language.code)}
                            disabled={isTranslating}
                            className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 ${
                                currentLanguage === language.code
                                    ? 'bg-blue-500 text-white border-blue-500 shadow-lg'
                                    : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:shadow-md'
                            } ${isTranslating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                            <div className="text-2xl mb-2">{language.flag}</div>
                            <div className="text-sm font-medium">{language.nativeName}</div>
                            <div className="text-xs opacity-75">{language.name}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Sample Content to Translate */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* E-commerce Content */}
                <div className="space-y-6">
                    <div className="bg-gray-50 p-6 rounded-xl">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Star className="w-5 h-5 text-yellow-500" />
                            Featured Products
                        </h3>
                        <div className="space-y-4">
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                                <h4 className="font-semibold text-lg">Premium Wireless Headphones</h4>
                                <p className="text-gray-600 mt-2">
                                    Experience crystal-clear audio with our premium wireless headphones. 
                                    Features active noise cancellation and 30-hour battery life.
                                </p>
                                <div className="mt-3 flex items-center justify-between">
                                    <span className="text-2xl font-bold text-green-600">₹12,999</span>
                                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                            
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                                <h4 className="font-semibold text-lg">Smart Fitness Watch</h4>
                                <p className="text-gray-600 mt-2">
                                    Track your health and fitness goals with this advanced smartwatch. 
                                    Includes heart rate monitoring, GPS, and waterproof design.
                                </p>
                                <div className="mt-3 flex items-center justify-between">
                                    <span className="text-2xl font-bold text-green-600">₹8,499</span>
                                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                        Buy Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-green-50 p-6 rounded-xl">
                        <h3 className="text-xl font-bold mb-4">Customer Reviews</h3>
                        <div className="space-y-3">
                            <div className="bg-white p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="flex text-yellow-400">★★★★★</div>
                                    <span className="font-medium">Rajesh Kumar</span>
                                </div>
                                <p className="text-gray-700">
                                    Excellent product quality! Fast delivery and great customer service. 
                                    Highly recommend this store to everyone.
                                </p>
                            </div>
                            
                            <div className="bg-white p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="flex text-yellow-400">★★★★☆</div>
                                    <span className="font-medium">Priya Sharma</span>
                                </div>
                                <p className="text-gray-700">
                                    Good shopping experience. The website is easy to navigate and 
                                    payment process is secure. Will shop again.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Information Content */}
                <div className="space-y-6">
                    <div className="bg-purple-50 p-6 rounded-xl">
                        <h3 className="text-xl font-bold mb-4">About BharatVerse</h3>
                        <p className="text-gray-700 mb-4">
                            BharatVerse is India's premier e-commerce platform, offering a wide range of 
                            products from electronics to fashion, home & garden, and much more. 
                            We are committed to providing the best shopping experience with 
                            competitive prices and excellent customer service.
                        </p>
                        <h4 className="font-semibold mb-2">Why Choose BharatVerse?</h4>
                        <ul className="space-y-2 text-gray-700">
                            <li>• Free shipping on orders above ₹500</li>
                            <li>• 30-day return policy</li>
                            <li>• 24/7 customer support</li>
                            <li>• Secure payment options</li>
                            <li>• Fast delivery across India</li>
                        </ul>
                    </div>

                    <div className="bg-orange-50 p-6 rounded-xl">
                        <h3 className="text-xl font-bold mb-4">Shipping Information</h3>
                        <div className="space-y-3">
                            <div>
                                <h4 className="font-semibold">Standard Delivery</h4>
                                <p className="text-gray-700">5-7 business days • Free for orders above ₹500</p>
                            </div>
                            <div>
                                <h4 className="font-semibold">Express Delivery</h4>
                                <p className="text-gray-700">2-3 business days • ₹99 shipping charge</p>
                            </div>
                            <div>
                                <h4 className="font-semibold">Same Day Delivery</h4>
                                <p className="text-gray-700">Available in select cities • ₹199 shipping charge</p>
                            </div>
                        </div>
                        
                        <div className="mt-6 p-4 bg-white rounded-lg">
                            <h4 className="font-semibold mb-2">Contact Support</h4>
                            <p className="text-gray-700">
                                Need help with your order? Contact our customer support team 
                                at support@bharatverse.com or call 1800-123-4567
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Translation Status */}
            <div className="mt-8 p-4 bg-blue-50 rounded-xl">
                <h3 className="font-semibold mb-2">Translation System Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                        <span className="text-gray-600">Current Language:</span>
                        <span className="ml-2 font-medium">{currentLanguageInfo?.nativeName} ({currentLanguage})</span>
                    </div>
                    <div>
                        <span className="text-gray-600">Translation Status:</span>
                        <span className={`ml-2 font-medium ${isTranslating ? 'text-blue-600' : 'text-green-600'}`}>
                            {isTranslating ? 'Translating...' : 'Ready'}
                        </span>
                    </div>
                    <div>
                        <span className="text-gray-600">Cached Translations:</span>
                        <span className="ml-2 font-medium">{translationCache}</span>
                    </div>
                </div>
            </div>

            {/* Instructions */}
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <h4 className="font-semibold text-yellow-800 mb-2">How it works:</h4>
                <ol className="text-sm text-yellow-700 space-y-1">
                    <li>1. Click on any language button above to change the language</li>
                    <li>2. The entire page content will be translated using Google Gemini AI</li>
                    <li>3. Translations are cached for better performance</li>
                    <li>4. New content added to the page is automatically translated</li>
                    <li>5. Background translation processes other pages for faster navigation</li>
                </ol>
            </div>
        </div>
    )
}

export default DynamicLanguageDemo
