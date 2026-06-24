'use client'

import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  onMenuClick: () => void
  title?: string
}

export function Header({ onMenuClick, title }: HeaderProps) {
  return (
    <header className="h-14 border-b border-slate-200 bg-white/80 backdrop-blur-sm flex items-center gap-4 px-4 sticky top-0 z-30">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="w-5 h-5" />
      </Button>

      <div className="flex-1">
        {title && <h1 className="text-sm font-medium text-slate-700">{title}</h1>}
      </div>

      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs text-slate-500 hidden sm:block">Sistema activo</span>
      </div>
    </header>
  )
}
