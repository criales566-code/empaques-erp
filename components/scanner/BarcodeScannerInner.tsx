'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { BrowserMultiFormatReader, type IScannerControls } from '@zxing/browser'
import { NotFoundException, type Result } from '@zxing/library'
import { getProductByBarcode } from '@/lib/actions/products'
import {
  Camera,
  CameraOff,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ScanBarcode,
  FlipHorizontal,
  Search,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import type { ScannerCameraProps, ScanStatus } from './types'

export default function BarcodeScannerInner({ onScanResult, onStatusChange }: ScannerCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const manualInputRef = useRef<HTMLInputElement>(null)
  const lastCodeRef = useRef<string>('')
  const isProcessingRef = useRef(false)          // ref evita closure stale en callback ZXing
  const controlsRef = useRef<IScannerControls | null>(null)  // para detener el scanner correctamente

  const [scanState, setScanState] = useState<ScanStatus>('idle')
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null)
  const [scannedCode, setScannedCode] = useState<string>('')
  const [isActive, setIsActive] = useState(false)
  const [manualCode, setManualCode] = useState('')
  const [processing, setProcessing] = useState(false)
  const [noCamera, setNoCamera] = useState(false)

  function updateState(state: ScanStatus) {
    setScanState(state)
    onStatusChange?.(state)
  }

  const stopScanning = useCallback(() => {
    try {
      controlsRef.current?.stop()
      controlsRef.current = null
    } catch {}
    try {
      BrowserMultiFormatReader.releaseAllStreams()
    } catch {}
    setIsActive(false)
  }, [])

  useEffect(() => () => { stopScanning() }, [stopScanning])

  // Enumerar cámaras al montar — sin pedir permiso aún
  useEffect(() => {
    async function loadDevices() {
      if (!navigator?.mediaDevices?.getUserMedia) {
        setNoCamera(true)
        return
      }
      try {
        const all = await BrowserMultiFormatReader.listVideoInputDevices()
        if (all.length > 0) {
          setDevices(all)
          const back = all.find(d => /back|environment|rear|trasera/i.test(d.label))
          setSelectedDevice((back ?? all[all.length - 1]).deviceId)
        }
        // Si all.length === 0 no es error, puede ser que aún no tienen permiso
      } catch { /* se usará facingMode en startScanning */ }
    }
    loadDevices()
  }, [])

  async function processCode(code: string) {
    if (isProcessingRef.current) return
    isProcessingRef.current = true
    setScannedCode(code)
    setManualCode('')
    stopScanning()
    updateState('processing')
    setProcessing(true)

    try {
      const product = await getProductByBarcode(code)
      if (product) {
        updateState('found')
        toast.success(`Producto encontrado: ${product.name}`)
        onScanResult(code, product)
      } else {
        updateState('not-found')
        toast.info('Producto no encontrado — abriendo formulario...')
        onScanResult(code, null)
      }
    } catch {
      updateState('error')
      toast.error('Error al buscar el producto')
    } finally {
      isProcessingRef.current = false
      setProcessing(false)
    }
  }

  const onDecode = useCallback((result: Result | undefined, err: Error | undefined) => {
    if (result) {
      const code = result.getText()
      if (code && code !== lastCodeRef.current) {
        lastCodeRef.current = code
        processCode(code)
      }
    }
    if (err && !(err instanceof NotFoundException)) {
      // NotFoundException = sin código en el frame — esperado
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function startScanning() {
    if (!videoRef.current) return

    stopScanning()                  // limpiar cualquier sesión previa
    updateState('scanning')
    setIsActive(true)
    lastCodeRef.current = ''
    setScannedCode('')
    isProcessingRef.current = false

    try {
      const reader = new BrowserMultiFormatReader()

      let controls: IScannerControls

      if (selectedDevice) {
        controls = await reader.decodeFromVideoDevice(selectedDevice, videoRef.current, onDecode)
      } else {
        // Móvil sin dispositivos enumerados — pedir permiso con facingMode
        controls = await reader.decodeFromConstraints(
          { video: { facingMode: { ideal: 'environment' } } },
          videoRef.current,
          onDecode
        )
        // Intentar enumerar ahora que tenemos permiso
        try {
          const all = await BrowserMultiFormatReader.listVideoInputDevices()
          if (all.length > 0) {
            setDevices(all)
            const back = all.find(d => /back|environment|rear|trasera/i.test(d.label))
            setSelectedDevice((back ?? all[all.length - 1]).deviceId)
          }
        } catch { /* ignorar */ }
      }

      controlsRef.current = controls
    } catch (err: unknown) {
      updateState('error')
      setIsActive(false)
      const msg = err instanceof Error ? err.message : ''
      if (/Permission|NotAllowed|denied/i.test(msg)) {
        toast.error('Permiso de cámara denegado. Habilítalo en la configuración del navegador.')
      } else if (/NotFound|DevicesNotFound|device not found/i.test(msg)) {
        toast.error('No se encontró cámara en este dispositivo.')
      } else {
        toast.error('Error al iniciar la cámara. Requiere HTTPS.')
      }
    }
  }

  function switchCamera() {
    if (devices.length < 2) return
    const idx = devices.findIndex(d => d.deviceId === selectedDevice)
    setSelectedDevice(devices[(idx + 1) % devices.length].deviceId)
    if (isActive) {
      stopScanning()
      setTimeout(startScanning, 300)
    }
  }

  function reset() {
    stopScanning()
    updateState('idle')
    setScannedCode('')
    setManualCode('')
    lastCodeRef.current = ''
    isProcessingRef.current = false
    setTimeout(() => manualInputRef.current?.focus(), 100)
  }

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault()
    const code = manualCode.trim()
    if (!code) return
    await processCode(code)
  }

  const cameraLabel = devices.length > 0
    ? `${devices.length} cámara${devices.length > 1 ? 's' : ''} disponible${devices.length > 1 ? 's' : ''}`
    : noCamera ? 'Sin cámara detectada' : 'Cámara disponible'

  const isResult = scanState === 'found' || scanState === 'not-found'
  const showReset = scannedCode || scanState === 'error'

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
            <ScanBarcode className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Escáner de cámara</h2>
            <p className="text-xs text-slate-400">{cameraLabel}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {devices.length > 1 && (
            <button onClick={switchCamera} title="Cambiar cámara"
              className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
              <FlipHorizontal className="w-4 h-4" />
            </button>
          )}
          {showReset && (
            <button onClick={reset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
              <RefreshCw className="w-3 h-3" />
              Reiniciar
            </button>
          )}
        </div>
      </div>

      {/* Viewfinder */}
      <div className="relative bg-slate-950 aspect-[4/3] w-full overflow-hidden">
        {/* Video siempre presente en el DOM para que ZXing lo pueda usar */}
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
          autoPlay
        />

        {/* Idle */}
        {!isActive && scanState === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <ScanBarcode className="w-10 h-10 text-white/20" />
            </div>
            <p className="text-white/50 text-sm font-medium">Cámara inactiva</p>
          </div>
        )}

        {/* Scanning overlay */}
        {isActive && scanState === 'scanning' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-64 h-40">
              <div className="absolute top-0 left-0 w-10 h-10 border-t-[3px] border-l-[3px] border-indigo-400 rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-10 h-10 border-t-[3px] border-r-[3px] border-indigo-400 rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-10 h-10 border-b-[3px] border-l-[3px] border-indigo-400 rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-10 h-10 border-b-[3px] border-r-[3px] border-indigo-400 rounded-br-lg" />
              <div className="absolute inset-x-3 h-0.5 bg-gradient-to-r from-transparent via-indigo-400 to-transparent animate-bounce"
                style={{ top: '50%', boxShadow: '0 0 8px 2px rgba(99,102,241,0.6)' }} />
            </div>
            <div className="absolute bottom-5 inset-x-0 flex justify-center">
              <span className="text-[11px] text-white/80 bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                Apunta al código de barras
              </span>
            </div>
          </div>
        )}

        {/* Processing */}
        {processing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/80 backdrop-blur-sm">
            <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
            <p className="text-white/70 text-sm">Buscando en inventario...</p>
            {scannedCode && (
              <code className="text-xs text-white/50 bg-white/10 px-3 py-1 rounded-lg font-mono">{scannedCode}</code>
            )}
          </div>
        )}

        {/* Error */}
        {scanState === 'error' && !isActive && !isResult && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-red-400 text-sm font-medium">Error de cámara</p>
            <p className="text-white/40 text-xs">Verifica permisos o usa la entrada manual</p>
          </div>
        )}

        {/* Result */}
        {isResult && !processing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/80 backdrop-blur-sm">
            {scanState === 'found' ? (
              <>
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <p className="text-white font-semibold text-sm">¡Producto encontrado!</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-amber-400" />
                </div>
                <p className="text-white font-semibold text-sm">Producto no encontrado</p>
              </>
            )}
            {scannedCode && (
              <code className="text-xs text-white/60 bg-white/10 px-3 py-1 rounded-lg font-mono mt-1">{scannedCode}</code>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-5 space-y-4">
        <div className="flex gap-2">
          {!isActive ? (
            <button onClick={startScanning} disabled={noCamera}
              className="flex-1 h-11 flex items-center justify-center gap-2 text-sm font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm">
              <Camera className="w-4 h-4" />
              Activar cámara
            </button>
          ) : (
            <button onClick={stopScanning}
              className="flex-1 h-11 flex items-center justify-center gap-2 text-sm font-medium rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors">
              <CameraOff className="w-4 h-4" />
              Detener cámara
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-100" />
          <span className="text-xs text-slate-400 font-medium">o ingresa manualmente</span>
          <div className="flex-1 h-px bg-slate-100" />
        </div>

        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input
            ref={manualInputRef}
            type="text"
            value={manualCode}
            onChange={e => setManualCode(e.target.value)}
            placeholder="Código de barras o SKU..."
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            className="flex-1 h-12 px-4 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all font-mono"
          />
          <button type="submit" disabled={!manualCode.trim() || processing}
            className="h-12 w-12 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0">
            {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </button>
        </form>

        {(scanState === 'idle' || scanState === 'error') && (
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 space-y-2.5">
            <p className="text-xs font-semibold text-slate-600">Cómo usar el escáner</p>
            <ol className="text-xs text-slate-500 space-y-1.5 list-decimal list-inside">
              <li>Activa la cámara y apunta al código de barras</li>
              <li>Si tienes un lector USB, úsalo directamente en el campo manual</li>
              <li>Producto encontrado → serás redirigido al inventario</li>
              <li>Producto nuevo → se abrirá el formulario con el código precargado</li>
            </ol>
            {scanState === 'error' && (
              <div className="flex items-center gap-1.5 pt-1 text-xs text-amber-600 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                Requiere HTTPS y permiso de cámara en el navegador
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
