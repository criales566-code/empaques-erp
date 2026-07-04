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
  Link2,
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

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
  const outOfStock = products.filter((p) => p.stock === 0)
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= p.minimum_stock)
  const inStock = products.length - outOfStock.length - lowStock.length

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
      title: 'Valor inventario',
      value: formatCOP(inventoryValue),
      description: `${products.length} SKUs activos`,
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

  const today = format(new Date(), "d 'de' MMMM, yyyy", { locale: es })

  return (
    <div className="space-y-7">
      {/* Page heading */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-widest mb-2">
            Resumen general
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
        </div>
        <p className="text-[14px] font-medium text-slate-500 mt-1 capitalize">{today}</p>
      </div>

      {/* Alert banners */}
      {(outOfStock.length > 0 || lowStock.length > 0) && (
        <div className="flex flex-wrap gap-2.5">
          {outOfStock.length > 0 && (
            <Link
              href="/inventory"
              className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-[14px] text-red-700 hover:bg-red-100 transition-colors font-semibold"
            >
              <PackageX className="w-4 h-4 shrink-0" />
              <strong>{outOfStock.length}</strong>&nbsp;producto{outOfStock.length > 1 ? 's' : ''} agotado{outOfStock.length > 1 ? 's' : ''}
            </Link>
          )}
          {lowStock.length > 0 && (
            <Link
              href="/inventory"
              className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-[14px] text-amber-800 hover:bg-amber-100 transition-colors font-semibold"
            >
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <strong>{lowStock.length}</strong>&nbsp;con stock bajo
            </Link>
          )}
        </div>
      )}

      {/* KPI row — 4 cols on xl, 2 on sm */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Chart + sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Chart — 2/3 */}
        <div className="xl:col-span-2">
          <SalesChart sales={sales} expenses={expenses} />
        </div>

        {/* Sidebar — 1/3 */}
        <div className="space-y-5">
          {/* Financial summary */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-[15px] font-semibold text-slate-900 mb-5">Resumen financiero</h3>
            <div className="space-y-4">
              {[
                {
                  label: 'Ingresos',
                  value: totalRev,
                  color: 'text-emerald-600',
                  bar: 'bg-emerald-400',
                  pct: 100,
                },
                {
                  label: 'Gastos',
                  value: totalExp,
                  color: 'text-red-500',
                  bar: 'bg-red-400',
                  pct: totalRev > 0 ? Math.min(100, (totalExp / totalRev) * 100) : 0,
                },
                {
                  label: 'Utilidad neta',
                  value: netProfit,
                  color: netProfit >= 0 ? 'text-emerald-600' : 'text-red-500',
                  bar: netProfit >= 0 ? 'bg-emerald-400' : 'bg-red-400',
                  pct:
                    totalRev > 0
                      ? Math.min(100, (Math.abs(netProfit) / totalRev) * 100)
                      : 0,
                },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between items-baseline mb-2 gap-2">
                    <span className="text-[13px] font-semibold text-slate-600">{item.label}</span>
                    <span className={`text-[14px] font-bold ${item.color}`}>
                      {formatCOP(item.value)}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${item.bar}`}
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Inventory status */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[15px] font-semibold text-slate-900">Estado del inventario</h3>
              <Link
                href="/inventory"
                className="text-[13px] text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
              >
                Ver todo
              </Link>
            </div>

            <div className="space-y-3 mb-4">
              {[
                { label: 'En stock', count: inStock, dot: 'bg-emerald-500', text: 'text-emerald-700' },
                { label: 'Stock bajo', count: lowStock.length, dot: 'bg-amber-500', text: 'text-amber-700' },
                { label: 'Agotados', count: outOfStock.length, dot: 'bg-red-500', text: 'text-red-700' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${item.dot}`} />
                  <span className="text-[14px] font-medium text-slate-700 flex-1">{item.label}</span>
                  <span className={`text-[15px] font-bold ${item.text}`}>{item.count}</span>
                </div>
              ))}
            </div>

            {products.length > 0 && (
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden flex gap-0.5">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all"
                  style={{ width: `${(inStock / products.length) * 100}%` }}
                />
                <div
                  className="bg-amber-400 h-full transition-all"
                  style={{ width: `${(lowStock.length / products.length) * 100}%` }}
                />
                <div
                  className="bg-red-500 h-full rounded-full transition-all"
                  style={{ width: `${(outOfStock.length / products.length) * 100}%` }}
                />
              </div>
            )}

            {products.length === 0 && (
              <div className="flex flex-col items-center justify-center py-6 gap-2 text-center">
                <Package className="w-10 h-10 text-slate-300" />
                <p className="text-[13px] text-slate-500">Sin productos registrados</p>
                <Link
                  href="/inventory/new"
                  className="text-[13px] font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Agregar primer producto →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <RecentSalesTable sales={sales.slice(0, 5)} />
        <RecentExpensesTable expenses={expenses.slice(0, 5)} />
      </div>
    </div>
  )
}
