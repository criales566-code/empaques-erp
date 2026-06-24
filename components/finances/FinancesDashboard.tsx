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
    { label: 'Ventas totales', value: totalSal, color: 'text-indigo-700', icon: TrendingUp, iconBg: 'bg-indigo-50', iconColor: 'text-indigo-600', accent: 'bg-indigo-500', isPercent: false },
    { label: 'Gastos totales', value: totalExp, color: 'text-red-700', icon: TrendingDown, iconBg: 'bg-red-50', iconColor: 'text-red-600', accent: 'bg-red-500', isPercent: false },
    { label: 'Ingresos extra', value: totalInc, color: 'text-blue-700', icon: ArrowUpRight, iconBg: 'bg-blue-50', iconColor: 'text-blue-600', accent: 'bg-blue-500', isPercent: false },
    { label: 'Utilidad neta', value: netProfit, color: netProfit >= 0 ? 'text-emerald-700' : 'text-red-700', icon: DollarSign, iconBg: netProfit >= 0 ? 'bg-emerald-50' : 'bg-red-50', iconColor: netProfit >= 0 ? 'text-emerald-600' : 'text-red-600', accent: netProfit >= 0 ? 'bg-emerald-500' : 'bg-red-500', isPercent: false },
    { label: 'Flujo de caja', value: netProfit, color: netProfit >= 0 ? 'text-emerald-700' : 'text-red-700', icon: ArrowUpRight, iconBg: 'bg-slate-100', iconColor: 'text-slate-500', accent: 'bg-slate-400', isPercent: false },
    { label: 'ROI', value: roi, color: roi >= 0 ? 'text-amber-700' : 'text-red-700', icon: PiggyBank, iconBg: 'bg-amber-50', iconColor: 'text-amber-600', accent: 'bg-amber-500', isPercent: true },
  ]

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpis.map(kpi => (
          <div key={kpi.label} className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex">
            <div className={`w-1 flex-shrink-0 ${kpi.accent}`} />
            <div className="flex-1 p-3">
              <div className={`w-7 h-7 rounded-lg ${kpi.iconBg} flex items-center justify-center mb-2`}>
                <kpi.icon className={`w-3.5 h-3.5 ${kpi.iconColor}`} />
              </div>
              <p className={`text-sm font-bold ${kpi.color}`}>
                {kpi.isPercent ? `${kpi.value.toFixed(1)}%` : formatCOP(kpi.value)}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{kpi.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Expenses */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-red-500" />
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
              <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
                <Receipt className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-sm font-medium text-slate-500">Sin gastos registrados</p>
                <p className="text-xs mt-0.5">Haz clic en &quot;Agregar&quot; para registrar uno</p>
              </div>
            ) : (
              expenses.map(exp => (
                <div key={exp.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100 group hover:bg-slate-100 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm text-slate-900 font-medium truncate">{exp.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="destructive" className="text-xs">
                        {EXPENSE_CATEGORY_LABELS[exp.category] || exp.category}
                      </Badge>
                      <span className="text-xs text-slate-400">
                        {format(new Date(exp.created_at), 'dd MMM', { locale: es })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                    <span className="text-sm font-semibold text-red-600">-{formatCOP(exp.amount)}</span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600"
                      onClick={() => setDeleteItem({ id: exp.id, type: 'expense' })}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between">
            <span className="text-sm text-slate-500">Total gastos</span>
            <span className="text-sm font-bold text-red-600">{formatCOP(totalExp)}</span>
          </div>
        </div>

        {/* Incomes */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <PiggyBank className="w-4 h-4 text-emerald-500" />
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
              <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
                <PiggyBank className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-sm font-medium text-slate-500">Sin ingresos adicionales</p>
                <p className="text-xs mt-0.5">Haz clic en &quot;Agregar&quot; para registrar uno</p>
              </div>
            ) : (
              incomes.map(inc => (
                <div key={inc.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100 group hover:bg-slate-100 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm text-slate-900 font-medium truncate">{inc.description}</p>
                    <span className="text-xs text-slate-400">
                      {format(new Date(inc.created_at), 'dd MMM', { locale: es })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                    <span className="text-sm font-semibold text-emerald-600">+{formatCOP(inc.amount)}</span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600"
                      onClick={() => setDeleteItem({ id: inc.id, type: 'income' })}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between">
            <span className="text-sm text-slate-500">Total ingresos adicionales</span>
            <span className="text-sm font-bold text-emerald-600">{formatCOP(totalInc)}</span>
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
