import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'
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
    icon: 'text-indigo-600',
    iconBg: 'bg-indigo-50',
    accent: 'bg-indigo-500',
  },
  emerald: {
    icon: 'text-emerald-600',
    iconBg: 'bg-emerald-50',
    accent: 'bg-emerald-500',
  },
  amber: {
    icon: 'text-amber-600',
    iconBg: 'bg-amber-50',
    accent: 'bg-amber-500',
  },
  red: {
    icon: 'text-red-600',
    iconBg: 'bg-red-50',
    accent: 'bg-red-500',
  },
  blue: {
    icon: 'text-blue-600',
    iconBg: 'bg-blue-50',
    accent: 'bg-blue-500',
  },
}

export function StatsCard({ title, value, description, icon: Icon, color, trend }: StatsCardProps) {
  const colors = colorMap[color]
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
  const trendColor = trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-red-500' : 'text-slate-300'

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200 cursor-default overflow-hidden flex">
      {/* Colored left accent bar */}
      <div className={cn('w-1 flex-shrink-0', colors.accent)} />

      <div className="flex-1 p-5">
        <div className="flex items-start justify-between mb-4">
          <div className={cn('p-2 rounded-lg', colors.iconBg)}>
            <Icon className={cn('w-4 h-4', colors.icon)} />
          </div>
          <TrendIcon className={cn('w-4 h-4 mt-0.5', trendColor)} />
        </div>

        <p className="text-[1.6rem] font-bold text-slate-900 tracking-tight leading-none">{value}</p>
        <p className="text-xs font-semibold text-slate-500 mt-2 uppercase tracking-wide">{title}</p>
        {description && (
          <p className="text-xs text-slate-400 mt-0.5">{description}</p>
        )}
      </div>
    </div>
  )
}
