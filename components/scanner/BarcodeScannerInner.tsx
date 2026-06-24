'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { NotFoundException } from '@zxing/library'
import { getProductByBarcode } from '@/lib/actions/products'
import { Button } from '@/components/ui/button'
import { Camera, CameraOff, RefreshCw, CheckCircle, AlertCircle, ScanBarcode, FlipHorizontal } from 'lucide-react'
import { toast } from 'sonner'

type ScanState = 'idle' | 'scanning' | 'found' | 'not-found' | 'error'

export default function BarcodeScannerInner() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [scanState, setScanState] = useState<ScanState>('idle')
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDevice, setSelectedDevice] = useState<string>('')
  const [scannedCode, setScannedCode] = useState<string>('')
  const [isActive, setIsActive] = useState(false)
  const lastResultRef = useRef<string>('')

  useEffect(() => {
    async function loadDevices() {
      try {
        const allDevices = await BrowserMultiFormatReader.listVideoInputDevices()
        setDevices(allDevices)
        const backCamera = allDevices.find(d =>
          d.label.toLowerCase().includes('back') ||
          d.label.toLowerCase().includes('environment') ||
          d.label.toLowerCase().includes('rear')
        )
        const defaultDevice = backCamera || allDevices[0]
        if (defaultDevice) setSelectedDevice(defaultDevice.deviceId)
      } catch {
        setScanState('error')
      }
    }
    loadDevices()
  }, [])

  const stopScanning = useCallback(() => {
    try { BrowserMultiFormatReader.releaseAllStreams() } catch {}
    setIsActive(false)
  }, [])

  useEffect(() => () => { stopScanning() }, [stopScanning])

  async function startScanning() {
    if (!videoRef.current || !selectedDevice) {
      toast.error('No se detectó cámara disponible')
      return
    }
    setScanState('scanning')
    setIsActive(true)
    lastResultRef.current = ''

    try {
      const reader = new BrowserMultiFormatReader()
      await reader.decodeFromVideoDevice(
        selectedDevice,
        videoRef.current,
        async (result, err) => {
          if (result) {
            const code = result.getText()
            if (code === lastResultRef.current) return
            lastResultRef.current = code
            setScannedCode(code)
            stopScanning()

            try {
              const product = await getProductByBarcode(code)
              if (product) {
                setScanState('found')
                toast.success(`Producto encontrado: ${product.name}`)
                setTimeout(() => router.push(`/inventory/${product.id}`), 1500)
              } else {
                setScanState('not-found')
                toast.info('Producto no encontrado. Abriendo formulario de creación...')
                setTimeout(() => router.push(`/inventory/new?barcode=${encodeURIComponent(code)}`), 1500)
              }
            } catch {
              setScanState('error')
              toast.error('Error al buscar el producto en el sistema')
            }
          }
          if (err && !(err instanceof NotFoundException)) {
            // NotFoundException is normal (no barcode in frame), ignore
          }
        }
      )
    } catch (err: unknown) {
      setScanState('error')
      setIsActive(false)
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('Permission') || msg.includes('NotAllowed')) {
        toast.error('Permiso de cámara denegado. Habilítalo en la configuración del navegador.')
      } else {
        toast.error('Error al iniciar la cámara. Verifica que uses HTTPS.')
      }
    }
  }

  function reset() {
    stopScanning()
    setScanState('idle')
    setScannedCode('')
    lastResultRef.current = ''
  }

  function switchCamera() {
    const currentIdx = devices.findIndex(d => d.deviceId === selectedDevice)
    const nextIdx = (currentIdx + 1) % devices.length
    setSelectedDevice(devices[nextIdx].deviceId)
    if (isActive) {
      stopScanning()
      setTimeout(startScanning, 300)
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      {/* Camera viewfinder */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 aspect-[4/3]">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
          style={{ display: isActive ? 'block' : 'none' }}
        />

        {/* Scanning overlay */}
        {isActive && scanState === 'scanning' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-56 h-36">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-indigo-400 rounded-tl" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-indigo-400 rounded-tr" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-indigo-400 rounded-bl" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-indigo-400 rounded-br" />
              <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-indigo-400 to-transparent shadow-[0_0_8px_rgba(99,102,241,0.8)] animate-bounce" style={{ top: '50%' }} />
            </div>
            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
              <span className="text-xs text-indigo-200 bg-black/60 px-3 py-1 rounded-full">Apunta al código de barras</span>
            </div>
          </div>
        )}

        {/* Idle state */}
        {!isActive && scanState === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="w-20 h-20 rounded-full bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center">
              <ScanBarcode className="w-10 h-10 text-indigo-400" />
            </div>
            <p className="text-slate-400 text-sm">Cámara inactiva</p>
          </div>
        )}

        {/* Error state */}
        {scanState === 'error' && !isActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <AlertCircle className="w-12 h-12 text-red-400" />
            <p className="text-red-400 text-sm font-medium">Error de cámara</p>
          </div>
        )}

        {/* Result overlay */}
        {(scanState === 'found' || scanState === 'not-found') && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70 backdrop-blur-sm">
            {scanState === 'found' ? (
              <>
                <CheckCircle className="w-16 h-16 text-emerald-400" />
                <p className="text-white font-semibold">¡Producto encontrado!</p>
              </>
            ) : (
              <>
                <AlertCircle className="w-16 h-16 text-amber-400" />
                <p className="text-white font-semibold">Producto no encontrado</p>
                <p className="text-slate-300 text-xs">Abriendo formulario de creación...</p>
              </>
            )}
            <code className="text-xs text-slate-200 bg-black/50 px-3 py-1 rounded-lg font-mono">{scannedCode}</code>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        {!isActive ? (
          <Button onClick={startScanning} className="flex-1" size="lg" disabled={!selectedDevice}>
            <Camera className="w-4 h-4" />
            {devices.length === 0 ? 'Sin cámara disponible' : 'Iniciar escáner'}
          </Button>
        ) : (
          <Button onClick={stopScanning} variant="outline" className="flex-1" size="lg">
            <CameraOff className="w-4 h-4" />
            Detener
          </Button>
        )}
        {devices.length > 1 && (
          <Button onClick={switchCamera} variant="outline" size="lg" title="Cambiar cámara">
            <FlipHorizontal className="w-4 h-4" />
          </Button>
        )}
        {(scannedCode || scanState === 'error') && (
          <Button onClick={reset} variant="secondary" size="lg">
            <RefreshCw className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Instructions */}
      {(scanState === 'idle' || scanState === 'error') && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2 shadow-sm">
          <h3 className="text-sm font-medium text-slate-900">Cómo usar el escáner</h3>
          <ol className="text-xs text-slate-500 space-y-1.5 list-decimal list-inside">
            <li>Haz clic en <strong className="text-slate-700">"Iniciar escáner"</strong></li>
            <li>Permite el acceso a la cámara en el navegador</li>
            <li>Apunta al código de barras del producto</li>
            <li>Si el producto <strong className="text-emerald-600">existe</strong>: irás a editarlo</li>
            <li>Si <strong className="text-amber-600">no existe</strong>: se crea con el código precargado</li>
          </ol>
          <p className="text-xs text-amber-600 mt-2">⚠ Requiere <strong>HTTPS</strong> y permiso de cámara</p>
        </div>
      )}
    </div>
  )
}
