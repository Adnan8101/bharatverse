import { Suspense } from 'react'
import ProductStatusPage from './productStatusPage'
import Loading from '@/components/Loading'

export const metadata = {
  title: 'Product Status | BharatVerse Store',
  description: 'Track the approval status of all your products',
}

export default function ProductStatus() {
  return (
    <Suspense fallback={<Loading />}>
      <ProductStatusPage />
    </Suspense>
  )
}
