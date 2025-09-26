'use client'
import { Star } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { 
    GiPaintBrush, 
    GiIndianPalace, 
    GiFlowerPot, 
    GiClothes,
    GiDiamondRing,
    GiLightBulb,
    GiMeditation,
    GiSofa,
    GiKnifeFork,
    GiGamepad,
    GiHeartNecklace,
    GiLaptop,
    GiBookshelf,
    GiFruitBowl,
    GiCarWheel,
    GiWeight,
    GiFlowerEmblem,
    GiGuitar,
    GiPencil
} from 'react-icons/gi'

const ProductCard = ({ product }) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

    // calculate the average rating of the product
    const rating = product.rating && product.rating.length > 0 
        ? Math.round(product.rating.reduce((acc, curr) => acc + curr.rating, 0) / product.rating.length)
        : 0;

    return (
        <Link href={`/product/${product.id}`} className=' group max-xl:mx-auto'>
            <div className='bg-[#F5F5F5] h-40  sm:w-60 sm:h-68 rounded-lg flex items-center justify-center'>
                {product.images && product.images[0] ? (
                    <Image width={500} height={500} className='max-h-30 sm:max-h-40 w-auto group-hover:scale-115 transition duration-300' src={product.images[0]} alt={product.name || "Artwork"} />
                ) : (
                    <div className='flex items-center justify-center w-full h-full text-5xl text-orange-600'>
                        {/* Category-specific icons */}
                        {product.category === 'painting' && <GiPaintBrush />}
                        {product.category === 'sculpture' && <GiIndianPalace />}
                        {product.category === 'pottery' && <GiFlowerPot />}
                        {product.category === 'textile' && <GiClothes />}
                        {product.category === 'accessories' && <GiHeartNecklace />}
                        {product.category === 'lighting' && <GiLightBulb />}
                        {product.category === 'wellness' && <GiMeditation />}
                        {product.category === 'electronics' && <GiLaptop />}
                        {product.category === 'gaming' && <GiGamepad />}
                        {product.category === 'clothing' && <GiClothes />}
                        {product.category === 'jewelry' && <GiDiamondRing />}
                        {product.category === 'home-decor' && <GiSofa />}
                        {product.category === 'kitchen' && <GiKnifeFork />}
                        {product.category === 'books' && <GiBookshelf />}
                        {product.category === 'sports' && <GiWeight />}
                        {product.category === 'beauty' && <GiFlowerEmblem />}
                        {product.category === 'food-beverages' && <GiFruitBowl />}
                        {product.category === 'automotive' && <GiCarWheel />}
                        {product.category === 'health' && <GiMeditation />}
                        {product.category === 'toys' && <GiGamepad />}
                        {product.category === 'garden' && <GiFlowerEmblem />}
                        {product.category === 'musical-instruments' && <GiGuitar />}
                        {product.category === 'stationery' && <GiPencil />}
                        {/* Default icon if category doesn't match */}
                        {![
                            'painting', 'sculpture', 'pottery', 'textile', 'accessories', 
                            'lighting', 'wellness', 'electronics', 'gaming', 'clothing', 
                            'jewelry', 'home-decor', 'kitchen', 'books', 'sports', 'beauty', 
                            'food-beverages', 'automotive', 'health', 'toys', 'garden', 
                            'musical-instruments', 'stationery'
                        ].includes(product.category) && <GiPaintBrush />}
                    </div>
                )}
            </div>
            <div className='flex justify-between gap-3 text-sm text-slate-800 pt-2 max-w-60'>
                <div>
                    <p>{product.name}</p>
                    <div className='flex'>
                        {Array(5).fill('').map((_, index) => (
                            <Star key={index} size={14} className='text-transparent mt-0.5' fill={rating >= index + 1 ? "#00C950" : "#D1D5DB"} />
                        ))}
                    </div>
                </div>
                <p>{currency}{product.price}</p>
            </div>
        </Link>
    )
}

export default ProductCard