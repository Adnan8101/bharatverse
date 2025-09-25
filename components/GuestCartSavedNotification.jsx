'use client'
import { useEffect, useState } from 'react'
import { Clock, X } from 'lucide-react'

export default function GuestCartSavedNotification() {
  const [show, setShow] = useState(false)
  const [itemCount, setItemCount] = useState(0)

  useEffect(() => {
    const handleGuestCartSaved = (event) => {
      setItemCount(event.detail.itemCount)
      setShow(true)
      
      // Auto hide after 3 seconds
      setTimeout(() => {
        setShow(false)
      }, 3000)
    }

    window.addEventListener('guest-cart-saved', handleGuestCartSaved)
    
    return () => {
      window.removeEventListener('guest-cart-saved', handleGuestCartSaved)
    }
  }, [])

  if (!show) return null

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      <div className="bg-amber-50 border border-amber-200 rounded-lg shadow-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Clock className="h-5 w-5 text-amber-400" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-amber-800">
              Cart Items Saved
            </p>
            <p className="text-sm text-amber-700 mt-1">
              Your {itemCount} item{itemCount !== 1 ? 's' : ''} will be restored when you sign in.
            </p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={() => setShow(false)}
              className="inline-flex text-amber-400 hover:text-amber-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
