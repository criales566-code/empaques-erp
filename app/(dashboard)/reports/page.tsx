import { getProducts } from '@/lib/actions/products'
import { getSales } from '@/lib/actions/sales'
import { getExpenses } from '@/lib/actions/expenses'
import { getIncomes } from '@/lib/actions/incomes'
import { ReportsGenerator } from '@/components/reports/ReportsGenerator'
import { PageHeader } from '@/components/ui/page-header'

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
      <PageHeader
        title="Reportes"
        description="Genera reportes en PDF para imprimir o compartir"
      />
      <ReportsGenerator
        products={products}
        sales={sales}
        expenses={expenses}
        incomes={incomes}
      />
    </div>
  )
}
