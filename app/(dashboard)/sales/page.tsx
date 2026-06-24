import Link from 'next/link'
import { getSales } from '@/lib/actions/sales'
import { SalesTable } from '@/components/sales/SalesTable'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import { formatCOP } from '@/lib/utils/currency'
import { totalSales, totalProfit } from '@/lib/utils/calculations'
import { Plus, ShoppingCart, TrendingUp, DollarSign } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function SalesPage() {
  const sales = await getSales().catch(() => [])
  const total = totalSales(sales)
  const profit = totalProfit(sales)

  const kpis = [
    {
      label: 'Total de ventas',
      value: sales.length.toString(),
      icon: ShoppingCart,
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-500',
      valueColor: 'text-slate-900',
    },
    {
      label: 'Ingresos totales',
      value: formatCOP(total),
      icon: DollarSign,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-500',
      valueColor: 'text-slate-900',
    },
    {
      label: 'Utilidad total',
      value: formatCOP(profit),
      icon: TrendingUp,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-500',
      valueColor: profit >= 0 ? 'text-slate-900' : 'text-red-600',
    },
  ]

  return (
    <div className="space-y-7">
      <PageHeader
        title="Ventas"
        description={`${sales.length} transacción${sales.length !== 1 ? 'es' : ''} registrada${sales.length !== 1 ? 's' : ''}`}
        actions={
          <Link href="/sales/new">
            <Button className="h-9 px-4 text-sm font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 border-0 shadow-none">
              <Plus className="w-4 h-4" />
              Nueva venta
            </Button>
          </Link>
        }
      />

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <div
              key={kpi.label}
              className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all duration-150"
            >
              <div className="flex items-start justify-between gap-4 mb-5">
                <p className="text-sm font-medium text-slate-500 leading-snug">{kpi.label}</p>
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${kpi.iconBg}`}
                >
                  <Icon className={`w-[18px] h-[18px] ${kpi.iconColor}`} />
                </div>
              </div>
              <p className={`text-[28px] font-bold tracking-tight leading-none ${kpi.valueColor}`}>
                {kpi.value}
              </p>
            </div>
          )
        })}
      </div>

      <SalesTable sales={sales} />
    </div>
  )
}
