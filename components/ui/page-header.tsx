import { cn } from '@/lib/utils'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { ReactNode } from 'react'

interface Breadcrumb {
  label: string
  href?: string
}

interface PageHeaderProps {
  title: string
  description?: string
  breadcrumbs?: Breadcrumb[]
  actions?: ReactNode
  className?: string
}

export function PageHeader({ title, description, breadcrumbs, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-center justify-between gap-4', className)}>
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1 mb-2.5">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="text-[13px] font-medium text-slate-500 hover:text-slate-900 transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-[13px] font-medium text-slate-500">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{title}</h1>
        {description && (
          <p className="text-[14px] text-slate-600 mt-1.5">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2.5 shrink-0">{actions}</div>
      )}
    </div>
  )
}
