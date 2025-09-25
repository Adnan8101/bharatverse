'use client'
import { assets } from "@/assets/assets"
import { useEffect, useState } from "react"
import Image from "next/image"
import toast from "react-hot-toast"
import Loading from "@/components/Loading"

export default function CreateStore() {

    const [alreadySubmitted, setAlreadySubmitted] = useState(false)
    const [status, setStatus] = useState("")
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState("")

    const [storeInfo, setStoreInfo] = useState({
        name: "",
        username: "",
        description: "",
        email: "",
        contact: "",
        address: "",
        password: "",
        image: ""
    })

    const onChangeHandler = (e) => {
        setStoreInfo({ ...storeInfo, [e.target.name]: e.target.value })
    }

    const fetchSellerStatus = async () => {
        try {
            const response = await fetch('/api/stores/status')
            const data = await response.json()
            
            if (data.success && data.hasStore) {
                setAlreadySubmitted(true)
                setStatus(data.data.status)
                
                switch(data.data.status) {
                    case 'pending':
                        setMessage('Your store request is under review. We will notify you once it\'s approved.')
                        break
                    case 'approved':
                        setMessage('Congratulations! Your store has been approved. You can now start selling.')
                        // Redirect to store dashboard after 5 seconds
                        setTimeout(() => {
                            window.location.href = '/store'
                        }, 5000)
                        break
                    case 'rejected':
                        setMessage('Sorry, your store request was rejected. Please contact support for more information.')
                        break
                    default:
                        setMessage('Your store request status is unknown. Please contact support.')
                }
            }
        } catch (error) {
            console.error('Error fetching seller status:', error)
            toast.error('Failed to check store status')
        } finally {
            setLoading(false)
        }
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault()
        
        // Validate required fields
        if (!storeInfo.name || !storeInfo.username || !storeInfo.email || !storeInfo.contact || !storeInfo.description || !storeInfo.address || !storeInfo.password) {
            throw new Error('Please fill in all required fields')
        }

        try {
            const formData = new FormData()
            formData.append('name', storeInfo.name)
            formData.append('username', storeInfo.username)
            formData.append('description', storeInfo.description)
            formData.append('email', storeInfo.email)
            formData.append('contact', storeInfo.contact)
            formData.append('address', storeInfo.address)
            formData.append('password', storeInfo.password)
            
            // Only append image if a file was actually selected
            if (storeInfo.image && storeInfo.image instanceof File) {
                formData.append('image', storeInfo.image)
            }

            const response = await fetch('/api/stores', {
                method: 'POST',
                body: formData
            })

            const data = await response.json()

            if (!data.success) {
                throw new Error(data.error || 'Failed to submit store request')
            }

            // Success - refresh the page to show the status
            setAlreadySubmitted(true)
            setStatus('pending')
            setMessage('Your store request has been submitted successfully! We will review it and notify you once it\'s approved.')
            
            return data.message

        } catch (error) {
            console.error('Error submitting store:', error)
            throw error
        }
    }

    useEffect(() => {
        // Only fetch seller status if we're in a context where user might be authenticated
        // For anonymous users, this will just return hasStore: false
        fetchSellerStatus()
    }, [])

    return !loading ? (
        <>
            {!alreadySubmitted ? (
                <div className="mx-6 min-h-[70vh] my-16">
                    <form onSubmit={e => toast.promise(onSubmitHandler(e), { loading: "Submitting data..." })} className="max-w-7xl mx-auto flex flex-col items-start gap-3 text-slate-500">
                        {/* Title */}
                        <div>
                            <h1 className="text-3xl ">Add Your <span className="text-slate-800 font-medium">Store</span></h1>
                            <p className="max-w-lg">To become a seller on BharatVerse, submit your store details for review. Your store will be activated after admin verification.</p>
                        </div>

                        <label className="mt-10 cursor-pointer">
                            Store Logo
                            <Image src={storeInfo.image ? URL.createObjectURL(storeInfo.image) : assets.upload_area} className="rounded-lg mt-2 h-16 w-auto" alt="" width={150} height={100} />
                            <input type="file" accept="image/*" onChange={(e) => setStoreInfo({ ...storeInfo, image: e.target.files[0] })} hidden />
                        </label>

                        <p>Username</p>
                        <input name="username" onChange={onChangeHandler} value={storeInfo.username} type="text" placeholder="Enter your store username" className="border border-slate-300 outline-slate-400 w-full max-w-lg p-2 rounded" />

                        <p>Name</p>
                        <input name="name" onChange={onChangeHandler} value={storeInfo.name} type="text" placeholder="Enter your store name" className="border border-slate-300 outline-slate-400 w-full max-w-lg p-2 rounded" />

                        <p>Description</p>
                        <textarea name="description" onChange={onChangeHandler} value={storeInfo.description} rows={5} placeholder="Enter your store description" className="border border-slate-300 outline-slate-400 w-full max-w-lg p-2 rounded resize-none" />

                        <p>Email</p>
                        <input name="email" onChange={onChangeHandler} value={storeInfo.email} type="email" placeholder="Enter your store email" className="border border-slate-300 outline-slate-400 w-full max-w-lg p-2 rounded" />

                        <p>Contact Number</p>
                        <input name="contact" onChange={onChangeHandler} value={storeInfo.contact} type="text" placeholder="Enter your store contact number" className="border border-slate-300 outline-slate-400 w-full max-w-lg p-2 rounded" />

                        <p>Address</p>
                        <textarea name="address" onChange={onChangeHandler} value={storeInfo.address} rows={5} placeholder="Enter your store address" className="border border-slate-300 outline-slate-400 w-full max-w-lg p-2 rounded resize-none" />

                        <p>Password</p>
                        <input name="password" onChange={onChangeHandler} value={storeInfo.password} type="password" placeholder="Enter a password for store owner login" className="border border-slate-300 outline-slate-400 w-full max-w-lg p-2 rounded" />

                        <button className="bg-slate-800 text-white px-12 py-2 rounded mt-10 mb-40 active:scale-95 hover:bg-slate-900 transition ">Submit</button>
                    </form>
                </div>
            ) : (
                <div className="min-h-[80vh] flex flex-col items-center justify-center">
                    <p className="sm:text-2xl lg:text-3xl mx-5 font-semibold text-slate-500 text-center max-w-2xl">{message}</p>
                    {status === "approved" && <p className="mt-5 text-slate-400">redirecting to dashboard in <span className="font-semibold">5 seconds</span></p>}
                </div>
            )}
        </>
    ) : (<Loading />)
}