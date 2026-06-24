import { getExpenses } from '@/lib/actions/expenses'
import { getIncomes } from '@/lib/actions/incomes'
import { getSales } from '@/lib/actions/sales'
import { FinancesDashboard } from '@/components/finances/FinancesDashboard'
import { PageHeader } from '@/components/ui/page-header'

export const dynamic = 'force-dynamic'

export default async function FinancesPage() {
  const [expenses, incomes, sales] = await Promise.all([
    getExpenses().catch(() => []),
    getIncomes().catch(() => []),
    getSales().catch(() => []),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Finanzas"
        description="Resumen financiero y flujo de caja"
      />
      <FinancesDashboard expenses={expenses} incomes={incomes} sales={sales} />
    </div>
  )
}
