import Link from 'next/link'
import type { Expense } from '@/lib/types'
import { formatCOP } from '@/lib/utils/currency'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Receipt, ArrowRight, Plus } from 'lucide-react'

export function RecentExpensesTable({ expenses }: { expenses: Expense[] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
            <Receipt className="w-3.5 h-3.5 text-red-500" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">Últimos gastos</h3>
          {expenses.length > 0 && (
            <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {expenses.length}
            </span>
          )}
        </div>
        <Link
          href="/finances"
          className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
        >
          Ver todo <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {expenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 px-6 gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
            <Receipt className="w-7 h-7 text-slate-300" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">Sin gastos registrados</p>
            <p className="text-xs text-slate-400 mt-1">
              Registra gastos para mantener control de tus costos
            </p>
          </div>
          <Link
            href="/finances"
            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-xl transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Nuevo gasto
          </Link>
        </div>
      ) : (
        <div>
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center gap-4 px-6 py-4 border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <Receipt className="w-4 h-4 text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{expense.description}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                    {expense.category}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {format(new Date(expense.created_at), 'd MMM · HH:mm', { locale: es })}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-red-600">−{formatCOP(expense.amount)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
