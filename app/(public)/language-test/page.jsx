'use client'
import DynamicLanguageDemo from '@/components/DynamicLanguageDemo'
import Navbar from '@/components/Navbar'

export default function LanguageTestPage() {
    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <DynamicLanguageDemo />
            </div>
        </div>
    )
}
