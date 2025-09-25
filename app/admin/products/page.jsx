import AdminProtection from '@/components/admin/AdminProtection'
import AdminProductApproval from './productApprovalPage'

export default function AdminProductApprovalPage() {
  return (
    <AdminProtection>
      <AdminProductApproval />
    </AdminProtection>
  )
}
