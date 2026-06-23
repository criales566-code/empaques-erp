import BarcodeScannerWrapper from '@/components/scanner/BarcodeScanner'

export default function ScannerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Escáner de códigos</h1>
        <p className="text-slate-400 text-sm mt-1">Escanea un código de barras para buscar o crear productos</p>
      </div>
      <BarcodeScannerWrapper />
    </div>
  )
}
