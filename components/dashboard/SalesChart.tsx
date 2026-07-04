'use client'

import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import type { Sale, Expense } from '@/lib/types'
import { formatCOPCompact } from '@/lib/utils/currency'
import { format, startOfMonth, eachMonthOfInterval, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'

interface SalesChartProps {
  sales: Sale[]
  expenses: Expense[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xl">
        <p className="text-slate-900 font-semibold text-[14px] mb-2">{label}</p>
        {payload.map((entry: any) => (
          <p key={entry.name} className="text-[13px] font-medium flex items-center gap-2" style={{ color: entry.color }}>
            <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            {entry.name}: <span className="font-bold">{formatCOPCompact(entry.value)}</span>
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function SalesChart({ sales, expenses }: SalesChartProps) {
  const data = useMemo(() => {
    const now = new Date()
    const months = eachMonthOfInterval({
      start: subMonths(startOfMonth(now), 5),
      end: startOfMonth(now),
    })

    return months.map(month => {
      const monthKey = format(month, 'yyyy-MM')
      const monthLabel = format(month, 'MMM', { locale: es })

      const ventas = sales
        .filter(s => format(new Date(s.created_at), 'yyyy-MM') === monthKey)
        .reduce((acc, s) => acc + s.total, 0)

      const gastos = expenses
        .filter(e => format(new Date(e.created_at), 'yyyy-MM') === monthKey)
        .reduce((acc, e) => acc + e.amount, 0)

      const utilidad = ventas - gastos

      return {
        mes: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
        Ventas: ventas,
        Gastos: gastos,
        Utilidad: utilidad,
      }
    })
  }, [sales, expenses])

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="h-1 w-full bg-indigo-500" />
      <div className="p-6">
        <div className="flex items-baseline justify-between mb-6 gap-3 flex-wrap">
          <h3 className="text-[16px] font-semibold text-slate-900">Ventas vs Gastos</h3>
          <span className="text-[12px] font-medium text-slate-500">Últimos 6 meses</span>
        </div>
        <div className="w-full h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={6} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="mes"
                tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
                dy={5}
              />
              <YAxis
                tickFormatter={v => formatCOPCompact(v)}
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={70}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.06)' }} />
              <Legend
                wrapperStyle={{ fontSize: '13px', color: '#475569', paddingTop: '16px', fontWeight: 500 }}
                iconType="circle"
              />
              <Bar dataKey="Ventas" fill="#6366f1" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Gastos" fill="#ef4444" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Utilidad" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
