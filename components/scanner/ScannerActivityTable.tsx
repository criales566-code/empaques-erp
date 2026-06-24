'use client'

import { CheckCircle2, AlertCircle, Clock, Trash2, ChevronRight } from 'lucide-react'
import type { ScanActivity } from './types'
import { cn } from '@/lib/utils'

interface Props {
  activities: ScanActivity[]
  selectedId: string | null
  onSelect: (activity: ScanActivity) => void
  onClear: () => void
}

function formatTime(isoString: string): string {
  try {
    return new Date(isoString).toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  } catch {
    return '—'
  }
}

function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString)
    const today = new Date()
    if (d.toDateString() === today.toDateString()) return 'Hoy'
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })
  } catch {
    return '—'
  }
}

export function ScannerActivityTable({ activities, selectedId, onSelect, onClear }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-900">Actividad reciente</h2>
          </div>
          {activities.length > 0 && (
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full tabular-nums">
              {activities.length}
            </span>
          )}
        </div>
        {activities.length > 0 && (
          <button
            onClick={onClear}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Limpiar historial
          </button>
        )}
      </div>

      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
            <Clock className="w-6 h-6 text-slate-300" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Sin actividad registrada</p>
            <p className="text-xs text-slate-400 mt-0.5">Los escaneos aparecerán aquí en tiempo real</p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide px-6 py-3 w-10">
                  Estado
                </th>
                <th className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide px-4 py-3">
                  Código
                </th>
                <th className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide px-4 py-3">
                  Producto
                </th>
                <th className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide px-4 py-3 hidden sm:table-cell">
                  Fecha
                </th>
                <th className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide px-4 py-3 hidden md:table-cell">
                  Hora
                </th>
                <th className="px-6 py-3 w-6" />
              </tr>
            </thead>
            <tbody>
              {activities.map((activity) => (
                <tr
                  key={activity.id}
                  onClick={() => onSelect(activity)}
                  className={cn(
                    'border-b border-slate-50 last:border-0 cursor-pointer transition-colors',
                    selectedId === activity.id
                      ? 'bg-indigo-50/60 hover:bg-indigo-50'
                      : 'hover:bg-slate-50/70'
                  )}
                >
                  <td className="px-6 py-3.5">
                    {activity.status === 'found' ? (
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md hidden lg:inline">
                          Encontrado
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                        <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md hidden lg:inline">
                          No encontrado
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <code className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-md font-mono">
                      {activity.code.length > 20 ? `${activity.code.slice(0, 20)}…` : activity.code}
                    </code>
                  </td>
                  <td className="px-4 py-3.5">
                    {activity.productName ? (
                      <span className="text-sm text-slate-900 font-medium">{activity.productName}</span>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Producto nuevo</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 hidden sm:table-cell">
                    <span className="text-xs text-slate-400">{formatDate(activity.timestamp)}</span>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <span className="text-xs text-slate-400 font-mono">{formatTime(activity.timestamp)}</span>
                  </td>
                  <td className="px-6 py-3.5">
                    <ChevronRight className="w-4 h-4 text-slate-300 ml-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
