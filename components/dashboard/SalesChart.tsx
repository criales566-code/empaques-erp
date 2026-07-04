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
    <div className="h-full">
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} barGap={8} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ececec" vertical={false} />
          <XAxis
            dataKey="mes"
            tick={{ fill: '#737373', fontSize: 12, fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
            dy={8}
          />
          <YAxis
            tickFormatter={v => formatCOPCompact(v)}
            tick={{ fill: '#a3a3a3', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={70}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
          <Legend
            wrapperStyle={{ fontSize: '13px', color: '#737373', paddingTop: '20px', fontWeight: 500 }}
            iconType="circle"
            iconSize={8}
          />
          <Bar dataKey="Ventas" fill="#0a0a0a" radius={[2, 2, 0, 0]} />
          <Bar dataKey="Gastos" fill="#d4d4d4" radius={[2, 2, 0, 0]} />
          <Bar dataKey="Utilidad" fill="#737373" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
