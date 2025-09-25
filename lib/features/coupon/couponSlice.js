import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    couponCode: '',
    couponDiscount: 0,
    appliedCoupon: null,
    isApplied: false,
    applicableItems: [],
    applicableAmount: 0
}

export const couponSlice = createSlice({
    name: 'coupon',
    initialState,
    reducers: {
        applyCoupon: (state, action) => {
            const { coupon, discount, code, applicableItems, applicableAmount } = action.payload
            state.couponCode = code
            state.couponDiscount = discount
            state.appliedCoupon = coupon
            state.applicableItems = applicableItems || []
            state.applicableAmount = applicableAmount || 0
            state.isApplied = true
        },
        removeCoupon: (state) => {
            state.couponCode = ''
            state.couponDiscount = 0
            state.appliedCoupon = null
            state.applicableItems = []
            state.applicableAmount = 0
            state.isApplied = false
        },
        clearCoupon: (state) => {
            return initialState
        },
        restoreCoupon: (state, action) => {
            const { couponCode, couponDiscount, appliedCoupon, isApplied, applicableItems, applicableAmount } = action.payload
            state.couponCode = couponCode || ''
            state.couponDiscount = couponDiscount || 0
            state.appliedCoupon = appliedCoupon || null
            state.isApplied = isApplied || false
            state.applicableItems = applicableItems || []
            state.applicableAmount = applicableAmount || 0
        }
    }
})

export const { applyCoupon, removeCoupon, clearCoupon, restoreCoupon } = couponSlice.actions
export default couponSlice.reducer
