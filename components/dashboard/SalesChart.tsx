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
      <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-lg">
        <p className="text-slate-900 font-medium text-sm mb-2">{label}</p>
        {payload.map((entry: any) => (
          <p key={entry.name} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: {formatCOPCompact(entry.value)}
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
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900 mb-4">Ventas vs Gastos (6 meses)</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="mes"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={v => formatCOPCompact(v)}
            tick={{ fill: '#94a3b8', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={70}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.04)' }} />
          <Legend
            wrapperStyle={{ fontSize: '11px', color: '#64748b', paddingTop: '12px' }}
          />
          <Bar dataKey="Ventas" fill="#6366f1" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Gastos" fill="#ef4444" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Utilidad" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
