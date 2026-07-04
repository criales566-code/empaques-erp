import Link from 'next/link'
import type { Sale } from '@/lib/types'
import { formatCOP } from '@/lib/utils/currency'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ArrowUpRight } from 'lucide-react'

const PAYMENT_LABELS: Record<string, string> = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
  tarjeta: 'Tarjeta',
  credito: 'Crédito',
}

export function RecentSalesTable({ sales }: { sales: Sale[] }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <p className="text-[12px] font-medium text-neutral-500 mb-1">Actividad</p>
          <h2 className="text-[22px] font-semibold text-neutral-900 tracking-tight">
            Últimas ventas
          </h2>
        </div>
        <Link
          href="/sales"
          className="inline-flex items-center gap-0.5 text-[13px] font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          Ver todo <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {sales.length === 0 ? (
        <div className="py-12 border-t border-[#ececec]">
          <p className="text-[15px] text-neutral-900 mb-1">Sin ventas registradas.</p>
          <p className="text-[13px] text-neutral-500 mb-4">Registra tu primera venta para ver el historial aquí.</p>
          <Link
            href="/sales/new"
            className="inline-block text-[13px] font-medium text-neutral-900 underline decoration-neutral-300 decoration-1 underline-offset-4 hover:decoration-neutral-900 transition-colors"
          >
            Registrar venta →
          </Link>
        </div>
      ) : (
        <div>
          {sales.map((sale, idx) => (
            <div
              key={sale.id}
              className={`flex items-baseline gap-4 py-4 ${idx === 0 ? 'border-t border-[#ececec]' : ''} border-b border-[#ececec]`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-medium text-neutral-900 truncate">{sale.customer_name}</p>
                <p className="text-[12px] text-neutral-500 mt-0.5">
                  {PAYMENT_LABELS[sale.payment_method] ?? sale.payment_method} · {format(new Date(sale.created_at), 'd MMM · HH:mm', { locale: es })}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="tabular text-[15px] font-semibold text-neutral-900">{formatCOP(sale.total)}</p>
                <p className="tabular text-[12px] text-emerald-700 mt-0.5">
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
