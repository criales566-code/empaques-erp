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

  const today = format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: es })

  return (
    <div className="space-y-16">
      {/* Editorial hero */}
      <section>
        <p className="text-[13px] font-medium text-neutral-500 capitalize mb-3">{today}</p>
        <h1 className="text-[44px] sm:text-[56px] lg:text-[68px] font-semibold text-neutral-900 tracking-[-0.035em] leading-[0.95]">
          Buen día,<br />
          <span className="text-neutral-400">tu negocio hoy.</span>
        </h1>
      </section>

      {/* Alert banners — inline text style */}
      {(outOfStock.length > 0 || lowStock.length > 0) && (
        <div className="flex flex-wrap gap-x-6 gap-y-2 -mt-8">
          {outOfStock.length > 0 && (
            <Link
              href="/inventory"
              className="inline-flex items-center gap-2 text-[13px] font-medium text-red-700 hover:text-red-900 transition-colors underline decoration-red-300 decoration-1 underline-offset-4"
            >
              <PackageX className="w-3.5 h-3.5 shrink-0" />
              {outOfStock.length} agotado{outOfStock.length > 1 ? 's' : ''}
            </Link>
          )}
          {lowStock.length > 0 && (
            <Link
              href="/inventory"
              className="inline-flex items-center gap-2 text-[13px] font-medium text-amber-800 hover:text-amber-900 transition-colors underline decoration-amber-300 decoration-1 underline-offset-4"
            >
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              {lowStock.length} con stock bajo
            </Link>
          )}
        </div>
      )}

      {/* KPIs — flat editorial grid */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8">
          {stats.map((stat) => (
            <StatsCard key={stat.title} {...stat} />
          ))}
        </div>
        <div className="border-t border-[#ececec]" />
      </section>

      {/* Chart + financial summary */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-x-12 gap-y-12">
        <div className="xl:col-span-2">
          <div className="mb-6">
            <p className="text-[12px] font-medium text-neutral-500 mb-1">Evolución</p>
            <h2 className="text-[22px] font-semibold text-neutral-900 tracking-tight">
              Ventas y gastos — 6 meses
            </h2>
          </div>
          <SalesChart sales={sales} expenses={expenses} />
        </div>

        <div className="space-y-12">
          {/* Financial summary */}
          <div>
            <div className="mb-6">
              <p className="text-[12px] font-medium text-neutral-500 mb-1">Resumen</p>
              <h2 className="text-[22px] font-semibold text-neutral-900 tracking-tight">
                Estado financiero
              </h2>
            </div>
            <div className="space-y-5">
              {[
                { label: 'Ingresos', value: totalRev, color: 'text-emerald-700', bar: 'bg-emerald-500', pct: 100 },
                { label: 'Gastos', value: totalExp, color: 'text-red-700', bar: 'bg-red-500', pct: totalRev > 0 ? Math.min(100, (totalExp / totalRev) * 100) : 0 },
                { label: 'Utilidad neta', value: netProfit, color: netProfit >= 0 ? 'text-neutral-900' : 'text-red-700', bar: netProfit >= 0 ? 'bg-neutral-900' : 'bg-red-500', pct: totalRev > 0 ? Math.min(100, (Math.abs(netProfit) / totalRev) * 100) : 0 },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between items-baseline mb-2 gap-2">
                    <span className="text-[13px] font-medium text-neutral-500">{item.label}</span>
                    <span className={`tabular text-[15px] font-semibold ${item.color}`}>
                      {formatCOP(item.value)}
                    </span>
                  </div>
                  <div className="h-[3px] bg-neutral-100 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${item.bar}`}
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Inventory status */}
          <div>
            <div className="flex items-baseline justify-between mb-6">
              <div>
                <p className="text-[12px] font-medium text-neutral-500 mb-1">Stock</p>
                <h2 className="text-[22px] font-semibold text-neutral-900 tracking-tight">
                  Inventario
                </h2>
              </div>
              <Link
                href="/inventory"
                className="text-[13px] font-medium text-neutral-500 hover:text-neutral-900 transition-colors underline decoration-neutral-300 decoration-1 underline-offset-4"
              >
                Ver todo
              </Link>
            </div>

            <div className="space-y-4">
              {[
                { label: 'En stock', count: inStock },
                { label: 'Stock bajo', count: lowStock.length },
                { label: 'Agotados', count: outOfStock.length },
              ].map((item, idx) => (
                <div key={item.label} className={`flex items-baseline justify-between ${idx > 0 ? 'pt-4 border-t border-[#ececec]' : ''}`}>
                  <span className="text-[14px] text-neutral-500">{item.label}</span>
                  <span className="tabular text-[20px] font-semibold text-neutral-900">{item.count}</span>
                </div>
              ))}
            </div>

            {products.length === 0 && (
              <Link
                href="/inventory/new"
                className="inline-block mt-6 text-[13px] font-medium text-neutral-900 underline decoration-neutral-300 decoration-1 underline-offset-4 hover:decoration-neutral-900 transition-colors"
              >
                Agregar primer producto →
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Recent activity */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-x-12 gap-y-12">
        <RecentSalesTable sales={sales.slice(0, 5)} />
        <RecentExpensesTable expenses={expenses.slice(0, 5)} />
      </section>
    </div>
  )
}
