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
    bg: 'bg-indigo-600/10',
    border: 'border-indigo-500/20',
    icon: 'text-indigo-400',
    iconBg: 'bg-indigo-500/10',
    glow: 'shadow-indigo-500/10',
  },
  emerald: {
    bg: 'bg-emerald-600/5',
    border: 'border-emerald-500/20',
    icon: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10',
    glow: 'shadow-emerald-500/10',
  },
  amber: {
    bg: 'bg-amber-600/5',
    border: 'border-amber-500/20',
    icon: 'text-amber-400',
    iconBg: 'bg-amber-500/10',
    glow: 'shadow-amber-500/10',
  },
  red: {
    bg: 'bg-red-600/5',
    border: 'border-red-500/20',
    icon: 'text-red-400',
    iconBg: 'bg-red-500/10',
    glow: 'shadow-red-500/10',
  },
  blue: {
    bg: 'bg-blue-600/5',
    border: 'border-blue-500/20',
    icon: 'text-blue-400',
    iconBg: 'bg-blue-500/10',
    glow: 'shadow-blue-500/10',
  },
}

export function StatsCard({ title, value, description, icon: Icon, color, trend }: StatsCardProps) {
  const colors = colorMap[color]
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
  const trendColor = trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-slate-500'

  return (
    <div className={cn(
      'rounded-xl border p-5 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg cursor-default',
      'bg-[#111118]',
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
        <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
        <p className="text-xs font-medium text-slate-400 mt-1">{title}</p>
        {description && (
          <p className="text-xs text-slate-500 mt-1">{description}</p>
        )}
      </div>
    </div>
  )
}
