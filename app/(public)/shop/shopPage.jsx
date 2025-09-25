'use client'
import { Suspense, useState, useEffect } from "react"
import ProductCard from "@/components/ProductCard"
import { MoveLeft } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { DataService } from "@/lib/data-service"

function ShopContent() {
    // get query params ?search=abc or ?visual_search=xyz
    const searchParams = useSearchParams()
    const search = searchParams.get('search')
    const visualSearch = searchParams.get('visual_search')
    const router = useRouter()

    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true)
                setError(null)
                console.log('Fetching products...')
                const allProducts = await DataService.fetchProducts()
                console.log('Fetched products:', allProducts.length, 'products')
                setProducts(allProducts)
            } catch (error) {
                console.error('Error fetching products:', error)
                setError(error.message)
            } finally {
                setLoading(false)
            }
        }

        fetchProducts()
    }, [])

    const searchTerm = search || visualSearch;
    const filteredProducts = searchTerm
        ? products.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.category?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : products;

    if (loading) {
        return (
            <div className="min-h-[70vh] mx-6">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-2xl text-slate-500 my-6">Loading Products...</h1>
                    <div className="grid grid-cols-2 sm:flex flex-wrap gap-6 xl:gap-12 mx-auto mb-32">
                        {Array.from({ length: 12 }).map((_, index) => (
                            <div key={index} className='bg-gray-200 animate-pulse rounded-lg h-80 w-64'></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-[70vh] mx-6">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-2xl text-red-500 my-6">Error Loading Products</h1>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Retry
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-[70vh] mx-6">
            <div className=" max-w-7xl mx-auto">
                <h1 onClick={() => router.push('/shop')} className="text-2xl text-slate-500 my-6 flex items-center gap-2 cursor-pointer"> 
                    {searchTerm && <MoveLeft size={20} />}  
                    All <span className="text-slate-700 font-medium">Products</span>
                    {searchTerm && <span className="text-sm text-gray-500 ml-2">({filteredProducts.length} found for "{searchTerm}"{visualSearch ? ' (visual search)' : ''})</span>}
                </h1>
                <div className="grid grid-cols-2 sm:flex flex-wrap gap-6 xl:gap-12 mx-auto mb-32">
                    {filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
                </div>
                {filteredProducts.length === 0 && !loading && (
                    <div className="text-center py-20">
                        <h2 className="text-xl text-gray-500">No products found</h2>
                        {searchTerm && (
                            <button 
                                onClick={() => router.push('/shop')}
                                className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                            >
                                View All Products
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}


export default function Shop() {
  return (
    <Suspense fallback={<div>Loading shop...</div>}>
      <ShopContent />
    </Suspense>
  );
}