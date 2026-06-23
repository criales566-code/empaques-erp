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
          <h1 className="text-2xl font-bold text-white">Ventas</h1>
          <p className="text-slate-400 text-sm mt-1">{sales.length} transacciones registradas</p>
        </div>
        <Link href="/sales/new">
          <Button>
            <Plus className="w-4 h-4" />
            Nueva venta
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-[#2a2a38] bg-[#111118] p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingCart className="w-4 h-4 text-indigo-400" />
            <span className="text-xs text-slate-400">Total transacciones</span>
          </div>
          <p className="text-xl font-bold text-white">{sales.length}</p>
        </div>
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-emerald-400/70">Ingresos totales</span>
          </div>
          <p className="text-xl font-bold text-emerald-400">{formatCOP(total)}</p>
        </div>
        <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            <span className="text-xs text-indigo-400/70">Utilidad total</span>
          </div>
          <p className="text-xl font-bold text-indigo-400">{formatCOP(profit)}</p>
        </div>
      </div>

      <SalesTable sales={sales} />
    </div>
  )
}
