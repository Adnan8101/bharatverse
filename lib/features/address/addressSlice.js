import { createSlice } from '@reduxjs/toolkit'

const addressSlice = createSlice({
    name: 'address',
    initialState: {
        list: [],
        loading: false,
        error: null
    },
    reducers: {
        setAddresses: (state, action) => {
            state.list = action.payload
            state.loading = false
            state.error = null
        },
        addAddress: (state, action) => {
            state.list.unshift(action.payload) // Add new address to the beginning
        },
        setLoading: (state, action) => {
            state.loading = action.payload
        },
        setError: (state, action) => {
            state.error = action.payload
            state.loading = false
        },
        clearAddresses: (state) => {
            state.list = []
            state.loading = false
            state.error = null
        }
    }
})

export const { setAddresses, addAddress, setLoading, setError, clearAddresses } = addressSlice.actions

export default addressSlice.reducer