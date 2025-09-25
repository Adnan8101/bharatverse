'use client'
import { useRef, useEffect } from 'react'
import { Provider, useDispatch } from 'react-redux'
import { makeStore } from '../lib/store'
import { setProduct } from '../lib/features/product/productSlice'
import { DataService } from '../lib/data-service'
import { useCartPersistence } from '../hooks/useCartPersistence'

function ProductInitializer() {
  const dispatch = useDispatch()

  useEffect(() => {
    const loadProducts = async () => {
      try {
        dispatch({ type: 'product/setLoading', payload: true })
        const products = await DataService.fetchProducts()
        
        if (products && products.length > 0) {
          dispatch(setProduct(products))
        } else {
          // If no products from database, use dummy data as fallback
          console.log('No products found in database, using dummy data')
          dispatch({ type: 'product/useDummyData' })
        }
      } catch (error) {
        console.error('Error loading products:', error)
        // Fallback to dummy data on error
        dispatch({ type: 'product/useDummyData' })
      }
    }

    loadProducts()

    // Set up a product refresh interval to catch newly added products
    const refreshInterval = setInterval(async () => {
      try {
        const products = await DataService.fetchProducts()
        if (products && products.length > 0) {
          dispatch(setProduct(products))
        }
      } catch (error) {
        console.error('Error refreshing products:', error)
      }
    }, 30000) // Refresh every 30 seconds

    // Listen for custom product refresh events
    const handleProductRefresh = () => {
      loadProducts()
    }

    window.addEventListener('refreshProducts', handleProductRefresh)

    return () => {
      clearInterval(refreshInterval)
      window.removeEventListener('refreshProducts', handleProductRefresh)
    }
  }, [dispatch])

  return null
}

function CartPersistenceHandler() {
  useCartPersistence()
  return null
}

export default function StoreProvider({ children }) {
  const storeRef = useRef(undefined)
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore()
  }

  return (
    <Provider store={storeRef.current}>
      <ProductInitializer />
      <CartPersistenceHandler />
      {children}
    </Provider>
  )
}