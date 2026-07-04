import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Sparkline } from './Sparkline'

type ColorKey = 'indigo' | 'emerald' | 'amber' | 'violet' | 'red' | 'blue' | 'slate'

interface StatsCardProps {
  title: string
  value: string
  subtitle?: string
  icon: LucideIcon
  color: ColorKey
  trendPct?: number | null
  sparklineData?: number[]
}

const colorMap: Record<ColorKey, { iconBg: string; iconColor: string; sparkColor: string; accent: string }> = {
  indigo:  { iconBg: 'bg-indigo-50',  iconColor: 'text-indigo-600',  sparkColor: '#6366f1', accent: 'bg-indigo-500' },
  emerald: { iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600', sparkColor: '#10b981', accent: 'bg-emerald-500' },
  amber:   { iconBg: 'bg-amber-50',   iconColor: 'text-amber-600',   sparkColor: '#f59e0b', accent: 'bg-amber-500' },
  violet:  { iconBg: 'bg-violet-50',  iconColor: 'text-violet-600',  sparkColor: '#8b5cf6', accent: 'bg-violet-500' },
  red:     { iconBg: 'bg-red-50',     iconColor: 'text-red-600',     sparkColor: '#ef4444', accent: 'bg-red-500' },
  blue:    { iconBg: 'bg-blue-50',    iconColor: 'text-blue-600',    sparkColor: '#3b82f6', accent: 'bg-blue-500' },
  slate:   { iconBg: 'bg-slate-100',  iconColor: 'text-slate-600',   sparkColor: '#64748b', accent: 'bg-slate-400' },
}

export function StatsCard({ title, value, subtitle, icon: Icon, color, trendPct, sparklineData }: StatsCardProps) {
  const c = colorMap[color]
  const trendDir: 'up' | 'down' | 'flat' =
    trendPct == null ? 'flat' : trendPct > 0.5 ? 'up' : trendPct < -0.5 ? 'down' : 'flat'
  const TrendIcon = trendDir === 'up' ? TrendingUp : trendDir === 'down' ? TrendingDown : Minus

  return (
    <div className="relative bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md hover:border-slate-300 transition-all duration-150 group">
      {/* Top color accent */}
      <div className={cn('h-1 w-full', c.accent)} />

      <div className="p-5">
        {/* Header: label + icon */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <p className="text-[13px] font-semibold text-slate-600 leading-tight">{title}</p>
          <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', c.iconBg)}>
            <Icon className={cn('w-[18px] h-[18px]', c.iconColor)} />
          </div>
        </div>

        {/* Value XL */}
        <p className="text-[26px] font-bold text-slate-900 tracking-tight leading-tight tabular-nums break-words">
          {value}
        </p>

        {/* Trend + subtitle */}
        <div className="flex items-center gap-2 mt-2 mb-4 flex-wrap min-h-[22px]">
          {trendPct != null && (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 text-[12px] font-bold px-1.5 py-0.5 rounded-md tabular-nums',
                trendDir === 'up' && 'bg-emerald-50 text-emerald-700',
                trendDir === 'down' && 'bg-red-50 text-red-700',
                trendDir === 'flat' && 'bg-slate-100 text-slate-600'
              )}
            >
              <TrendIcon className="w-3 h-3" />
              {trendDir === 'flat' ? '0%' : `${trendPct > 0 ? '+' : ''}${trendPct.toFixed(1)}%`}
            </span>
          )}
          {subtitle && (
            <p className="text-[12px] text-slate-500 truncate">{subtitle}</p>
          )}
        </div>

        {/* Sparkline */}
        {sparklineData && sparklineData.length > 1 && (
          <div className="-mx-1">
            <Sparkline data={sparklineData} color={c.sparkColor} height={40} />
          </div>
        )}
      </div>
    </div>
  )
}
