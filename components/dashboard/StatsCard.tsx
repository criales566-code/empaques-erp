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
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 hover:shadow-md hover:border-slate-300 transition-all duration-150 cursor-default">
      {/* Top row */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <p className="text-[13px] font-semibold text-slate-600 uppercase tracking-wide leading-snug">{title}</p>
        <div
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
            iconStyles[color]
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {/* Value */}
      <p className="text-[26px] sm:text-[30px] font-bold text-slate-900 tracking-tight leading-tight mb-3 break-words">
        {value}
      </p>

      {/* Bottom row */}
      <div className="flex items-center gap-2 flex-wrap">
        {trend && trend !== 'neutral' && (
          <span
            className={cn(
              'inline-flex items-center gap-1 text-[12px] font-semibold px-2 py-0.5 rounded-full shrink-0',
              trend === 'up' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
            )}
          >
            {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          </span>
        )}
        {description && (
          <p className="text-[13px] text-slate-500 truncate">{description}</p>
        )}
      </div>
    </div>
  )
}
