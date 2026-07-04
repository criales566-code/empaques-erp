'use client'

import { usePathname } from 'next/navigation'
import { Menu, Bell } from 'lucide-react'

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
    <header className="sticky top-0 z-30 h-16 shrink-0 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-[1280px] h-full px-4 sm:px-6 lg:px-8 flex items-center gap-3">
        <button
          onClick={onMenuClick}
          aria-label="Abrir menú"
          className="lg:hidden -ml-1 p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h1 className="text-base font-semibold text-slate-900 flex-1 truncate">{currentLabel}</h1>

        <div className="flex items-center gap-2">
          <button
            aria-label="Notificaciones"
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <Bell className="w-[18px] h-[18px]" />
          </button>
          <div className="w-px h-5 bg-slate-200 mx-1" />
          <div className="flex items-center gap-2 pl-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[13px] font-medium text-slate-600 hidden sm:block">En línea</span>
          </div>
        </div>
      </div>
    </header>
  )
}
