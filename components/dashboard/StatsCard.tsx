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

const colorMap = {
  indigo:  { gradient: 'from-indigo-500 to-indigo-600',  ring: 'hover:ring-indigo-100' },
  emerald: { gradient: 'from-emerald-500 to-emerald-600', ring: 'hover:ring-emerald-100' },
  amber:   { gradient: 'from-amber-500 to-orange-500',    ring: 'hover:ring-amber-100' },
  red:     { gradient: 'from-red-500 to-rose-600',        ring: 'hover:ring-red-100' },
  blue:    { gradient: 'from-blue-500 to-blue-600',       ring: 'hover:ring-blue-100' },
}

export function StatsCard({ title, value, description, icon: Icon, color, trend }: StatsCardProps) {
  const c = colorMap[color]

  return (
    <div className={cn(
      'rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 p-5 cursor-default ring-4 ring-transparent',
      c.ring
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-sm flex-shrink-0', c.gradient)}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend && trend !== 'neutral' && (
          <div className={cn(
            'flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0',
            trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
          )}>
            {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          </div>
        )}
      </div>

      <div className="min-w-0">
        <p className="text-xl font-bold text-slate-900 leading-tight truncate">{value}</p>
        <p className="text-xs font-semibold text-slate-400 mt-1.5 uppercase tracking-wide">{title}</p>
        {description && (
          <p className="text-xs text-slate-400 mt-0.5 truncate">{description}</p>
        )}
      </div>
    </div>
  )
}
