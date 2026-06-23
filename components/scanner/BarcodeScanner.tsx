'use client'

import dynamic from 'next/dynamic'

const BarcodeScanner = dynamic(
  () => import('./BarcodeScannerInner'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    ),
  }
)

export default function BarcodeScannerWrapper() {
  return <BarcodeScanner />
}
