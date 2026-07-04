'use client'

import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'

const routeLabels: Record<string, string> = {
  '/': 'Dashboard',
  '/inventory': 'Inventario',
  '/sales': 'Ventas',
  '/finances': 'Finanzas',
  '/scanner': 'Escáner',
  '/reports': 'Reportes',
}

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname()

  const currentLabel =
    Object.entries(routeLabels).find(
      ([route]) =>
        route === pathname || (route !== '/' && pathname.startsWith(route))
    )?.[1] ?? 'ERP'

  return (
    <header className="h-16 shrink-0 bg-white flex items-center gap-3 px-6 md:px-10 lg:hidden">
      <button
        onClick={onMenuClick}
        aria-label="Abrir menú"
        className="-ml-1 p-2 rounded text-neutral-500 hover:text-neutral-900 transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      <span className="text-[14px] font-medium text-neutral-900 flex-1 truncate">{currentLabel}</span>

      <span className="flex items-center gap-1.5">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neutral-900 opacity-40" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-neutral-900" />
        </span>
      </span>
    </header>
  )
}
