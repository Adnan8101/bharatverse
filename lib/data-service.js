// Data service to fetch from database APIs instead of dummy data

// Use relative URLs in client-side, full URLs only needed for server-side
const getApiUrl = (endpoint) => {
  if (typeof window !== 'undefined') {
    // Client-side: use relative URL
    return endpoint
  }
  // Server-side: use full URL
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com'
    : 'http://localhost:3000'
  return `${baseUrl}${endpoint}`
}

export class DataService {
  static async fetchProducts() {
    try {
      const response = await fetch(getApiUrl('/api/products'), {
        cache: 'no-store' // Always get fresh data
      })
      const result = await response.json()
      return result.success ? result.data : []
    } catch (error) {
      console.error('Error fetching products:', error)
      return []
    }
  }

  static async fetchProduct(productId) {
    try {
      const response = await fetch(getApiUrl(`/api/products/${productId}`), {
        cache: 'no-store'
      })
      const result = await response.json()
      return result.success ? result.data : null
    } catch (error) {
      console.error('Error fetching product:', error)
      return null
    }
  }

  static async fetchStores() {
    try {
      const response = await fetch(getApiUrl('/api/stores'), {
        cache: 'no-store'
      })
      const result = await response.json()
      return result.success ? result.data : []
    } catch (error) {
      console.error('Error fetching stores:', error)
      return []
    }
  }

  static async fetchCoupons() {
    try {
      const response = await fetch(getApiUrl('/api/coupons'), {
        cache: 'no-store'
      })
      const result = await response.json()
      return result.success ? result.data : []
    } catch (error) {
      console.error('Error fetching coupons:', error)
      return []
    }
  }

  static async fetchRatings() {
    try {
      const response = await fetch(getApiUrl('/api/ratings'), {
        cache: 'no-store'
      })
      const result = await response.json()
      return result.success ? result.data : []
    } catch (error) {
      console.error('Error fetching ratings:', error)
      return []
    }
  }

  // Helper methods
  static async getProductsByCategory(category) {
    const products = await this.fetchProducts()
    return products.filter(product => product.category === category)
  }

  static async getLatestProducts(limit = 8) {
    const products = await this.fetchProducts()
    return products.slice(0, limit)
  }

  static async getBestSellingProducts(limit = 8) {
    const products = await this.fetchProducts()
    // Sort by rating count and average rating
    return products
      .sort((a, b) => {
        const aRatingCount = a.rating?.length || 0
        const bRatingCount = b.rating?.length || 0
        if (aRatingCount === bRatingCount) {
          const aAvgRating = a.rating?.reduce((sum, r) => sum + r.rating, 0) / aRatingCount || 0
          const bAvgRating = b.rating?.reduce((sum, r) => sum + r.rating, 0) / bRatingCount || 0
          return bAvgRating - aAvgRating
        }
        return bRatingCount - aRatingCount
      })
      .slice(0, limit)
  }

  static calculateAverageRating(ratings) {
    if (!ratings || ratings.length === 0) return 0
    const sum = ratings.reduce((total, rating) => total + rating.rating, 0)
    return (sum / ratings.length).toFixed(1)
  }

  static formatPrice(price, currency = '₹') {
    return `${currency}${price.toLocaleString()}`
  }
}
