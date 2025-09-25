'use client'
import Link from "next/link"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import DynamicLanguageDropdown from '@/components/DynamicLanguageDropdown'

const AdminNavbar = () => {
    const router = useRouter()

    const handleLogout = async () => {
        try {
            const response = await fetch('/api/admin/logout', {
                method: 'POST',
            });
            
            if (response.ok) {
                router.push('/');
            }
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }

    return (
        <div className="flex items-center justify-between px-12 py-3 border-b border-slate-200 transition-all">
            <Link href="/" className="relative text-4xl font-semibold text-slate-700">
                <span className="text-green-600">go</span>cart<span className="text-green-600 text-5xl leading-0">.</span>
                <p className="absolute text-xs font-semibold -top-1 -right-13 px-3 p-0.5 rounded-full flex items-center gap-2 text-white bg-green-500">
                    Admin
                </p>
            </Link>
            <div className="flex items-center gap-3">
                <DynamicLanguageDropdown variant="admin" />
                <p>Hi, Admin</p>
                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                    <LogOut size={16} />
                    Logout
                </button>
            </div>
        </div>
    )
}

export default AdminNavbar