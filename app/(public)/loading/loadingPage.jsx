'use client'

import Loading from "@/components/Loading"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function LoadingPage() {
    const router = useRouter()

    useEffect(() => {
        // Check if we're in the browser before accessing window.location
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search)
            const url = params.get('nextUrl')

            if (url) {
                setTimeout(() => {
                    router.push(url)
                }, 8000)
            }
        }
    }, [router])

    return <Loading />
}
