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
    <header className="h-14 shrink-0 border-b border-slate-200 bg-white flex items-center gap-3 px-4 md:px-6 sticky top-0 z-30">
      <button
        onClick={onMenuClick}
        className="lg:hidden -ml-1 p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      <p className="text-[15px] font-semibold text-slate-900 flex-1 truncate">{currentLabel}</p>

      <div className="flex items-center gap-1">
        <button className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
          <Bell className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-slate-200 mx-2" />
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[12px] text-slate-500 hidden sm:block">En línea</span>
        </div>
      </div>
    </header>
  )
}
