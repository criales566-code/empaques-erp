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

  const summaryCards = [
    {
      label: 'Total transacciones',
      value: sales.length.toString(),
      icon: ShoppingCart,
      accent: 'bg-indigo-500',
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      valueColor: 'text-slate-900',
    },
    {
      label: 'Ingresos totales',
      value: formatCOP(total),
      icon: DollarSign,
      accent: 'bg-emerald-500',
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      valueColor: 'text-emerald-700',
    },
    {
      label: 'Utilidad total',
      value: formatCOP(profit),
      icon: TrendingUp,
      accent: 'bg-blue-500',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      valueColor: profit >= 0 ? 'text-blue-700' : 'text-red-700',
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ventas"
        description={`${sales.length} transacciones registradas`}
        actions={
          <Link href="/sales/new">
            <Button>
              <Plus className="w-4 h-4" />
              Nueva venta
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {summaryCards.map(card => {
          const Icon = card.icon
          return (
            <div key={card.label} className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex">
              <div className={`w-1 flex-shrink-0 ${card.accent}`} />
              <div className="flex-1 p-4">
                <div className={`w-8 h-8 rounded-lg ${card.iconBg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-4 h-4 ${card.iconColor}`} />
                </div>
                <p className={`text-xl font-bold ${card.valueColor}`}>{card.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{card.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      <SalesTable sales={sales} />
    </div>
  )
}
