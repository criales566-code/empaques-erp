'use client'

import dynamic from 'next/dynamic'
import type { ScannerCameraProps } from './types'

const BarcodeScanner = dynamic<ScannerCameraProps>(
  () => import('./BarcodeScannerInner'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-64 rounded-2xl border border-slate-200 bg-slate-50">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    ),
  }
)

export default function BarcodeScannerWrapper(props: ScannerCameraProps) {
  return <BarcodeScanner {...props} />
}
