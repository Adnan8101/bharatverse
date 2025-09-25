'use client'
import { CheckCircle, X } from "lucide-react"
import { useEffect } from "react"

export default function SuccessModal({ isOpen, onClose, title, message, actionButton }) {
    
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose()
            }
        }
        
        if (isOpen) {
            document.addEventListener('keydown', handleEscape)
            document.body.style.overflow = 'hidden'
        }
        
        return () => {
            document.removeEventListener('keydown', handleEscape)
            document.body.style.overflow = 'auto'
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

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
                
                {/* Success icon */}
                <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                
                {/* Content */}
                <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {title || "Success!"}
                    </h3>
                    <p className="text-gray-600 mb-6">
                        {message || "Operation completed successfully"}
                    </p>
                    
                    {/* Action buttons */}
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Close
                        </button>
                        {actionButton && (
                            <button
                                onClick={actionButton.onClick}
                                className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors"
                            >
                                {actionButton.text}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
