import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string
  description?: string
  icon: LucideIcon
  color: 'indigo' | 'emerald' | 'amber' | 'red' | 'blue'
  trend?: 'up' | 'down' | 'neutral'
}

export function StatsCard({ title, value, description, trend }: StatsCardProps) {
  return (
    <div className="py-6 border-t border-[#ececec]">
      {/* Label */}
      <p className="text-[12px] font-medium text-neutral-500 tracking-tight mb-4">
        {title}
      </p>

      {/* Value XXL */}
      <p className="tabular text-[36px] sm:text-[44px] font-semibold text-neutral-900 tracking-[-0.03em] leading-none mb-3 break-words">
        {value}
      </p>

      {/* Trend + description */}
      <div className="flex items-center gap-2 flex-wrap">
        {trend && trend !== 'neutral' && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 text-[13px] font-medium',
              trend === 'up' ? 'text-emerald-700' : 'text-red-700'
            )}
          >
            {trend === 'up' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
          </span>
        )}
        {description && (
          <p className="text-[13px] text-neutral-500 truncate">{description}</p>
        )}
      </div>
    </div>
  )
}
