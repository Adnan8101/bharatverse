'use client'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setProduct } from '@/lib/features/product/productSlice'
import { DataService } from '@/lib/data-service'

export const useInitializeProducts = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const products = await DataService.fetchProducts()
        dispatch(setProduct(products))
      } catch (error) {
        console.error('Error loading products:', error)
      }
    }

    loadProducts()
  }, [dispatch])
}
