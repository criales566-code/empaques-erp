import { Package, Hash, Clock, ExternalLink, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import type { ScanActivity } from './types'

interface Props {
  activity: ScanActivity | null
}

export function ScannerDetailPanel({ activity }: Props) {
  if (!activity) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col min-h-72">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Detalle del producto</h2>
          <p className="text-xs text-slate-400 mt-0.5">Selecciona un escaneo para ver detalles</p>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
            <Package className="w-7 h-7 text-slate-300" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Sin selección</p>
            <p className="text-xs text-slate-400 mt-1 max-w-48 leading-relaxed">
              Escanea un producto o selecciona un registro de la actividad reciente
            </p>
          </div>
        </div>
      </div>
    )
  }

  const isFound = activity.status === 'found'

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
      <div className="px-6 py-4 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-900">Detalle del producto</h2>
        <p className="text-xs text-slate-400 mt-0.5">Último escaneo procesado</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Status banner */}
        {isFound ? (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-xs font-medium text-emerald-700">Registrado en inventario</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
            <span className="text-xs font-medium text-amber-700">Producto no registrado</span>
          </div>
        )}

        {/* Product image placeholder */}
        <div className="w-full aspect-square max-h-40 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-100 flex flex-col items-center justify-center gap-2">
          <Package className="w-10 h-10 text-slate-200" />
          <span className="text-[10px] text-slate-300 font-medium uppercase tracking-wide">
            Sin imagen
          </span>
        </div>

        {/* Info rows */}
        <div className="space-y-2">
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">
              Producto
            </p>
            <p className="text-sm font-semibold text-slate-900">
              {activity.productName ?? (
                <span className="text-slate-400 font-normal italic">Producto nuevo</span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
              <Hash className="w-4 h-4 text-slate-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">
                Código de barras
              </p>
              <code className="text-xs font-mono text-slate-700 truncate block">{activity.code}</code>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 text-slate-400" />
            </div>
            <div>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">
                Escaneado
              </p>
              <p className="text-xs text-slate-700">
                {new Date(activity.timestamp).toLocaleString('es-CO', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* CTA button */}
        {isFound && activity.productId ? (
          <Link
            href={`/inventory/${activity.productId}`}
            className="flex w-full items-center justify-center gap-2 h-10 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
          >
            Ver en inventario
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        ) : (
          <Link
            href={`/inventory/new?barcode=${encodeURIComponent(activity.code)}`}
            className="flex w-full items-center justify-center gap-2 h-10 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors"
          >
            Crear producto
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </div>
  )
}
