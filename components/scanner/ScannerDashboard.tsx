'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { ScannerKpiCards } from './ScannerKpiCards'
import { ScannerActivityTable } from './ScannerActivityTable'
import { ScannerDetailPanel } from './ScannerDetailPanel'
import type { ScanActivity, ScanStatus, ProductResult, ScannerCameraProps } from './types'

const ScannerCameraCard = dynamic<ScannerCameraProps>(
  () => import('./BarcodeScannerInner'),
  {
    ssr: false,
    loading: () => (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center min-h-[480px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Cargando escáner...</p>
        </div>
      </div>
    ),
  }
)

const STORAGE_KEY = 'scanner-activity-v2'

function loadActivities(): ScanActivity[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as ScanActivity[]) : []
  } catch {
    return []
  }
}

function isToday(isoString: string): boolean {
  try {
    return new Date(isoString).toDateString() === new Date().toDateString()
  } catch {
    return false
  }
}

const statusLabels: Record<ScanStatus, { label: string; dotClass: string; pillClass: string }> = {
  idle: {
    label: 'Cámara inactiva',
    dotClass: 'bg-slate-400',
    pillClass: 'border-slate-200 bg-white text-slate-600',
  },
  scanning: {
    label: 'Escaneando...',
    dotClass: 'bg-indigo-500 animate-pulse',
    pillClass: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  },
  processing: {
    label: 'Buscando producto...',
    dotClass: 'bg-indigo-400 animate-pulse',
    pillClass: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  },
  found: {
    label: 'Producto encontrado',
    dotClass: 'bg-emerald-500',
    pillClass: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  'not-found': {
    label: 'No encontrado',
    dotClass: 'bg-amber-500',
    pillClass: 'border-amber-200 bg-amber-50 text-amber-700',
  },
  error: {
    label: 'Error de cámara',
    dotClass: 'bg-red-500',
    pillClass: 'border-red-200 bg-red-50 text-red-700',
  },
}

export function ScannerDashboard() {
  const router = useRouter()
  const [activities, setActivities] = useState<ScanActivity[]>([])
  const [selectedActivity, setSelectedActivity] = useState<ScanActivity | null>(null)
  const [scanStatus, setScanStatus] = useState<ScanStatus>('idle')
  const [sessionStart] = useState(() => Date.now())
  const [sessionMinutes, setSessionMinutes] = useState(0)

  useEffect(() => {
    setActivities(loadActivities())
  }, [])

  // Update session timer every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setSessionMinutes(Math.floor((Date.now() - sessionStart) / 60000))
    }, 60000)
    return () => clearInterval(interval)
  }, [sessionStart])

  const handleScanResult = useCallback(
    (code: string, product: ProductResult | null) => {
      const activity: ScanActivity = {
        id: crypto.randomUUID(),
        code,
        productName: product?.name ?? null,
        productId: product?.id ?? null,
        status: product ? 'found' : 'not-found',
        timestamp: new Date().toISOString(),
      }

      setActivities((prev) => {
        const updated = [activity, ...prev].slice(0, 100)
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)) } catch {}
        return updated
      })
      setSelectedActivity(activity)

      setTimeout(() => {
        if (product) {
          router.push(`/inventory/${product.id}`)
        } else {
          router.push(`/inventory/new?barcode=${encodeURIComponent(code)}`)
        }
      }, 1500)
    },
    [router]
  )

  function handleClear() {
    setActivities([])
    setSelectedActivity(null)
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
  }

  // KPI computations
  const todayActivities = activities.filter((a) => isToday(a.timestamp))
  const todayFound = todayActivities.filter((a) => a.status === 'found').length
  const todayNotFound = todayActivities.filter((a) => a.status === 'not-found').length
  const totalToday = todayActivities.length

  const status = statusLabels[scanStatus]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <nav className="flex items-center gap-1 text-xs text-slate-400 mb-1.5">
            <span>Sistema</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-600 font-medium">Escáner</span>
          </nav>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-none">
            Escáner de productos
          </h1>
          <p className="text-sm text-slate-500 mt-1.5">
            Escanea códigos de barras para gestionar tu inventario en tiempo real
          </p>
        </div>

        {/* Connection status pill */}
        <div
          className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border shrink-0 mt-0.5 ${status.pillClass}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${status.dotClass}`} />
          {status.label}
        </div>
      </div>

      {/* KPI row */}
      <ScannerKpiCards
        total={totalToday}
        found={todayFound}
        notFound={todayNotFound}
        sessionMinutes={sessionMinutes}
      />

      {/* Main content — Scanner (3/5) + Detail panel (2/5) */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-3">
          <ScannerCameraCard
            onScanResult={handleScanResult}
            onStatusChange={setScanStatus}
          />
        </div>
        <div className="xl:col-span-2">
          <ScannerDetailPanel activity={selectedActivity} />
        </div>
      </div>

      {/* Activity table */}
      <ScannerActivityTable
        activities={activities}
        selectedId={selectedActivity?.id ?? null}
        onSelect={setSelectedActivity}
        onClear={handleClear}
      />
    </div>
  )
}
