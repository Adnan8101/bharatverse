'use client'
import { useState } from "react"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"
import SuccessModal from "@/components/SuccessModal"
import AIProductForm from "@/components/AIProductForm"
import { Sparkles } from "lucide-react"

export default function StoreAddProduct() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [addedProduct, setAddedProduct] = useState(null)

    const handleProductGenerated = async (productData) => {
        setLoading(true)
        
        try {
            const formData = new FormData()
            
            // Add product data
            formData.append('name', productData.name.trim())
            formData.append('description', productData.description.trim())
            formData.append('mrp', productData.mrp)
            formData.append('price', productData.price)
            formData.append('category', productData.category)
            formData.append('stockQuantity', productData.stockQuantity)
            
            // Add the AI analyzed image if available
            if (productData.selectedImage) {
                formData.append('image1', productData.selectedImage)
            }
            
            // Add any existing images
            if (productData.images && productData.images.length > 0) {
                productData.images.forEach((image, index) => {
                    if (image) {
                        formData.append(`image${index + 1}`, image)
                    }
                })
            }
            
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
                
                toast.success("AI-powered product added successfully!")
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

    return (
        <>
            <div className="mb-28">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl flex items-center">
                            <Sparkles className="w-6 h-6 text-purple-600 mr-2" />
                            AI-Powered <span className="text-slate-800 font-medium ml-2">Product Creation</span>
                        </h1>
                        <p className="text-slate-600 mt-2">Upload an image and let AI generate product details automatically</p>
                    </div>
                    <div className="text-sm text-slate-600">
                        <span className="text-red-500">*</span> Required fields
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <AIProductForm 
                        onProductGenerated={handleProductGenerated}
                        loading={loading}
                    />
                </div>

                {/* Traditional Form Option */}
                <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="font-medium text-gray-700 mb-2">Need the traditional form?</h3>
                    <p className="text-sm text-gray-600 mb-3">
                        If you prefer to enter product details manually without AI assistance, you can still use the classic form.
                    </p>
                    <button
                        onClick={() => router.push('/store/add-product/manual')}
                        className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                    >
                        Use Manual Form →
                    </button>
                </div>
            </div>

            <SuccessModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                title="AI Product Added Successfully!"
                message={`"${addedProduct?.name}" has been created with AI assistance and is now available for customers to purchase.`}
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
