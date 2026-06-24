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
    border: 'border-indigo-100',
    icon: 'text-indigo-600',
    iconBg: 'bg-indigo-50',
    glow: 'shadow-indigo-100',
  },
  emerald: {
    border: 'border-emerald-100',
    icon: 'text-emerald-600',
    iconBg: 'bg-emerald-50',
    glow: 'shadow-emerald-100',
  },
  amber: {
    border: 'border-amber-100',
    icon: 'text-amber-600',
    iconBg: 'bg-amber-50',
    glow: 'shadow-amber-100',
  },
  red: {
    border: 'border-red-100',
    icon: 'text-red-600',
    iconBg: 'bg-red-50',
    glow: 'shadow-red-100',
  },
  blue: {
    border: 'border-blue-100',
    icon: 'text-blue-600',
    iconBg: 'bg-blue-50',
    glow: 'shadow-blue-100',
  },
}

export function StatsCard({ title, value, description, icon: Icon, color, trend }: StatsCardProps) {
  const colors = colorMap[color]
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
  const trendColor = trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-red-500' : 'text-slate-400'

  return (
    <div className={cn(
      'rounded-xl border p-5 bg-white transition-all duration-200 hover:scale-[1.02] hover:shadow-md cursor-default shadow-sm',
      colors.border,
      colors.glow
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className={cn('p-2.5 rounded-lg', colors.iconBg)}>
          <Icon className={cn('w-5 h-5', colors.icon)} />
        </div>
        <TrendIcon className={cn('w-4 h-4', trendColor)} />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
        <p className="text-xs font-medium text-slate-500 mt-1">{title}</p>
        {description && (
          <p className="text-xs text-slate-400 mt-1">{description}</p>
        )}
      </div>
    </div>
  )
}
