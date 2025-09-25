/**
 * Utility functions for persisting cart data when user is not signed in
 */

const GUEST_CART_KEY = 'bharatverse_guest_cart'
const GUEST_COUPON_KEY = 'bharatverse_guest_coupon'

export const CartPersistence = {
  /**
   * Save cart state to localStorage for guest users
   */
  saveGuestCart: (cartState, couponState = null) => {
    try {
      const cartData = {
        cartItems: cartState.cartItems || {},
        total: cartState.total || 0,
        timestamp: Date.now()
      }
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cartData))
      
      // Save coupon state if provided
      if (couponState && couponState.isApplied) {
        const couponData = {
          couponCode: couponState.couponCode,
          couponDiscount: couponState.couponDiscount,
          appliedCoupon: couponState.appliedCoupon,
          isApplied: couponState.isApplied,
          applicableItems: couponState.applicableItems,
          applicableAmount: couponState.applicableAmount,
          timestamp: Date.now()
        }
        localStorage.setItem(GUEST_COUPON_KEY, JSON.stringify(couponData))
      }
      
      console.log('Guest cart saved to localStorage:', cartData)
    } catch (error) {
      console.error('Failed to save guest cart:', error)
    }
  },

  /**
   * Load cart state from localStorage for guest users
   */
  loadGuestCart: () => {
    try {
      const cartData = localStorage.getItem(GUEST_CART_KEY)
      const couponData = localStorage.getItem(GUEST_COUPON_KEY)
      
      let cart = null
      let coupon = null

      if (cartData) {
        const parsed = JSON.parse(cartData)
        // Check if cart data is not too old (24 hours)
        const isExpired = Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000
        
        if (!isExpired) {
          cart = {
            cartItems: parsed.cartItems || {},
            total: parsed.total || 0
          }
          console.log('Guest cart loaded from localStorage:', cart)
        } else {
          console.log('Guest cart expired, clearing localStorage')
          CartPersistence.clearGuestCart()
        }
      }

      if (couponData) {
        const parsed = JSON.parse(couponData)
        // Check if coupon data is not too old (24 hours)
        const isExpired = Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000
        
        if (!isExpired) {
          coupon = {
            couponCode: parsed.couponCode,
            couponDiscount: parsed.couponDiscount,
            appliedCoupon: parsed.appliedCoupon,
            isApplied: parsed.isApplied,
            applicableItems: parsed.applicableItems || [],
            applicableAmount: parsed.applicableAmount || 0
          }
          console.log('Guest coupon loaded from localStorage:', coupon)
        }
      }

      return { cart, coupon }
    } catch (error) {
      console.error('Failed to load guest cart:', error)
      return { cart: null, coupon: null }
    }
  },

  /**
   * Clear guest cart data from localStorage
   */
  clearGuestCart: () => {
    try {
      localStorage.removeItem(GUEST_CART_KEY)
      localStorage.removeItem(GUEST_COUPON_KEY)
      console.log('Guest cart cleared from localStorage')
    } catch (error) {
      console.error('Failed to clear guest cart:', error)
    }
  },

  /**
   * Check if there's a guest cart in localStorage
   */
  hasGuestCart: () => {
    try {
      const cartData = localStorage.getItem(GUEST_CART_KEY)
      if (cartData) {
        const parsed = JSON.parse(cartData)
        const isNotExpired = Date.now() - parsed.timestamp <= 24 * 60 * 60 * 1000
        return isNotExpired && Object.keys(parsed.cartItems || {}).length > 0
      }
      return false
    } catch (error) {
      console.error('Failed to check guest cart:', error)
      return false
    }
  }
}
