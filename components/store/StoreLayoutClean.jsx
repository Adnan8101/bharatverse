'use client'
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import * as LucideReact from "lucide-react"
import StoreNavbar from "./StoreNavbar"
import StoreSidebar from "./StoreSidebar"

const { ArrowRight } = LucideReact

const StoreLayout = ({ children }) => {
    const [isSeller, setIsSeller] = useState(false)
    const [loading, setLoading] = useState(true)
    const [storeInfo, setStoreInfo] = useState(null)
    const router = useRouter()

    const fetchSellerInfo = async () => {
        try {
            const response = await fetch('/api/store-owner/verify', {
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if (data.success && data.store.status === 'approved') {
                setIsSeller(true);
                setStoreInfo(data.store);
            } else if (data.success && data.store.status === 'pending') {
                // Redirect to login page which will show pending modal
                router.push('/store-owner-login');
            } else if (data.success && (data.store.status === 'rejected' || data.store.status === 'suspended')) {
                // Show suspended/rejected page with chat option
                setIsSeller(false);
                setStoreInfo(data.store);
            } else {
                setIsSeller(false);
            }
        } catch (error) {
            console.error('Auth check error:', error);
            setIsSeller(false);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchSellerInfo()
    }, [])

    return loading ? (
        <div className='flex items-center justify-center h-screen bg-slate-50'>
            <div className='flex flex-col items-center gap-4'>
                <div className='w-12 h-12 rounded-full border-4 border-slate-200 border-t-green-500 animate-spin'></div>
                <p className='text-slate-600 font-medium'>Loading Store Dashboard...</p>
            </div>
        </div>
    ) : isSeller ? (
        <div className="flex flex-col h-screen bg-slate-50">
            <StoreNavbar storeInfo={storeInfo} />
            <div className="flex h-full">
                <StoreSidebar storeInfo={storeInfo} />
                <div className="flex-1 overflow-auto bg-slate-50">
                    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    ) : (
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
            {storeInfo && (storeInfo.status === 'rejected' || storeInfo.status === 'suspended') ? (
                <>
                    <div className="max-w-md mx-auto bg-red-50 border border-red-200 rounded-2xl p-8 mb-8">
                        <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 15.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-semibold text-red-800 mb-3">
                            Store {storeInfo.status === 'suspended' ? 'Suspended' : 'Application Rejected'}
                        </h1>
                        <p className="text-red-700 mb-6">
                            {storeInfo.status === 'suspended' 
                                ? 'Your store has been temporarily suspended. Please contact admin for assistance and clarification.'
                                : 'Your store application has been rejected. Please contact admin to understand the reasons and next steps.'
                            }
                        </p>
                        
                        {/* Chat with Admin Button */}
                        <Link 
                            href="/store/live-chat" 
                            className="w-full bg-red-600 text-white flex items-center justify-center gap-2 p-3 px-6 rounded-full hover:bg-red-700 transition-colors mb-4"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.126-.979L3 20l1.979-5.874A8.955 8.955 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                            </svg>
                            Chat with Admin
                        </Link>
                        
                        <p className="text-sm text-red-600">
                            Use the chat to discuss your store status with our admin team.
                        </p>
                    </div>
                </>
            ) : (
                <>
                    <h1 className="text-2xl sm:text-4xl font-semibold text-slate-400">You are not authorized to access this page</h1>
                    <p className="text-slate-500 mt-4">Please log in as a store owner to access the store dashboard.</p>
                </>
            )}
            
            <div className="flex gap-4 mt-8">
                <Link href="/store-owner-login" className="bg-blue-600 text-white flex items-center gap-2 p-2 px-6 max-sm:text-sm rounded-full hover:bg-blue-700">
                    Store Owner Login <ArrowRight size={18} />
                </Link>
                <Link href="/" className="bg-slate-700 text-white flex items-center gap-2 p-2 px-6 max-sm:text-sm rounded-full hover:bg-slate-800">
                    Go to home <ArrowRight size={18} />
                </Link>
            </div>
        </div>
    )
}

export default StoreLayout
