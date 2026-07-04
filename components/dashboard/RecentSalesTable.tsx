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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="h-1 w-full bg-indigo-500" />
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
            <ShoppingCart className="w-4 h-4 text-indigo-600" />
          </div>
          <h3 className="text-[15px] font-semibold text-slate-900 truncate">Últimas ventas</h3>
          {sales.length > 0 && (
            <span className="text-[12px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
              {sales.length}
            </span>
          )}
        </div>
        <Link
          href="/sales"
          className="flex items-center gap-1 text-[13px] text-indigo-600 hover:text-indigo-700 font-semibold transition-colors shrink-0"
        >
          Ver todo <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {sales.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 px-6 gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
            <ShoppingCart className="w-7 h-7 text-slate-400" />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-slate-800">Sin ventas registradas</p>
            <p className="text-[13px] text-slate-500 mt-1">
              Registra tu primera venta para ver el historial aquí
            </p>
          </div>
          <Link
            href="/sales/new"
            className="flex items-center gap-1.5 text-[13px] font-semibold text-white bg-slate-900 hover:bg-slate-800 px-4 py-2.5 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nueva venta
          </Link>
        </div>
      ) : (
        <div>
          {sales.map((sale) => (
            <div
              key={sale.id}
              className="flex items-center gap-3 sm:gap-4 px-5 sm:px-6 py-3.5 border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-700 text-[14px] font-bold">
                {(sale.customer_name ?? 'C').slice(0, 1).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-slate-900 truncate">{sale.customer_name}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                      PAYMENT_STYLES[sale.payment_method] ?? 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {PAYMENT_LABELS[sale.payment_method] ?? sale.payment_method}
                  </span>
                  <span className="text-[12px] text-slate-500">
                    {format(new Date(sale.created_at), 'd MMM · HH:mm', { locale: es })}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[14px] font-bold text-slate-900">{formatCOP(sale.total)}</p>
                <p className="text-[12px] text-emerald-600 font-semibold mt-0.5">
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
