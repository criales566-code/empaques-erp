import BarcodeScannerWrapper from '@/components/scanner/BarcodeScanner'
import { PageHeader } from '@/components/ui/page-header'

export default function ScannerPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Escáner de códigos"
        description="Escanea un código de barras para buscar o crear productos"
      />
      <BarcodeScannerWrapper />
    </div>
  )
}
