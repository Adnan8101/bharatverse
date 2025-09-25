'use client'
import React, { useState, useEffect } from 'react'
import Title from './Title'
import ProductCard from './ProductCard'
import { DataService } from '@/lib/data-service'

const BestSelling = () => {
    const displayQuantity = 8
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const bestSellingProducts = await DataService.getBestSellingProducts(displayQuantity)
                setProducts(bestSellingProducts)
            } catch (error) {
                console.error('Error fetching best selling products:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchProducts()
    }, [])

    if (loading) {
        return (
            <div className='px-6 my-30 max-w-6xl mx-auto'>
                <Title title='Best of Indian Art' description='Loading best art pieces from artisans...' />
                <div className='mt-12 grid grid-cols-2 sm:flex flex-wrap gap-6 xl:gap-12'>
                    {Array.from({ length: displayQuantity }).map((_, index) => (
                        <div key={index} className='bg-gray-200 animate-pulse rounded-lg h-80 w-64'></div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className='px-6 my-30 max-w-6xl mx-auto'>
            <Title title='Best of Indian Art' description={`Explore ${products.length} top-selling traditional artworks`} href='/shop' />
            <div className='mt-12 grid grid-cols-2 sm:flex flex-wrap gap-6 xl:gap-12'>
                {products.map((product, index) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    )
}

export default BestSelling