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
      <div className="bg-[#1a1a24] border border-[#2a2a38] rounded-lg p-3 shadow-xl">
        <p className="text-white font-medium text-sm mb-2">{label}</p>
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
    <div className="rounded-xl border border-[#2a2a38] bg-[#111118] p-4">
      <h3 className="text-sm font-semibold text-white mb-4">Ventas vs Gastos (6 meses)</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a38" vertical={false} />
          <XAxis
            dataKey="mes"
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={v => formatCOPCompact(v)}
            tick={{ fill: '#64748b', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={70}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.05)' }} />
          <Legend
            wrapperStyle={{ fontSize: '11px', color: '#94a3b8', paddingTop: '12px' }}
          />
          <Bar dataKey="Ventas" fill="#6366f1" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Gastos" fill="#ef4444" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Utilidad" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
