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
  ArrowRight,
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
      description: `${products.length} productos activos`,
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
    <div className="space-y-6">
      {/* Hero header */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-700 p-6 text-white shadow-lg shadow-indigo-200/50">
        <p className="text-indigo-200 text-sm font-medium mb-1">Resumen ejecutivo</p>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-6 mt-4">
          <div>
            <p className="text-indigo-200 text-xs">Ingresos totales</p>
            <p className="text-white text-xl font-bold">{formatCOP(totalRev)}</p>
          </div>
          <div className="w-px h-10 bg-white/20" />
          <div>
            <p className="text-indigo-200 text-xs">Utilidad neta</p>
            <p className={`text-xl font-bold ${netProfit >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>{formatCOP(netProfit)}</p>
          </div>
          <div className="w-px h-10 bg-white/20" />
          <div>
            <p className="text-indigo-200 text-xs">Productos</p>
            <p className="text-white text-xl font-bold">{products.length}</p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(outOfStock.length > 0 || lowStock.length > 0) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {outOfStock.length > 0 && (
            <Link href="/inventory" className="flex items-center justify-between gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 hover:bg-red-100 transition-colors group flex-1">
              <div className="flex items-center gap-2">
                <PackageX className="w-4 h-4 flex-shrink-0" />
                <span><strong>{outOfStock.length}</strong> producto(s) agotado(s) — revisar inventario</span>
              </div>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          )}
          {lowStock.length > 0 && (
            <Link href="/inventory" className="flex items-center justify-between gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700 hover:bg-amber-100 transition-colors group flex-1">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span><strong>{lowStock.length}</strong> producto(s) con stock bajo</span>
              </div>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          )}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
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
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Resumen financiero</h3>
            <div className="space-y-3">
              {[
                { label: 'Ingresos totales', value: totalRev, color: 'text-emerald-600', bar: 'bg-emerald-400' },
                { label: 'Gastos totales', value: totalExp, color: 'text-red-500', bar: 'bg-red-400' },
                { label: 'Utilidad neta', value: netProfit, color: netProfit >= 0 ? 'text-emerald-600' : 'text-red-500', bar: netProfit >= 0 ? 'bg-emerald-400' : 'bg-red-400' },
                { label: 'Capital inventario', value: inventoryValue, color: 'text-amber-600', bar: 'bg-amber-400' },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-slate-500">{item.label}</span>
                    <span className={`text-xs font-bold ${item.color}`}>{formatCOP(item.value)}</span>
                  </div>
                  <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.bar}`}
                      style={{ width: totalRev > 0 ? `${Math.min(100, Math.abs(item.value) / totalRev * 100)}%` : '0%' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Inventory health */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Estado del inventario</h3>
            <div className="space-y-3">
              {[
                { label: 'En stock', count: products.length - outOfStock.length - lowStock.length, color: 'bg-emerald-500', textColor: 'text-emerald-700' },
                { label: 'Stock bajo', count: lowStock.length, color: 'bg-amber-400', textColor: 'text-amber-700' },
                { label: 'Agotados', count: outOfStock.length, color: 'bg-red-500', textColor: 'text-red-700' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${item.color}`} />
                  <span className="text-xs text-slate-500 flex-1">{item.label}</span>
                  <span className={`text-xs font-bold ${item.textColor}`}>{item.count}</span>
                </div>
              ))}
              <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden flex">
                {products.length > 0 && (
                  <>
                    <div className="bg-emerald-500 h-full" style={{ width: `${(products.length - outOfStock.length - lowStock.length) / products.length * 100}%` }} />
                    <div className="bg-amber-400 h-full" style={{ width: `${lowStock.length / products.length * 100}%` }} />
                    <div className="bg-red-500 h-full" style={{ width: `${outOfStock.length / products.length * 100}%` }} />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tables row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <RecentSalesTable sales={sales.slice(0, 5)} />
        <RecentExpensesTable expenses={expenses.slice(0, 5)} />
      </div>
    </div>
  )
}
