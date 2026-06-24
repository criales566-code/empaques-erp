import Link from 'next/link'
import { getSales } from '@/lib/actions/sales'
import { SalesTable } from '@/components/sales/SalesTable'
import { Button } from '@/components/ui/button'
import { formatCOP } from '@/lib/utils/currency'
import { totalSales, totalProfit } from '@/lib/utils/calculations'
import { Plus, ShoppingCart, TrendingUp, DollarSign } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function SalesPage() {
  const sales = await getSales().catch(() => [])
  const total = totalSales(sales)
  const profit = totalProfit(sales)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ventas</h1>
          <p className="text-slate-500 text-sm mt-1">{sales.length} transacciones registradas</p>
        </div>
        <Link href="/sales/new">
          <Button>
            <Plus className="w-4 h-4" />
            Nueva venta
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingCart className="w-4 h-4 text-indigo-600" />
            <span className="text-xs text-slate-500">Total transacciones</span>
          </div>
          <p className="text-xl font-bold text-slate-900">{sales.length}</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span className="text-xs text-emerald-600">Ingresos totales</span>
          </div>
          <p className="text-xl font-bold text-emerald-700">{formatCOP(total)}</p>
        </div>
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <span className="text-xs text-indigo-600">Utilidad total</span>
          </div>
          <p className="text-xl font-bold text-indigo-700">{formatCOP(profit)}</p>
        </div>
      </div>

      <SalesTable sales={sales} />
    </div>
  )
}
