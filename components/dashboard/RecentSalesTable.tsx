import Link from 'next/link'
import type { Sale } from '@/lib/types'
import { formatCOP } from '@/lib/utils/currency'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ShoppingCart, Plus, ArrowRight } from 'lucide-react'

const PAYMENT_LABELS: Record<string, string> = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
  tarjeta: 'Tarjeta',
  credito: 'Crédito',
}

const PAYMENT_STYLES: Record<string, string> = {
  efectivo: 'bg-emerald-50 text-emerald-700',
  transferencia: 'bg-blue-50 text-blue-700',
  tarjeta: 'bg-purple-50 text-purple-700',
  credito: 'bg-amber-50 text-amber-700',
}

export function RecentSalesTable({ sales }: { sales: Sale[] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
            <ShoppingCart className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">Últimas ventas</h3>
          {sales.length > 0 && (
            <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {sales.length}
            </span>
          )}
        </div>
        <Link
          href="/sales"
          className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
        >
          Ver todo <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {sales.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 px-6 gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
            <ShoppingCart className="w-7 h-7 text-slate-300" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">Sin ventas registradas</p>
            <p className="text-xs text-slate-400 mt-1">
              Registra tu primera venta para ver el historial aquí
            </p>
          </div>
          <Link
            href="/sales/new"
            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-xl transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Nueva venta
          </Link>
        </div>
      ) : (
        <div>
          {sales.map((sale) => (
            <div
              key={sale.id}
              className="flex items-center gap-4 px-6 py-4 border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-600 text-[13px] font-bold">
                {(sale.customer_name ?? 'C').slice(0, 1).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{sale.customer_name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                      PAYMENT_STYLES[sale.payment_method] ?? 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {PAYMENT_LABELS[sale.payment_method] ?? sale.payment_method}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {format(new Date(sale.created_at), 'd MMM · HH:mm', { locale: es })}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-slate-900">{formatCOP(sale.total)}</p>
                <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
                  +{formatCOP(sale.profit)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
