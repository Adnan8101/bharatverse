'use client'
import ProductDescription from "@/components/ProductDescription";
import ProductDetails from "@/components/ProductDetails";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { DataService } from "@/lib/data-service";

export default function Product() {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const productData = await DataService.fetchProduct(productId);
                setProduct(productData);
            } catch (error) {
                console.error('Error fetching product:', error);
            } finally {
                setLoading(false);
            }
        }

        if (productId) {
            fetchProduct();
        }
        
        scrollTo(0, 0);
    }, [productId]);

    if (loading) {
        return (
            <div className="mx-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-gray-600 text-sm mt-8 mb-5">Loading...</div>
                    <div className="animate-pulse">
                        <div className="bg-gray-200 h-96 w-full rounded-lg mb-8"></div>
                        <div className="bg-gray-200 h-64 w-full rounded-lg"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="mx-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center py-20">
                        <h1 className="text-2xl text-gray-500">Product not found</h1>
                        <a href="/shop" className="text-blue-500 hover:underline mt-4 inline-block">
                            Back to Shop
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-6">
            <div className="max-w-7xl mx-auto">
                {/* Breadcrums */}
                <div className="text-gray-600 text-sm mt-8 mb-5">
                    Home / Products / {product?.category}
                </div>

                {/* Product Details */}
                <ProductDetails product={product} />

                {/* Description & Reviews */}
                <ProductDescription product={product} />
            </div>
        </div>
    );
}