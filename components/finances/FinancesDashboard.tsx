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
  totalProfit, calculateROI,
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
  const profit = totalProfit(sales)
  const totalRevenue = totalSal + totalInc
  const netProfit = totalRevenue - totalExp
  const roi = calculateROI(profit, totalExp || 1)

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
    { label: 'Ventas totales', value: totalSal, color: 'text-indigo-400', icon: TrendingUp, bg: 'bg-indigo-500/10 border-indigo-500/20', isPercent: false },
    { label: 'Gastos totales', value: totalExp, color: 'text-red-400', icon: TrendingDown, bg: 'bg-red-500/10 border-red-500/20', isPercent: false },
    { label: 'Ingresos extra', value: totalInc, color: 'text-blue-400', icon: ArrowUpRight, bg: 'bg-blue-500/10 border-blue-500/20', isPercent: false },
    { label: 'Utilidad neta', value: netProfit, color: netProfit >= 0 ? 'text-emerald-400' : 'text-red-400', icon: DollarSign, bg: netProfit >= 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20', isPercent: false },
    { label: 'Flujo de caja', value: netProfit, color: netProfit >= 0 ? 'text-emerald-400' : 'text-red-400', icon: ArrowUpRight, bg: 'bg-[#1a1a24] border-[#2a2a38]', isPercent: false },
    { label: 'ROI', value: roi, color: roi >= 0 ? 'text-amber-400' : 'text-red-400', icon: PiggyBank, bg: 'bg-amber-500/10 border-amber-500/20', isPercent: true },
  ]

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpis.map(kpi => (
          <div key={kpi.label} className={`rounded-xl border p-3 ${kpi.bg}`}>
            <div className="flex items-center gap-1 mb-2">
              <kpi.icon className={`w-3.5 h-3.5 ${kpi.color}`} />
              <span className="text-xs text-slate-400 leading-tight">{kpi.label}</span>
            </div>
            <p className={`text-base font-bold ${kpi.color}`}>
              {kpi.isPercent ? `${kpi.value.toFixed(1)}%` : formatCOP(kpi.value)}
            </p>
          </div>
        ))}
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Expenses */}
        <div className="rounded-xl border border-[#2a2a38] bg-[#111118] p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-red-400" />
              Gastos
            </h2>
            <Button size="sm" variant="outline" onClick={() => setShowExpenseForm(true)}>
              <Plus className="w-3 h-3" />
              Agregar
            </Button>
          </div>
          {showExpenseForm && (
            <div className="mb-4">
              <ExpenseForm onClose={() => setShowExpenseForm(false)} />
            </div>
          )}
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {expenses.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No hay gastos registrados</p>
            ) : (
              expenses.map(exp => (
                <div key={exp.id} className="flex items-center justify-between p-3 rounded-lg bg-[#1a1a24] border border-[#2a2a38] group">
                  <div className="min-w-0">
                    <p className="text-sm text-white font-medium truncate">{exp.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="destructive" className="text-xs">
                        {EXPENSE_CATEGORY_LABELS[exp.category] || exp.category}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        {format(new Date(exp.created_at), 'dd MMM', { locale: es })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                    <span className="text-sm font-semibold text-red-400">-{formatCOP(exp.amount)}</span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300"
                      onClick={() => setDeleteItem({ id: exp.id, type: 'expense' })}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-[#2a2a38] flex justify-between">
            <span className="text-sm text-slate-400">Total gastos</span>
            <span className="text-sm font-bold text-red-400">{formatCOP(totalExp)}</span>
          </div>
        </div>

        {/* Incomes */}
        <div className="rounded-xl border border-[#2a2a38] bg-[#111118] p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <PiggyBank className="w-4 h-4 text-emerald-400" />
              Ingresos adicionales
            </h2>
            <Button size="sm" variant="outline" onClick={() => setShowIncomeForm(true)}>
              <Plus className="w-3 h-3" />
              Agregar
            </Button>
          </div>
          {showIncomeForm && (
            <div className="mb-4">
              <IncomeForm onClose={() => setShowIncomeForm(false)} />
            </div>
          )}
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {incomes.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No hay ingresos adicionales</p>
            ) : (
              incomes.map(inc => (
                <div key={inc.id} className="flex items-center justify-between p-3 rounded-lg bg-[#1a1a24] border border-[#2a2a38] group">
                  <div className="min-w-0">
                    <p className="text-sm text-white font-medium truncate">{inc.description}</p>
                    <span className="text-xs text-slate-500">
                      {format(new Date(inc.created_at), 'dd MMM', { locale: es })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                    <span className="text-sm font-semibold text-emerald-400">+{formatCOP(inc.amount)}</span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300"
                      onClick={() => setDeleteItem({ id: inc.id, type: 'income' })}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-[#2a2a38] flex justify-between">
            <span className="text-sm text-slate-400">Total ingresos adicionales</span>
            <span className="text-sm font-bold text-emerald-400">{formatCOP(totalInc)}</span>
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
