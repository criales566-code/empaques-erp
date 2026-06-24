import Link from 'next/link'
import type { Expense } from '@/lib/types'
import { formatCOP } from '@/lib/utils/currency'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Receipt } from 'lucide-react'

export function RecentExpensesTable({ expenses }: { expenses: Expense[] }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900">Últimos gastos</h3>
        <Link href="/finances/expenses" className="text-xs text-indigo-600 hover:text-indigo-700">
          Ver todo →
        </Link>
      </div>
      {expenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-slate-400">
          <Receipt className="w-8 h-8 mb-2 opacity-50" />
          <p className="text-sm">No hay gastos registrados</p>
        </div>
      ) : (
        <div className="space-y-1">
          {expenses.map(expense => (
            <div key={expense.id} className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
              <div className="min-w-0">
                <p className="text-sm text-slate-900 font-medium truncate">{expense.description}</p>
                <p className="text-xs text-slate-400">
                  {expense.category} · {format(new Date(expense.created_at), 'dd MMM HH:mm', { locale: es })}
                </p>
              </div>
              <div className="text-right ml-2">
                <p className="text-sm font-semibold text-red-600">-{formatCOP(expense.amount)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
