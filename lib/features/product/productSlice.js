import { createSlice } from '@reduxjs/toolkit'
import { productDummyData } from '@/assets/assets'

const productSlice = createSlice({
    name: 'product',
    initialState: {
        list: [], // Start with empty array, will be populated from database
        isLoading: false,
        error: null
    },
    reducers: {
        setProduct: (state, action) => {
            // Ensure products have rating arrays, default to empty if missing
            const products = action.payload.map(product => ({
                ...product,
                rating: product.rating || []
            }))
            state.list = products
            state.isLoading = false
            state.error = null
        },
        addProduct: (state, action) => {
            // Add a single product to the list
            const newProduct = {
                ...action.payload,
                rating: action.payload.rating || []
            }
            // Check if product already exists, if so update it, otherwise add it
            const existingIndex = state.list.findIndex(p => p.id === newProduct.id)
            if (existingIndex >= 0) {
                state.list[existingIndex] = newProduct
            } else {
                state.list.unshift(newProduct) // Add to beginning of list
            }
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload
        },
        setError: (state, action) => {
            state.error = action.payload
            state.isLoading = false
        },
        clearProduct: (state) => {
            state.list = []
            state.isLoading = false
            state.error = null
        },
        // Fallback to dummy data if needed
        useDummyData: (state) => {
            state.list = productDummyData
            state.isLoading = false
            state.error = null
        }
    }
})

export const { setProduct, addProduct, setLoading, setError, clearProduct, useDummyData } = productSlice.actions

export default productSlice.reducer