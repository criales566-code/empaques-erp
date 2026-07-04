import { cn } from '@/lib/utils'
import Link from 'next/link'
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
    <div className={cn('flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-8 border-b border-[#ececec]', className)}>
      <div className="min-w-0">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-2 mb-4 text-[13px] font-medium text-neutral-500">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && <span className="text-neutral-300">/</span>}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="hover:text-neutral-900 transition-colors underline decoration-neutral-200 decoration-1 underline-offset-4 hover:decoration-neutral-900"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-neutral-900">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h1 className="text-[36px] sm:text-[44px] lg:text-[52px] font-semibold text-neutral-900 tracking-[-0.03em] leading-[1] break-words">{title}</h1>
        {description && (
          <p className="text-[15px] text-neutral-500 mt-4 max-w-xl">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">{actions}</div>
      )}
    </div>
  )
}
