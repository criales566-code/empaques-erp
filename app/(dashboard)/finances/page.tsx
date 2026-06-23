import { getExpenses } from '@/lib/actions/expenses'
import { getIncomes } from '@/lib/actions/incomes'
import { getSales } from '@/lib/actions/sales'
import { FinancesDashboard } from '@/components/finances/FinancesDashboard'

export const dynamic = 'force-dynamic'

export default async function FinancesPage() {
  const [expenses, incomes, sales] = await Promise.all([
    getExpenses().catch(() => []),
    getIncomes().catch(() => []),
    getSales().catch(() => []),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Finanzas</h1>
        <p className="text-slate-400 text-sm mt-1">Resumen financiero y flujo de caja</p>
      </div>
      <FinancesDashboard expenses={expenses} incomes={incomes} sales={sales} />
    </div>
  )
}
