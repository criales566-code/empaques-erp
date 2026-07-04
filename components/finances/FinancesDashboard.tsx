'use client'

import { useState } from 'react'
import type { Expense, Income, Sale } from '@/lib/types'
import { ExpenseForm } from './ExpenseForm'
import { IncomeForm } from './IncomeForm'
import { deleteExpense } from '@/lib/actions/expenses'
import { deleteIncome } from '@/lib/actions/incomes'
import { formatCOP } from '@/lib/utils/currency'
import {
  totalExpenses, totalIncomes, totalSales,
  totalProfit,
} from '@/lib/utils/calculations'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import {
  TrendingUp, TrendingDown, DollarSign,
  ArrowUpRight, Plus, Trash2, Receipt, PiggyBank,
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const EXPENSE_CATEGORY_LABELS: Record<string, string> = {
  arriendo: 'Arriendo',
  nomina: 'Nómina',
  servicios: 'Servicios',
  materia_prima: 'Materia prima',
  transporte: 'Transporte',
  marketing: 'Marketing',
  impuestos: 'Impuestos',
  mantenimiento: 'Mantenimiento',
  general: 'General',
}

interface Props {
  expenses: Expense[]
  incomes: Income[]
  sales: Sale[]
}

export function FinancesDashboard({ expenses, incomes, sales }: Props) {
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [showIncomeForm, setShowIncomeForm] = useState(false)
  const [deleteItem, setDeleteItem] = useState<{ id: string; type: 'expense' | 'income' } | null>(null)
  const [deleting, setDeleting] = useState(false)

  const totalExp = totalExpenses(expenses)
  const totalInc = totalIncomes(incomes)
  const totalSal = totalSales(sales)
  const totalRevenue = totalSal + totalInc
  const netProfit = totalRevenue - totalExp

  async function handleDelete() {
    if (!deleteItem) return
    setDeleting(true)
    try {
      if (deleteItem.type === 'expense') await deleteExpense(deleteItem.id)
      else await deleteIncome(deleteItem.id)
      toast.success('Eliminado correctamente')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error')
    } finally {
      setDeleting(false)
      setDeleteItem(null)
    }
  }

  const kpis = [
    { label: 'Ventas totales', value: totalSal, color: 'text-indigo-700', icon: TrendingUp, iconBg: 'bg-indigo-50', iconColor: 'text-indigo-600', accent: 'bg-indigo-500' },
    { label: 'Gastos totales', value: totalExp, color: 'text-red-700', icon: TrendingDown, iconBg: 'bg-red-50', iconColor: 'text-red-600', accent: 'bg-red-500' },
    { label: 'Ingresos extra', value: totalInc, color: 'text-blue-700', icon: ArrowUpRight, iconBg: 'bg-blue-50', iconColor: 'text-blue-600', accent: 'bg-blue-500' },
    { label: 'Utilidad neta', value: netProfit, color: netProfit >= 0 ? 'text-emerald-700' : 'text-red-700', icon: DollarSign, iconBg: netProfit >= 0 ? 'bg-emerald-50' : 'bg-red-50', iconColor: netProfit >= 0 ? 'text-emerald-600' : 'text-red-600', accent: netProfit >= 0 ? 'bg-emerald-500' : 'bg-red-500' },
    { label: 'Flujo de caja', value: netProfit, color: netProfit >= 0 ? 'text-emerald-700' : 'text-red-700', icon: ArrowUpRight, iconBg: 'bg-slate-100', iconColor: 'text-slate-500', accent: 'bg-slate-400' },
  ]

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {kpis.map(kpi => (
          <div key={kpi.label} className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex hover:shadow-md hover:border-slate-300 transition-all">
            <div className={`w-1.5 flex-shrink-0 ${kpi.accent}`} />
            <div className="flex-1 p-4 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-3">
                <p className="text-[12px] font-semibold text-slate-600 uppercase tracking-wide truncate">{kpi.label}</p>
                <div className={`w-9 h-9 rounded-lg ${kpi.iconBg} flex items-center justify-center shrink-0`}>
                  <kpi.icon className={`w-4 h-4 ${kpi.iconColor}`} />
                </div>
              </div>
              <p className={`text-[18px] font-bold tracking-tight break-words ${kpi.color}`}>{formatCOP(kpi.value)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Expenses */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[15px] font-semibold text-slate-900 flex items-center gap-2">
              <Receipt className="w-[18px] h-[18px] text-red-500" />
              Gastos
            </h2>
            <Button size="sm" variant="outline" onClick={() => setShowExpenseForm(true)}>
              <Plus className="w-3.5 h-3.5" />
              Agregar
            </Button>
          </div>
          {showExpenseForm && (
            <div className="mb-4">
              <ExpenseForm onClose={() => setShowExpenseForm(false)} />
            </div>
          )}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {expenses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-slate-200 rounded-xl">
                <Receipt className="w-10 h-10 mb-3 text-slate-300" />
                <p className="text-[14px] font-semibold text-slate-700">Sin gastos registrados</p>
                <p className="text-[13px] text-slate-500 mt-1">Haz clic en &quot;Agregar&quot; para registrar uno</p>
              </div>
            ) : (
              expenses.map(exp => (
                <div key={exp.id} className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100 group hover:bg-slate-100 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] text-slate-900 font-semibold truncate">{exp.description}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <Badge variant="destructive" className="text-[11px]">
                        {EXPENSE_CATEGORY_LABELS[exp.category] || exp.category}
                      </Badge>
                      <span className="text-[12px] text-slate-500">
                        {format(new Date(exp.created_at), 'dd MMM', { locale: es })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[14px] font-bold text-red-600 whitespace-nowrap">-{formatCOP(exp.amount)}</span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-slate-400 hover:text-red-600 hover:bg-red-50 sm:opacity-0 sm:group-hover:opacity-100"
                      onClick={() => setDeleteItem({ id: exp.id, type: 'expense' })}
                      aria-label="Eliminar gasto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-baseline">
            <span className="text-[14px] font-medium text-slate-600">Total gastos</span>
            <span className="text-[16px] font-bold text-red-600">{formatCOP(totalExp)}</span>
          </div>
        </div>

        {/* Incomes */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[15px] font-semibold text-slate-900 flex items-center gap-2">
              <PiggyBank className="w-[18px] h-[18px] text-emerald-500" />
              Ingresos adicionales
            </h2>
            <Button size="sm" variant="outline" onClick={() => setShowIncomeForm(true)}>
              <Plus className="w-3.5 h-3.5" />
              Agregar
            </Button>
          </div>
          {showIncomeForm && (
            <div className="mb-4">
              <IncomeForm onClose={() => setShowIncomeForm(false)} />
            </div>
          )}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {incomes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-slate-200 rounded-xl">
                <PiggyBank className="w-10 h-10 mb-3 text-slate-300" />
                <p className="text-[14px] font-semibold text-slate-700">Sin ingresos adicionales</p>
                <p className="text-[13px] text-slate-500 mt-1">Haz clic en &quot;Agregar&quot; para registrar uno</p>
              </div>
            ) : (
              incomes.map(inc => (
                <div key={inc.id} className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100 group hover:bg-slate-100 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] text-slate-900 font-semibold truncate">{inc.description}</p>
                    <span className="text-[12px] text-slate-500 mt-1 block">
                      {format(new Date(inc.created_at), 'dd MMM', { locale: es })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[14px] font-bold text-emerald-600 whitespace-nowrap">+{formatCOP(inc.amount)}</span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-slate-400 hover:text-red-600 hover:bg-red-50 sm:opacity-0 sm:group-hover:opacity-100"
                      onClick={() => setDeleteItem({ id: inc.id, type: 'income' })}
                      aria-label="Eliminar ingreso"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-baseline">
            <span className="text-[14px] font-medium text-slate-600">Total ingresos adicionales</span>
            <span className="text-[16px] font-bold text-emerald-600">{formatCOP(totalInc)}</span>
          </div>
        </div>
      </div>

      <Dialog open={!!deleteItem} onOpenChange={open => !open && setDeleteItem(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>¿Eliminar registro?</DialogTitle>
            <DialogDescription>Esta acción no se puede deshacer.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteItem(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
