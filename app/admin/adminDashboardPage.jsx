'use client'
import { dummyAdminDashboardData } from "@/assets/assets"
import Loading from "@/components/Loading"
import OrdersAreaChart from "@/components/OrdersAreaChart"
import { CircleDollarSign, ShoppingBasket, Store, Tags } from "lucide-react"
import { useEffect, useState } from "react"

export default function AdminDashboard() {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

    const [loading, setLoading] = useState(true)
    const [dashboardData, setDashboardData] = useState({
        products: 0,
        revenue: 0,
        orders: 0,
        stores: 0,
        allOrders: [],
    })

    const dashboardCardsData = [
        { title: 'Total Products', value: dashboardData.products, icon: ShoppingBasket },
        { title: 'Total Revenue', value: currency + dashboardData.revenue, icon: CircleDollarSign },
        { title: 'Total Orders', value: dashboardData.orders, icon: Tags },
        { title: 'Total Stores', value: dashboardData.stores, icon: Store },
    ]

    const fetchDashboardData = async () => {
        try {
            // Fetch stores data
            const storesResponse = await fetch('/api/stores')
            const storesData = await storesResponse.json()
            
            let totalStores = 0
            let totalProducts = 0
            
            if (storesData.success) {
                totalStores = storesData.data.length
                // Count total products from all stores
                totalProducts = storesData.data.reduce((sum, store) => {
                    return sum + (store.Product?.length || 0)
                }, 0)
            }

            setDashboardData({
                products: totalProducts,
                revenue: 0, // You can add revenue calculation later
                orders: 0, // You can add orders calculation later
                stores: totalStores,
                allOrders: [], // You can add orders data later
            })
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
            // Fallback to dummy data
            setDashboardData(dummyAdminDashboardData)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDashboardData()
    }, [])

    if (loading) return <Loading />

    return (
        <div className="text-slate-500">
            <h1 className="text-2xl">Admin <span className="text-slate-800 font-medium">Dashboard</span></h1>

            {/* Cards */}
            <div className="flex flex-wrap gap-5 my-10 mt-4">
                {
                    dashboardCardsData.map((card, index) => (
                        <div key={index} className="flex items-center gap-10 border border-slate-200 p-3 px-6 rounded-lg">
                            <div className="flex flex-col gap-3 text-xs">
                                <p>{card.title}</p>
                                <b className="text-2xl font-medium text-slate-700">{card.value}</b>
                            </div>
                            <card.icon size={50} className=" w-11 h-11 p-2.5 text-slate-400 bg-slate-100 rounded-full" />
                        </div>
                    ))
                }
            </div>

            {/* Area Chart */}
            <OrdersAreaChart allOrders={dashboardData.allOrders} />
        </div>
    )
}