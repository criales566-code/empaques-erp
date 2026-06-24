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
  indigo: {
    gradient: 'from-indigo-500 to-indigo-600',
    light: 'bg-indigo-50',
    text: 'text-indigo-600',
    badge: 'bg-indigo-100 text-indigo-700',
    ring: 'ring-indigo-100',
  },
  emerald: {
    gradient: 'from-emerald-500 to-emerald-600',
    light: 'bg-emerald-50',
    text: 'text-emerald-600',
    badge: 'bg-emerald-100 text-emerald-700',
    ring: 'ring-emerald-100',
  },
  amber: {
    gradient: 'from-amber-500 to-orange-500',
    light: 'bg-amber-50',
    text: 'text-amber-600',
    badge: 'bg-amber-100 text-amber-700',
    ring: 'ring-amber-100',
  },
  red: {
    gradient: 'from-red-500 to-rose-600',
    light: 'bg-red-50',
    text: 'text-red-600',
    badge: 'bg-red-100 text-red-700',
    ring: 'ring-red-100',
  },
  blue: {
    gradient: 'from-blue-500 to-blue-600',
    light: 'bg-blue-50',
    text: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-700',
    ring: 'ring-blue-100',
  },
}

export function StatsCard({ title, value, description, icon: Icon, color, trend }: StatsCardProps) {
  const c = colorMap[color]

  return (
    <div className={cn(
      'rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 p-5 cursor-default group ring-4 ring-transparent hover:ring-4',
      `hover:${c.ring}`
    )}>
      <div className="flex items-start justify-between mb-5">
        <div className={cn('w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-sm', c.gradient)}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && trend !== 'neutral' && (
          <div className={cn(
            'flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full',
            trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
          )}>
            {trend === 'up'
              ? <TrendingUp className="w-3 h-3" />
              : <TrendingDown className="w-3 h-3" />
            }
            {trend === 'up' ? 'Activo' : 'Bajo'}
          </div>
        )}
      </div>

      <p className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none">{value}</p>
      <p className="text-sm font-medium text-slate-500 mt-2">{title}</p>
      {description && (
        <p className="text-xs text-slate-400 mt-1">{description}</p>
      )}
    </div>
  )
}
