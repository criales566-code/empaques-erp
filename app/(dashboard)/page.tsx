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
  filterSalesYesterday,
  filterSalesLastMonth,
  totalProfit,
  totalSales,
  totalExpenses,
  dailySalesSeries,
  monthlySalesSeries,
  monthlyProfitSeries,
  pctChange,
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
  const salesYesterday = filterSalesYesterday(sales)
  const salesMonth = filterSalesThisMonth(sales)
  const salesLastMonth = filterSalesLastMonth(sales)

  const inventoryValue = calculateInventoryValue(products)
  const accumulatedProfit = totalProfit(sales)
  const totalExp = totalExpenses(expenses)
  const totalRev = totalSales(sales)
  const netProfit = totalRev - totalExp

  const outOfStock = products.filter((p) => p.stock === 0)
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= p.minimum_stock)
  const inStock = products.length - outOfStock.length - lowStock.length

  // KPI trends
  const trendTodayVsYest = pctChange(totalSales(salesToday), totalSales(salesYesterday))
  const trendMonthVsLast = pctChange(totalSales(salesMonth), totalSales(salesLastMonth))
  const profitSeries = monthlyProfitSeries(sales, 6)
  const trendProfit = pctChange(profitSeries.at(-1) ?? 0, profitSeries.at(-2) ?? 0)

  const stats = [
    {
      title: 'Ventas hoy',
      value: formatCOP(totalSales(salesToday)),
      subtitle: `${salesToday.length} transacciones`,
      icon: ShoppingCart,
      color: 'indigo' as const,
      trendPct: trendTodayVsYest,
      sparklineData: dailySalesSeries(sales, 7),
    },
    {
      title: 'Ventas del mes',
      value: formatCOP(totalSales(salesMonth)),
      subtitle: `${salesMonth.length} transacciones`,
      icon: TrendingUp,
      color: 'emerald' as const,
      trendPct: trendMonthVsLast,
      sparklineData: monthlySalesSeries(sales, 6),
    },
    {
      title: 'Valor inventario',
      value: formatCOP(inventoryValue),
      subtitle: `${products.length} SKUs activos`,
      icon: Package,
      color: 'amber' as const,
      trendPct: null,
      sparklineData: undefined,
    },
    {
      title: 'Utilidad acumulada',
      value: formatCOP(accumulatedProfit),
      subtitle: `Neto: ${formatCOP(netProfit)}`,
      icon: DollarSign,
      color: 'violet' as const,
      trendPct: trendProfit,
      sparklineData: profitSeries,
    },
  ]

  const today = format(new Date(), "d 'de' MMMM, yyyy", { locale: es })

  return (
    <div className="space-y-10 md:space-y-12">
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

      {/* KPI row with sparklines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 md:gap-6">
        {stats.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Chart + right rail */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
        {/* Chart */}
        <div className="xl:col-span-2">
          <SalesChart sales={sales} expenses={expenses} />
        </div>

        {/* Right rail */}
        <div className="space-y-6 md:space-y-8">
          {/* Financial summary — emerald accent */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="h-1 w-full bg-emerald-500" />
            <div className="p-6 sm:p-7">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                  <DollarSign className="w-[18px] h-[18px] text-emerald-600" />
                </div>
                <h3 className="text-[16px] font-semibold text-slate-900">Resumen financiero</h3>
              </div>
              <div className="space-y-5">
                {[
                  { label: 'Ingresos', value: totalRev, color: 'text-emerald-700', bar: 'bg-emerald-500', pct: 100 },
                  { label: 'Gastos', value: totalExp, color: 'text-red-700', bar: 'bg-red-500', pct: totalRev > 0 ? Math.min(100, (totalExp / totalRev) * 100) : 0 },
                  { label: 'Utilidad neta', value: netProfit, color: netProfit >= 0 ? 'text-emerald-700' : 'text-red-700', bar: netProfit >= 0 ? 'bg-emerald-500' : 'bg-red-500', pct: totalRev > 0 ? Math.min(100, (Math.abs(netProfit) / totalRev) * 100) : 0 },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between items-baseline mb-2 gap-2">
                      <span className="text-[13px] font-semibold text-slate-600">{item.label}</span>
                      <span className={`text-[14px] font-bold tabular-nums ${item.color}`}>
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
          </div>

          {/* Inventory status — amber accent */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="h-1 w-full bg-amber-500" />
            <div className="p-6 sm:p-7">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                    <Package className="w-[18px] h-[18px] text-amber-600" />
                  </div>
                  <h3 className="text-[16px] font-semibold text-slate-900">Estado del inventario</h3>
                </div>
                <Link
                  href="/inventory"
                  className="text-[13px] text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
                >
                  Ver todo
                </Link>
              </div>

              {/* Big number */}
              <div className="mb-6 pb-6 border-b border-slate-100">
                <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-1">SKUs totales</p>
                <p className="text-[32px] font-bold text-slate-900 tabular-nums leading-none">{products.length}</p>
              </div>

              <div className="space-y-4 mb-5">
                {[
                  { label: 'En stock', count: inStock, dot: 'bg-emerald-500', text: 'text-emerald-700', pct: products.length ? (inStock / products.length) * 100 : 0 },
                  { label: 'Stock bajo', count: lowStock.length, dot: 'bg-amber-500', text: 'text-amber-700', pct: products.length ? (lowStock.length / products.length) * 100 : 0 },
                  { label: 'Agotados', count: outOfStock.length, dot: 'bg-red-500', text: 'text-red-700', pct: products.length ? (outOfStock.length / products.length) * 100 : 0 },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${item.dot}`} />
                    <span className="text-[14px] font-medium text-slate-700 flex-1">{item.label}</span>
                    <span className="text-[12px] text-slate-500 tabular-nums">{item.pct.toFixed(0)}%</span>
                    <span className={`text-[15px] font-bold tabular-nums ${item.text} w-8 text-right`}>{item.count}</span>
                  </div>
                ))}
              </div>

              {products.length > 0 && (
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                  <div className="bg-emerald-500 h-full transition-all" style={{ width: `${(inStock / products.length) * 100}%` }} />
                  <div className="bg-amber-500 h-full transition-all" style={{ width: `${(lowStock.length / products.length) * 100}%` }} />
                  <div className="bg-red-500 h-full transition-all" style={{ width: `${(outOfStock.length / products.length) * 100}%` }} />
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
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
        <RecentSalesTable sales={sales.slice(0, 5)} />
        <RecentExpensesTable expenses={expenses.slice(0, 5)} />
      </div>
    </div>
  )
}
