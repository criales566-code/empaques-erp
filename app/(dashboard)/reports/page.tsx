import { getProducts } from '@/lib/actions/products'
import { getSales } from '@/lib/actions/sales'
import { getExpenses } from '@/lib/actions/expenses'
import { getIncomes } from '@/lib/actions/incomes'
import { ReportsGenerator } from '@/components/reports/ReportsGenerator'

export const dynamic = 'force-dynamic'

export default async function ReportsPage() {
  const [products, sales, expenses, incomes] = await Promise.all([
    getProducts().catch(() => []),
    getSales().catch(() => []),
    getExpenses().catch(() => []),
    getIncomes().catch(() => []),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reportes</h1>
        <p className="text-slate-500 text-sm mt-1">Genera reportes en PDF para imprimir o compartir</p>
      </div>
      <ReportsGenerator
        products={products}
        sales={sales}
        expenses={expenses}
        incomes={incomes}
      />
    </div>
  )
}
