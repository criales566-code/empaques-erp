import { getProducts } from '@/lib/actions/products'
import { getSales } from '@/lib/actions/sales'
import { getExpenses } from '@/lib/actions/expenses'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { SalesChart } from '@/components/dashboard/SalesChart'
import { RecentSalesTable } from '@/components/dashboard/RecentSalesTable'
import { RecentExpensesTable } from '@/components/dashboard/RecentExpensesTable'
import {
  calculateInventoryValue,
  filterSalesToday,
  filterSalesThisMonth,
  totalProfit,
  totalSales,
  totalExpenses,
} from '@/lib/utils/calculations'
import { formatCOP } from '@/lib/utils/currency'
import {
  ShoppingCart,
  TrendingUp,
  Package,
  DollarSign,
  AlertTriangle,
  PackageX,
} from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const [products, sales, expenses] = await Promise.all([
    getProducts().catch(() => []),
    getSales().catch(() => []),
    getExpenses().catch(() => []),
  ])

  const salesToday = filterSalesToday(sales)
  const salesMonth = filterSalesThisMonth(sales)
  const inventoryValue = calculateInventoryValue(products)
  const accumulatedProfit = totalProfit(sales)
  const totalExp = totalExpenses(expenses)
  const totalRev = totalSales(sales)
  const netProfit = totalRev - totalExp
  const outOfStock = products.filter(p => p.stock === 0)
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= p.minimum_stock)

  const stats = [
    {
      title: 'Ventas hoy',
      value: formatCOP(totalSales(salesToday)),
      description: `${salesToday.length} transacciones`,
      icon: ShoppingCart,
      color: 'indigo' as const,
      trend: (salesToday.length > 0 ? 'up' : 'neutral') as 'up' | 'neutral',
    },
    {
      title: 'Ventas del mes',
      value: formatCOP(totalSales(salesMonth)),
      description: `${salesMonth.length} transacciones`,
      icon: TrendingUp,
      color: 'emerald' as const,
      trend: 'up' as const,
    },
    {
      title: 'Inventario',
      value: formatCOP(inventoryValue),
      description: `${products.length} productos`,
      icon: Package,
      color: 'amber' as const,
      trend: 'neutral' as const,
    },
    {
      title: 'Utilidad acumulada',
      value: formatCOP(accumulatedProfit),
      description: `Neto: ${formatCOP(netProfit)}`,
      icon: DollarSign,
      color: (accumulatedProfit >= 0 ? 'emerald' : 'red') as 'emerald' | 'red',
      trend: (accumulatedProfit >= 0 ? 'up' : 'down') as 'up' | 'down',
    },
  ]

  return (
    <div className="space-y-5">

      {/* Page title */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm">Resumen de tu negocio</p>
      </div>

      {/* Alerts */}
      {(outOfStock.length > 0 || lowStock.length > 0) && (
        <div className="flex flex-col sm:flex-row gap-2">
          {outOfStock.length > 0 && (
            <Link href="/inventory" className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700 hover:bg-red-100 transition-colors">
              <PackageX className="w-3.5 h-3.5 flex-shrink-0" />
              <span><strong>{outOfStock.length}</strong> agotado(s)</span>
            </Link>
          )}
          {lowStock.length > 0 && (
            <Link href="/inventory" className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700 hover:bg-amber-100 transition-colors">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              <span><strong>{lowStock.length}</strong> con stock bajo</span>
            </Link>
          )}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {stats.map(stat => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <SalesChart sales={sales} expenses={expenses} />
        </div>

        <div className="space-y-4">
          {/* Financial summary */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Resumen financiero</h3>
            <div className="space-y-2.5">
              {[
                { label: 'Ingresos', value: totalRev, color: 'text-emerald-600', bar: 'bg-emerald-400', pct: 100 },
                { label: 'Gastos', value: totalExp, color: 'text-red-500', bar: 'bg-red-400', pct: totalRev > 0 ? Math.min(100, totalExp / totalRev * 100) : 0 },
                { label: 'Utilidad neta', value: netProfit, color: netProfit >= 0 ? 'text-emerald-600' : 'text-red-500', bar: netProfit >= 0 ? 'bg-emerald-400' : 'bg-red-400', pct: totalRev > 0 ? Math.min(100, Math.abs(netProfit) / totalRev * 100) : 0 },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-slate-500">{item.label}</span>
                    <span className={`text-xs font-bold ${item.color}`}>{formatCOP(item.value)}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${item.bar}`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Inventory status */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Estado del inventario</h3>
            <div className="space-y-2">
              {[
                { label: 'En stock', count: products.length - outOfStock.length - lowStock.length, dot: 'bg-emerald-500', color: 'text-emerald-700' },
                { label: 'Stock bajo', count: lowStock.length, dot: 'bg-amber-400', color: 'text-amber-700' },
                { label: 'Agotados', count: outOfStock.length, dot: 'bg-red-500', color: 'text-red-700' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2.5">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${item.dot}`} />
                  <span className="text-xs text-slate-500 flex-1">{item.label}</span>
                  <span className={`text-xs font-bold ${item.color}`}>{item.count}</span>
                </div>
              ))}
              {products.length > 0 && (
                <div className="mt-1 h-2 bg-slate-100 rounded-full overflow-hidden flex">
                  <div className="bg-emerald-500 h-full" style={{ width: `${(products.length - outOfStock.length - lowStock.length) / products.length * 100}%` }} />
                  <div className="bg-amber-400 h-full" style={{ width: `${lowStock.length / products.length * 100}%` }} />
                  <div className="bg-red-500 h-full" style={{ width: `${outOfStock.length / products.length * 100}%` }} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <RecentSalesTable sales={sales.slice(0, 5)} />
        <RecentExpensesTable expenses={expenses.slice(0, 5)} />
      </div>
    </div>
  )
}
