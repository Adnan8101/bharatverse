'use client'
import { assets } from "@/assets/assets"
import Image from "next/image"
import { useState } from "react"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"
import SuccessModal from "@/components/SuccessModal"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ManualAddProduct() {

    const router = useRouter()
    const categories = ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books', 'Toys', 'Beauty', 'Food & Beverages', 'Automotive', 'Health']

    const [images, setImages] = useState({ 1: null, 2: null, 3: null, 4: null })
    const [productInfo, setProductInfo] = useState({
        name: "",
        description: "",
        mrp: "",
        price: "",
        category: "",
        stockQuantity: "50",
    })
    const [loading, setLoading] = useState(false)
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [addedProduct, setAddedProduct] = useState(null)

    const onChangeHandler = (e) => {
        setProductInfo({ ...productInfo, [e.target.name]: e.target.value })
    }

    const validateForm = () => {
        const { name, description, mrp, price, category, stockQuantity } = productInfo
        
        if (!name.trim()) {
            toast.error("Product name is required")
            return false
        }
        
        if (!description.trim()) {
            toast.error("Product description is required")
            return false
        }
        
        if (!category) {
            toast.error("Please select a category")
            return false
        }
        
        const mrpNum = parseFloat(mrp)
        const priceNum = parseFloat(price)
        
        if (!mrp || mrpNum <= 0) {
            toast.error("Please enter a valid MRP")
            return false
        }
        
        if (!price || priceNum <= 0) {
            toast.error("Please enter a valid selling price")
            return false
        }
        
        if (priceNum > mrpNum) {
            toast.error("Selling price cannot be higher than MRP")
            return false
        }
        
        const stockQty = parseInt(stockQuantity)
        if (!stockQuantity || stockQty < 0) {
            toast.error("Please enter a valid stock quantity")
            return false
        }
        
        // Check if at least one image is selected
        const hasImages = Object.values(images).some(img => img !== null)
        if (!hasImages) {
            toast.error("Please select at least one product image")
            return false
        }
        
        return true
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault()
        
        if (!validateForm()) {
            return
        }
        
        setLoading(true)
        
        try {
            const formData = new FormData()
            
            // Add product data
            formData.append('name', productInfo.name.trim())
            formData.append('description', productInfo.description.trim())
            formData.append('mrp', productInfo.mrp)
            formData.append('price', productInfo.price)
            formData.append('category', productInfo.category)
            formData.append('stockQuantity', productInfo.stockQuantity)
            
            // Add images
            Object.entries(images).forEach(([key, image]) => {
                if (image) {
                    formData.append(`image${key}`, image)
                }
            })
            
            const response = await fetch('/api/store-owner/products', {
                method: 'POST',
                credentials: 'include',
                body: formData
            })
            
            const result = await response.json()
            
            if (result.success) {
                setAddedProduct(result.product)
                setShowSuccessModal(true)
                
                // Trigger product list refresh for the public store
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('refreshProducts'))
                }
                
                // Reset form
                setProductInfo({
                    name: "",
                    description: "",
                    mrp: "",
                    price: "",
                    category: "",
                    stockQuantity: "",
                })
                setImages({ 1: null, 2: null, 3: null, 4: null })
                
                toast.success("Product added successfully!")
            } else {
                toast.error(result.message || "Failed to add product")
            }
        } catch (error) {
            console.error('Error adding product:', error)
            toast.error("Failed to add product. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const handleImageChange = (key, file) => {
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error('Please select a valid image file')
                return
            }
            
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB')
                return
            }
        }
        
        setImages({ ...images, [key]: file })
    }

    const removeImage = (key) => {
        setImages({ ...images, [key]: null })
    }


    return (
        <>
            <div className="mb-6">
                <Link
                    href="/store/add-product"
                    className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
                >
                    <ArrowLeft size={16} className="mr-2" />
                    Back to AI Product Creation
                </Link>
                
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl">Manual Product <span className="text-slate-800 font-medium">Entry</span></h1>
                    <div className="text-sm text-slate-600">
                        <span className="text-red-500">*</span> Required fields
                    </div>
                </div>
                <p className="text-gray-600 mt-2">Enter product details manually without AI assistance</p>
            </div>

            <form onSubmit={e => toast.promise(onSubmitHandler(e), { loading: "Adding Product..." })} className="text-slate-500 mb-28">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-6">
                    <p className="mb-4 font-medium text-slate-700">Product Images <span className="text-red-500">*</span></p>
                    <p className="text-sm text-slate-500 mb-4">Upload 1-4 high-quality images (Max 5MB each)</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.keys(images).map((key) => (
                            <div key={key} className="relative">
                                <label htmlFor={`images${key}`} className="block">
                                    <div className="relative overflow-hidden border-2 border-dashed border-slate-300 rounded-lg hover:border-slate-400 transition-colors cursor-pointer group">
                                        <Image 
                                            width={200} 
                                            height={200} 
                                            className='w-full h-40 object-cover' 
                                            src={images[key] ? URL.createObjectURL(images[key]) : assets.upload_area} 
                                            alt={`Product image ${key}`}
                                        />
                                        {!images[key] && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-slate-50 group-hover:bg-slate-100 transition-colors">
                                                <span className="text-slate-400 text-sm">Click to upload</span>
                                            </div>
                                        )}
                                    </div>
                                    <input 
                                        type="file" 
                                        accept='image/*' 
                                        id={`images${key}`} 
                                        onChange={e => handleImageChange(key, e.target.files[0])} 
                                        className="hidden" 
                                    />
                                </label>
                                {images[key] && (
                                    <button
                                        type="button"
                                        onClick={() => removeImage(key)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 space-y-6">
                    <h3 className="font-medium text-slate-700 text-lg">Product Information</h3>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                        <label className="flex flex-col gap-2">
                            <span className="font-medium text-slate-700">Product Name <span className="text-red-500">*</span></span>
                            <input 
                                type="text" 
                                name="name" 
                                onChange={onChangeHandler} 
                                value={productInfo.name} 
                                placeholder="Enter product name" 
                                className="p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent" 
                                required 
                                disabled={loading}
                            />
                        </label>

                        <label className="flex flex-col gap-2">
                            <span className="font-medium text-slate-700">Category <span className="text-red-500">*</span></span>
                            <select 
                                onChange={e => setProductInfo({ ...productInfo, category: e.target.value })} 
                                value={productInfo.category} 
                                className="p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent" 
                                required
                                disabled={loading}
                            >
                                <option value="">Select a category</option>
                                {categories.map((category) => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <label className="flex flex-col gap-2">
                        <span className="font-medium text-slate-700">Description <span className="text-red-500">*</span></span>
                        <textarea 
                            name="description" 
                            onChange={onChangeHandler} 
                            value={productInfo.description} 
                            placeholder="Enter detailed product description" 
                            rows={4} 
                            className="p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent resize-none" 
                            required 
                            disabled={loading}
                        />
                    </label>

                    <div className="grid md:grid-cols-3 gap-6">
                        <label className="flex flex-col gap-2">
                            <span className="font-medium text-slate-700">MRP (₹) <span className="text-red-500">*</span></span>
                            <input 
                                type="number" 
                                name="mrp" 
                                onChange={onChangeHandler} 
                                value={productInfo.mrp} 
                                placeholder="0.00" 
                                min="0"
                                step="0.01"
                                className="p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent" 
                                required 
                                disabled={loading}
                            />
                        </label>
                        
                        <label className="flex flex-col gap-2">
                            <span className="font-medium text-slate-700">Selling Price (₹) <span className="text-red-500">*</span></span>
                            <input 
                                type="number" 
                                name="price" 
                                onChange={onChangeHandler} 
                                value={productInfo.price} 
                                placeholder="0.00" 
                                min="0"
                                step="0.01"
                                className="p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent" 
                                required 
                                disabled={loading}
                            />
                        </label>
                        
                        <label className="flex flex-col gap-2">
                            <span className="font-medium text-slate-700">Stock Quantity <span className="text-red-500">*</span></span>
                            <input 
                                type="number" 
                                name="stockQuantity" 
                                onChange={onChangeHandler} 
                                value={productInfo.stockQuantity} 
                                placeholder="Enter stock quantity (e.g., 50)" 
                                min="0"
                                className="p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent" 
                                required 
                                disabled={loading}
                            />
                        </label>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button 
                            type="submit"
                            disabled={loading} 
                            className="bg-slate-800 text-white px-8 py-3 hover:bg-slate-900 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                            {loading ? "Adding Product..." : "Add Product"}
                        </button>
                        
                        <button 
                            type="button"
                            onClick={() => router.push('/store/manage-product')}
                            className="border border-slate-300 text-slate-700 px-8 py-3 hover:bg-slate-50 rounded-lg transition-colors font-medium"
                            disabled={loading}
                        >
                            View Products
                        </button>
                    </div>
                </div>
            </form>

            <SuccessModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                title="Product Added Successfully!"
                message={`"${addedProduct?.name}" has been added to your store and is now available for customers to purchase.`}
                actionButton={{
                    text: "View Products",
                    onClick: () => {
                        setShowSuccessModal(false)
                        router.push('/store/manage-product')
                    }
                }}
            />
        </>
    )
}
