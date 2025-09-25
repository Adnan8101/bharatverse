'use client'
import Loading from "@/components/Loading"
import UserAvatar from "@/components/UserAvatar"
import { CircleDollarSign, ShoppingBasket, Star, Tags } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function Dashboard() {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

    const router = useRouter()

    const [loading, setLoading] = useState(true)
    const [dashboardData, setDashboardData] = useState({
        totalProducts: 0,
        totalEarnings: 0,
        totalOrders: 0,
        ratings: [],
    })

    const dashboardCardsData = [
        { title: 'Total Products', value: dashboardData.totalProducts, icon: ShoppingBasket },
        { title: 'Total Earnings', value: currency + dashboardData.totalEarnings, icon: CircleDollarSign },
        { title: 'Total Orders', value: dashboardData.totalOrders, icon: Tags },
        { title: 'Total Ratings', value: dashboardData.ratings.length, icon: Star },
    ]

    const fetchDashboardData = async () => {
        try {
            const response = await fetch('/api/store-owner/dashboard', {
                credentials: 'include'
            });
            
            const result = await response.json();
            
            if (result.success) {
                setDashboardData(result.data);
            } else {
                console.error('Failed to fetch dashboard data:', result.message);
                // Fallback to dummy data if needed
                setDashboardData({
                    totalProducts: 0,
                    totalEarnings: 0,
                    totalOrders: 0,
                    ratings: [],
                });
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            // Fallback to dummy data if needed
            setDashboardData({
                totalProducts: 0,
                totalEarnings: 0,
                totalOrders: 0,
                ratings: [],
            });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchDashboardData()
    }, [])

    if (loading) return <Loading />

    return (
        <div className="text-slate-500 mb-28">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Store Dashboard</h1>
                    <p className="text-slate-600 mt-1">Monitor your store performance and manage your business</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => router.push('/store/add-product')}
                        className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-900 transition-colors"
                    >
                        Add Product
                    </button>
                    <button 
                        onClick={() => router.push('/store/orders')}
                        className="border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        View Orders
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {dashboardCardsData.map((card, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600 mb-1">{card.title}</p>
                                <p className="text-2xl font-bold text-slate-800">{card.value}</p>
                            </div>
                            <div className="p-3 bg-slate-100 rounded-lg">
                                <card.icon size={24} className="text-slate-600" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button 
                        onClick={() => router.push('/store/add-product')}
                        className="p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-slate-400 hover:bg-slate-50 transition-colors text-center"
                    >
                        <div className="text-slate-600">
                            <ShoppingBasket size={32} className="mx-auto mb-2" />
                            <p className="font-medium">Add New Product</p>
                            <p className="text-sm text-slate-500">Create and list a new product</p>
                        </div>
                    </button>
                    
                    <button 
                        onClick={() => router.push('/store/manage-product')}
                        className="p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-slate-400 hover:bg-slate-50 transition-colors text-center"
                    >
                        <div className="text-slate-600">
                            <Tags size={32} className="mx-auto mb-2" />
                            <p className="font-medium">Manage Products</p>
                            <p className="text-sm text-slate-500">Edit, update stock, and organize</p>
                        </div>
                    </button>
                    
                    <button 
                        onClick={() => router.push('/store/orders')}
                        className="p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-slate-400 hover:bg-slate-50 transition-colors text-center"
                    >
                        <div className="text-slate-600">
                            <CircleDollarSign size={32} className="mx-auto mb-2" />
                            <p className="font-medium">View Orders</p>
                            <p className="text-sm text-slate-500">Track and manage customer orders</p>
                        </div>
                    </button>
                </div>
            </div>

            {/* Recent Reviews */}
            {dashboardData.ratings.length > 0 && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-slate-800">Recent Customer Reviews</h3>
                        <Star size={20} className="text-yellow-500" fill="currentColor" />
                    </div>
                    
                    <div className="space-y-6">
                        {dashboardData.ratings.slice(0, 5).map((review, index) => (
                            <div key={index} className="flex gap-4 p-4 bg-slate-50 rounded-lg">
                                <UserAvatar 
                                    userId={review.user.id} 
                                    userName={review.user.name} 
                                    size={48} 
                                    className="flex-shrink-0"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <p className="font-medium text-slate-800">{review.user.name}</p>
                                            <p className="text-sm text-slate-500">{new Date(review.createdAt).toDateString()}</p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {Array(5).fill('').map((_, starIndex) => (
                                                <Star 
                                                    key={starIndex} 
                                                    size={16} 
                                                    className={review.rating >= starIndex + 1 ? "text-yellow-500" : "text-slate-300"} 
                                                    fill="currentColor" 
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-slate-700 mb-2">{review.review}</p>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-slate-500">{review.product?.category}</p>
                                            <p className="font-medium text-slate-800">{review.product?.name}</p>
                                        </div>
                                        <button 
                                            onClick={() => router.push(`/product/${review.product.id}`)}
                                            className="text-sm bg-slate-200 text-slate-700 px-3 py-1 rounded-lg hover:bg-slate-300 transition-colors"
                                        >
                                            View Product
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {dashboardData.ratings.length > 5 && (
                        <div className="text-center mt-6">
                            <button className="text-slate-600 hover:text-slate-800 font-medium">
                                View All Reviews ({dashboardData.ratings.length})
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Empty State for Reviews */}
            {dashboardData.ratings.length === 0 && (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center">
                    <Star size={48} className="text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">No Reviews Yet</h3>
                    <p className="text-slate-600">Customer reviews will appear here once you start receiving them.</p>
                </div>
            )}
        </div>
    )
}