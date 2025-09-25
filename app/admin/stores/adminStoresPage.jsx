'use client'
import StoreInfo from "@/components/admin/StoreInfo"
import Loading from "@/components/Loading"
import { useEffect, useState } from "react"
import { Eye } from "lucide-react"
import toast from "react-hot-toast"

export default function AdminStores() {
    const [stores, setStores] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all') // all, pending, approved, rejected

    const fetchStores = async () => {
        try {
            const response = await fetch('/api/stores')
            const data = await response.json()
            
            if (data.success) {
                setStores(data.data)
            } else {
                throw new Error(data.error || 'Failed to fetch stores')
            }
        } catch (error) {
            console.error('Error fetching stores:', error)
            toast.error('Failed to load stores')
            setStores([])
        } finally {
            setLoading(false)
        }
    }

    const handleStatusChange = async (storeId, newStatus) => {
        try {
            const response = await fetch('/api/stores/approve', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    storeId,
                    status: newStatus
                })
            })

            const data = await response.json()

            if (!data.success) {
                throw new Error(data.error || 'Failed to update store status')
            }

            // Update the store in the list
            setStores(prevStores => 
                prevStores.map(store => 
                    store.id === storeId 
                        ? { ...store, status: newStatus }
                        : store
                )
            )
            
            toast.success(data.message)

        } catch (error) {
            console.error('Error updating store status:', error)
            toast.error(error.message)
        }
    }

    const filteredStores = stores.filter(store => {
        if (filter === 'all') return true
        return store.status === filter
    })

    useEffect(() => {
        fetchStores()
    }, [])

    if (loading) return <Loading />

    return (
        <div className="text-slate-500 mb-28">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h1 className="text-2xl">Manage <span className="text-slate-800 font-medium">Stores</span></h1>
                
                {/* Filter buttons */}
                <div className="flex gap-2 flex-wrap">
                    {['all', 'pending', 'approved', 'rejected'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                filter === status
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                            <span className="ml-1 text-xs">
                                ({status === 'all' ? stores.length : stores.filter(s => s.status === status).length})
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {filteredStores.length ? (
                <div className="flex flex-col gap-4">
                    {filteredStores.map((store) => (
                        <div key={store.id} className="bg-white border rounded-lg shadow-sm p-6 flex max-md:flex-col gap-4 md:items-end max-w-full">
                            {/* Store Info */}
                            <StoreInfo store={store} />

                            {/* Actions */}
                            <div className="flex gap-2 pt-2 flex-wrap">
                                {store.status === 'pending' && (
                                    <>
                                        <button 
                                            onClick={() => handleStatusChange(store.id, 'approved')}
                                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                                        >
                                            Approve
                                        </button>
                                        <button 
                                            onClick={() => handleStatusChange(store.id, 'rejected')}
                                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                                        >
                                            Reject
                                        </button>
                                    </>
                                )}
                                
                                {store.status === 'approved' && (
                                    <button 
                                        onClick={() => handleStatusChange(store.id, 'rejected')}
                                        className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm"
                                    >
                                        Suspend
                                    </button>
                                )}
                                
                                {store.status === 'rejected' && (
                                    <button 
                                        onClick={() => handleStatusChange(store.id, 'approved')}
                                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                                    >
                                        Re-approve
                                    </button>
                                )}

                                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm flex items-center gap-2">
                                    <Eye size={16} />
                                    View Products
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No stores found for the selected filter.</p>
                </div>
            )}
        </div>
    )
}
