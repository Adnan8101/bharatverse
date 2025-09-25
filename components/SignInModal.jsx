'use client'
import { User, X } from "lucide-react"
import { useRouter } from "next/navigation"

export default function SignInModal({ isOpen, onClose, redirectPath = '/cart/checkout' }) {
    const router = useRouter()
    
    if (!isOpen) return null

    const handleSignIn = () => {
        onClose()
        router.push(`/sign-in?redirect=${redirectPath}`)
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
                >
                    <X size={20} />
                </button>
                
                {/* User icon */}
                <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
                    <User className="w-8 h-8 text-blue-600" />
                </div>
                
                {/* Content */}
                <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Sign In Required
                    </h3>
                    <p className="text-gray-600 mb-2">
                        You need to be signed in to proceed to checkout and place your order.
                    </p>
                    <p className="text-sm text-green-600 mb-6 font-medium">
                        ✓ Your cart items will be automatically saved and restored after you sign in.
                    </p>
                    
                    {/* Action buttons */}
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSignIn}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            Sign In
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
