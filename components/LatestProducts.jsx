'use client'
import React, { useState, useEffect } from 'react'
import Title from './Title'
import ProductCard from './ProductCard'
import { DataService } from '@/lib/data-service'

const LatestProducts = () => {
    const displayQuantity = 4
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const latestProducts = await DataService.getLatestProducts(displayQuantity)
                setProducts(latestProducts)
            } catch (error) {
                console.error('Error fetching latest products:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchProducts()
    }, [])

    if (loading) {
        return (
            <div className='px-6 my-30 max-w-6xl mx-auto'>
                <Title title='Latest Products' description='Loading latest products...' />
                <div className='mt-12 grid grid-cols-2 sm:flex flex-wrap gap-6 justify-between'>
                    {Array.from({ length: displayQuantity }).map((_, index) => (
                        <div key={index} className='bg-gray-200 animate-pulse rounded-lg h-80 w-64'></div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className='px-6 my-30 max-w-6xl mx-auto'>
            <Title title='Latest Products' description={`Showing ${products.length} latest products`} href='/shop' />
            <div className='mt-12 grid grid-cols-2 sm:flex flex-wrap gap-6 justify-between'>
                {products.map((product, index) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    )
}

export default LatestProducts