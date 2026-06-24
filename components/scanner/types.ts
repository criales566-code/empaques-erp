export type ScanStatus = 'idle' | 'scanning' | 'processing' | 'found' | 'not-found' | 'error'

export interface ScanActivity {
  id: string
  code: string
  productName: string | null
  productId: string | null
  status: 'found' | 'not-found'
  timestamp: string
}

export interface ProductResult {
  id: string
  name: string
}

export interface ScannerCameraProps {
  onScanResult: (code: string, product: ProductResult | null) => void
  onStatusChange?: (status: ScanStatus) => void
}
