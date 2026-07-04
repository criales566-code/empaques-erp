import Link from 'next/link'
import type { Expense } from '@/lib/types'
import { formatCOP } from '@/lib/utils/currency'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ArrowUpRight } from 'lucide-react'

export function RecentExpensesTable({ expenses }: { expenses: Expense[] }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <p className="text-[12px] font-medium text-neutral-500 mb-1">Actividad</p>
          <h2 className="text-[22px] font-semibold text-neutral-900 tracking-tight">
            Últimos gastos
          </h2>
        </div>
        <Link
          href="/finances"
          className="inline-flex items-center gap-0.5 text-[13px] font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          Ver todo <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {expenses.length === 0 ? (
        <div className="py-12 border-t border-[#ececec]">
          <p className="text-[15px] text-neutral-900 mb-1">Sin gastos registrados.</p>
          <p className="text-[13px] text-neutral-500 mb-4">Registra gastos para mantener control de tus costos.</p>
          <Link
            href="/finances"
            className="inline-block text-[13px] font-medium text-neutral-900 underline decoration-neutral-300 decoration-1 underline-offset-4 hover:decoration-neutral-900 transition-colors"
          >
            Registrar gasto →
          </Link>
        </div>
      ) : (
        <div>
          {expenses.map((expense, idx) => (
            <div
              key={expense.id}
              className={`flex items-baseline gap-4 py-4 ${idx === 0 ? 'border-t border-[#ececec]' : ''} border-b border-[#ececec]`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-medium text-neutral-900 truncate">{expense.description}</p>
                <p className="text-[12px] text-neutral-500 mt-0.5">
                  {expense.category} · {format(new Date(expense.created_at), 'd MMM · HH:mm', { locale: es })}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="tabular text-[15px] font-semibold text-red-700">−{formatCOP(expense.amount)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
