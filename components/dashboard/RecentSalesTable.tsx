import Link from 'next/link'
import type { Sale } from '@/lib/types'
import { formatCOP } from '@/lib/utils/currency'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ShoppingCart } from 'lucide-react'

const PAYMENT_LABELS: Record<string, string> = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
  tarjeta: 'Tarjeta',
  credito: 'Crédito',
}

export function RecentSalesTable({ sales }: { sales: Sale[] }) {
  return (
    <div className="rounded-xl border border-[#2a2a38] bg-[#111118] p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Últimas ventas</h3>
        <Link href="/sales" className="text-xs text-indigo-400 hover:text-indigo-300">
          Ver todo →
        </Link>
      </div>
      {sales.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-slate-500">
          <ShoppingCart className="w-8 h-8 mb-2 opacity-50" />
          <p className="text-sm">No hay ventas aún</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sales.map(sale => (
            <div key={sale.id} className="flex items-center justify-between py-2 border-b border-[#2a2a38] last:border-0">
              <div className="min-w-0">
                <p className="text-sm text-white font-medium truncate">{sale.customer_name}</p>
                <p className="text-xs text-slate-500">
                  {PAYMENT_LABELS[sale.payment_method]} · {format(new Date(sale.created_at), 'dd MMM HH:mm', { locale: es })}
                </p>
              </div>
              <div className="text-right ml-2">
                <p className="text-sm font-semibold text-white">{formatCOP(sale.total)}</p>
                <p className="text-xs text-emerald-400">+{formatCOP(sale.profit)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
