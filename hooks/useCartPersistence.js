'use client'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useUser } from '@clerk/nextjs'
import { CartPersistence } from '@/lib/utils/cartPersistence'
import { restoreCart } from '@/lib/features/cart/cartSlice'
import { restoreCoupon } from '@/lib/features/coupon/couponSlice'

/**
 * Custom hook to handle cart persistence for guest users
 */
export const useCartPersistence = () => {
  const dispatch = useDispatch()
  const { user, isLoaded } = useUser()
  const cartState = useSelector(state => state.cart)
  const couponState = useSelector(state => state.coupon)

  // Restore cart when user signs in
  useEffect(() => {
    if (isLoaded && user) {
      // User just signed in, check if there's a guest cart to restore
      if (CartPersistence.hasGuestCart()) {
        const { cart, coupon } = CartPersistence.loadGuestCart()
        
        if (cart && Object.keys(cart.cartItems).length > 0) {
          console.log('Restoring guest cart after sign in...')
          dispatch(restoreCart(cart))
          
          // Also restore coupon if available
          if (coupon && coupon.isApplied) {
            dispatch(restoreCoupon(coupon))
          }
          
          // Clear the guest cart from localStorage after successful restoration
          CartPersistence.clearGuestCart()
          
          // Show a brief notification to user
          if (typeof window !== 'undefined' && window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('cart-restored', {
              detail: { itemCount: cart.total }
            }))
          }
        }
      }
    }
  }, [isLoaded, user, dispatch])

  // Save cart to localStorage when user is not signed in and cart changes
  useEffect(() => {
    if (isLoaded && !user) {
      // Only save if there are items in cart
      if (Object.keys(cartState.cartItems).length > 0) {
        CartPersistence.saveGuestCart(cartState, couponState)
        
        // Show a subtle indication that cart is being saved (only once per session)
        if (typeof window !== 'undefined' && !sessionStorage.getItem('cart-save-notified')) {
          sessionStorage.setItem('cart-save-notified', 'true')
          // Dispatch a custom event for any components that want to show feedback
          window.dispatchEvent(new CustomEvent('guest-cart-saved', {
            detail: { itemCount: cartState.total }
          }))
        }
      }
    }
  }, [isLoaded, user, cartState, couponState])

  // Clean up expired guest carts on app start
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check and clean expired carts when the app loads
      const { cart } = CartPersistence.loadGuestCart()
      if (!cart) {
        // This will clean expired carts
        CartPersistence.clearGuestCart()
      }
    }
  }, [])

  return {
    hasGuestCart: typeof window !== 'undefined' ? CartPersistence.hasGuestCart() : false,
    clearGuestCart: CartPersistence.clearGuestCart
  }
}
