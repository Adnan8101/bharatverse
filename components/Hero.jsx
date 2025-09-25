'use client'
import { assets } from '@/assets/assets'
import { ArrowRight, ChevronRight } from 'lucide-react'
import { GiPaintBrush, GiIndianPalace, GiFlowerPot } from 'react-icons/gi'
import { FaPalette, FaHandHoldingHeart } from 'react-icons/fa'
import Image from 'next/image'
import React from 'react'
import { useRouter } from 'next/navigation'
import CategoriesMarquee from './CategoriesMarquee'

const Hero = () => {
    const router = useRouter()
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

    return (
        <div className='mx-6'>
            <div className='flex max-xl:flex-col gap-8 max-w-7xl mx-auto my-10'>
                <div className='relative flex-1 flex flex-col bg-green-200 rounded-3xl xl:min-h-100 group cursor-pointer hover:scale-[1.02] transition-transform' onClick={() => router.push('/shipping-offers')}>
                    <div className='p-5 sm:p-16'>
                        <div className='inline-flex items-center gap-3 bg-green-300 text-green-600 pr-4 p-1 rounded-full text-xs sm:text-sm'>
                            <span className='bg-green-600 px-3 py-1 max-sm:ml-1 rounded-full text-white text-xs'>NEWS</span> Free Shipping on Orders Above ₹2500! <ChevronRight className='group-hover:ml-2 transition-all' size={16} />
                        </div>
                        <h2 className='text-3xl sm:text-5xl leading-[1.2] my-3 font-medium bg-gradient-to-r from-slate-600 to-[#A0FF74] bg-clip-text text-transparent max-w-xs  sm:max-w-md'>
                            Indian art treasures. Culture you'll cherish.
                        </h2>
                        <div className='text-slate-800 text-sm font-medium mt-4 sm:mt-8'>
                            <p>Starts from</p>
                            <p className='text-3xl'>₹399</p>
                        </div>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                router.push('/art-collections');
                            }}
                            className='bg-slate-800 text-white text-sm py-2.5 px-7 sm:py-5 sm:px-12 mt-4 sm:mt-10 rounded-md hover:bg-slate-900 hover:scale-103 active:scale-95 transition'
                        >
                            EXPLORE ART
                        </button>
                    </div>
                    <Image className='sm:absolute bottom-0 right-0 md:right-10 w-full sm:max-w-sm' src={assets.hero_model_img} alt="Artistic model" width={400} height={400} />
                </div>
                <div className='flex flex-col md:flex-row xl:flex-col gap-5 w-full xl:max-w-sm text-sm text-slate-600'>
                    <div className='flex-1 flex items-center justify-between w-full bg-orange-200 rounded-3xl p-6 px-8 group cursor-pointer hover:scale-[1.02] transition-transform' onClick={() => router.push('/traditional-art')}>
                        <div>
                            <p className='text-3xl font-medium bg-gradient-to-r from-slate-800 to-[#FFAD51] bg-clip-text text-transparent max-w-40'>Traditional Art</p>
                            <p className='flex items-center gap-1 mt-4'>View more <ArrowRight className='group-hover:ml-2 transition-all' size={18} /> </p>
                        </div>
                        <div className='flex items-center justify-center w-35 h-35'>
                            <GiPaintBrush className='text-6xl text-orange-600' />
                        </div>
                    </div>
                    <div className='flex-1 flex items-center justify-between w-full bg-blue-200 rounded-3xl p-6 px-8 group cursor-pointer hover:scale-[1.02] transition-transform' onClick={() => router.push('/handcrafted')}>
                        <div>
                            <p className='text-3xl font-medium bg-gradient-to-r from-slate-800 to-[#78B2FF] bg-clip-text text-transparent max-w-40'>Handcrafted</p>
                            <p className='flex items-center gap-1 mt-4'>View more <ArrowRight className='group-hover:ml-2 transition-all' size={18} /> </p>
                        </div>
                        <div className='flex items-center justify-center w-35 h-35'>
                            <FaHandHoldingHeart className='text-6xl text-blue-600' />
                        </div>
                    </div>
                </div>
            </div>
            <CategoriesMarquee />
        </div>

    )
}

export default Hero