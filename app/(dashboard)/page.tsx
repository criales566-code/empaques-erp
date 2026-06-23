import { createClient } from '@/lib/supabase/server'
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
      title: 'Inventario valorizado',
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Resumen ejecutivo de tu negocio</p>
      </div>

      {/* Alerts */}
      {(outOfStock.length > 0 || lowStock.length > 0) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {outOfStock.length > 0 && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2.5 text-sm text-red-400">
              <PackageX className="w-4 h-4 flex-shrink-0" />
              <span><strong>{outOfStock.length}</strong> producto(s) agotado(s)</span>
            </div>
          )}
          {lowStock.length > 0 && (
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-2.5 text-sm text-amber-400">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span><strong>{lowStock.length}</strong> producto(s) con stock bajo</span>
            </div>
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
          <div className="rounded-xl border border-[#2a2a38] bg-[#111118] p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Resumen financiero</h3>
            <div className="space-y-3">
              {[
                { label: 'Ingresos totales', value: totalRev, color: 'text-emerald-400' },
                { label: 'Gastos totales', value: totalExp, color: 'text-red-400' },
                { label: 'Utilidad neta', value: netProfit, color: netProfit >= 0 ? 'text-emerald-400' : 'text-red-400' },
                { label: 'Capital en inventario', value: inventoryValue, color: 'text-amber-400' },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">{item.label}</span>
                  <span className={`text-xs font-semibold ${item.color}`}>{formatCOP(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-[#2a2a38] bg-[#111118] p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Estado del inventario</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Total productos</span>
                <span className="text-white font-medium">{products.length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Stock normal</span>
                <span className="text-emerald-400 font-medium">{products.length - outOfStock.length - lowStock.length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Stock bajo</span>
                <span className="text-amber-400 font-medium">{lowStock.length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Agotados</span>
                <span className="text-red-400 font-medium">{outOfStock.length}</span>
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
