import Link from 'next/link'
import type { Expense } from '@/lib/types'
import { formatCOP } from '@/lib/utils/currency'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Receipt, ArrowRight, Plus } from 'lucide-react'

export function RecentExpensesTable({ expenses }: { expenses: Expense[] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="h-1 w-full bg-red-500" />
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
            <Receipt className="w-4 h-4 text-red-600" />
          </div>
          <h3 className="text-[15px] font-semibold text-slate-900 truncate">Últimos gastos</h3>
          {expenses.length > 0 && (
            <span className="text-[12px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
              {expenses.length}
            </span>
          )}
        </div>
        <Link
          href="/finances"
          className="flex items-center gap-1 text-[13px] text-indigo-600 hover:text-indigo-700 font-semibold transition-colors shrink-0"
        >
          Ver todo <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {expenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 px-6 gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
            <Receipt className="w-7 h-7 text-slate-400" />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-slate-800">Sin gastos registrados</p>
            <p className="text-[13px] text-slate-500 mt-1">
              Registra gastos para mantener control de tus costos
            </p>
          </div>
          <Link
            href="/finances"
            className="flex items-center gap-1.5 text-[13px] font-semibold text-white bg-slate-900 hover:bg-slate-800 px-4 py-2.5 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo gasto
          </Link>
        </div>
      ) : (
        <div>
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center gap-3 sm:gap-4 px-5 sm:px-6 py-3.5 border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <Receipt className="w-4 h-4 text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-slate-900 truncate">{expense.description}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                    {expense.category}
                  </span>
                  <span className="text-[12px] text-slate-500">
                    {format(new Date(expense.created_at), 'd MMM · HH:mm', { locale: es })}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[14px] font-bold text-red-600">−{formatCOP(expense.amount)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
