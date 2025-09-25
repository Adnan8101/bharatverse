'use client'
import Image from "next/image"
import { MapPin, Mail, Phone, Store } from "lucide-react"

const StoreInfo = ({store}) => {
    return (
        <div className="flex-1 space-y-2 text-sm">
            {store.logo ? (
                <Image width={100} height={100} src={store.logo} alt={store.name} className="max-w-20 max-h-20 object-contain shadow rounded-full max-sm:mx-auto" />
            ) : (
                <div className="max-w-20 max-h-20 w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center max-sm:mx-auto">
                    <Store size={24} className="text-gray-500" />
                </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 items-center">
                <h3 className="text-xl font-semibold text-slate-800"> {store.name} </h3>
                <span className="text-sm">@{store.username}</span>

                {/* Status Badge */}
                <span
                    className={`text-xs font-semibold px-4 py-1 rounded-full ${store.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : store.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                        }`}
                >
                    {store.status}
                </span>
            </div>

            <p className="text-slate-600 my-5 max-w-2xl">{store.description}</p>
            <p className="flex items-center gap-2"> <MapPin size={16} /> {store.address}</p>
            <p className="flex items-center gap-2"><Phone size={16} /> {store.contact}</p>
            <p className="flex items-center gap-2"><Mail size={16} />  {store.email}</p>
            <p className="text-slate-700 mt-5">Applied  on <span className="text-xs">{new Date(store.createdAt).toLocaleDateString()}</span> by</p>
            <div className="flex items-center gap-2 text-sm ">
                {store.user?.imageUrl ? (
                    <Image width={36} height={36} src={store.user.imageUrl} alt={store.user.firstName || 'User'} className="w-9 h-9 rounded-full" />
                ) : (
                    <div className="w-9 h-9 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 text-xs font-semibold">
                            {store.user?.firstName?.[0]?.toUpperCase() || 'U'}
                        </span>
                    </div>
                )}
                <div>
                    <p className="text-slate-600 font-medium">{store.user?.firstName} {store.user?.lastName}</p>
                    <p className="text-slate-400">{store.user?.emailAddresses?.[0]?.emailAddress || 'No email'}</p>
                </div>
            </div>
        </div>
    )
}

export default StoreInfo