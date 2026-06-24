import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string
  description?: string
  icon: LucideIcon
  color: 'indigo' | 'emerald' | 'amber' | 'red' | 'blue'
  trend?: 'up' | 'down' | 'neutral'
}

const iconStyles: Record<string, string> = {
  indigo: 'bg-indigo-50 text-indigo-500',
  emerald: 'bg-emerald-50 text-emerald-500',
  amber: 'bg-amber-50 text-amber-500',
  red: 'bg-red-50 text-red-500',
  blue: 'bg-blue-50 text-blue-500',
}

export function StatsCard({ title, value, description, icon: Icon, color, trend }: StatsCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all duration-150 cursor-default">
      {/* Top row */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <p className="text-sm font-medium text-slate-500 leading-snug">{title}</p>
        <div
          className={cn(
            'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
            iconStyles[color]
          )}
        >
          <Icon className="w-[18px] h-[18px]" />
        </div>
      </div>

      {/* Value */}
      <p className="text-[28px] font-bold text-slate-900 tracking-tight leading-none mb-2.5">
        {value}
      </p>

      {/* Bottom row */}
      <div className="flex items-center gap-2">
        {trend && trend !== 'neutral' && (
          <span
            className={cn(
              'inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full',
              trend === 'up' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
            )}
          >
            {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          </span>
        )}
        {description && (
          <p className="text-xs text-slate-400 truncate">{description}</p>
        )}
      </div>
    </div>
  )
}
