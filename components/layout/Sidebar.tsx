'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  DollarSign,
  ScanBarcode,
  FileText,
  LogOut,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/inventory', label: 'Inventario', icon: Package },
  { href: '/sales', label: 'Ventas', icon: ShoppingCart },
  { href: '/finances', label: 'Finanzas', icon: DollarSign },
  { href: '/scanner', label: 'Escáner', icon: ScanBarcode },
  { href: '/reports', label: 'Reportes', icon: FileText },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [userEmail, setUserEmail] = useState<string>('')
  const [userInitials, setUserInitials] = useState<string>('U')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        const email = data.user.email ?? ''
        const fullName = data.user.user_metadata?.full_name as string | undefined
        setUserEmail(email)
        if (fullName) {
          const parts = fullName.trim().split(' ')
          setUserInitials(parts.length >= 2
            ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
            : fullName.slice(0, 2).toUpperCase()
          )
        } else if (email) {
          setUserInitials(email.slice(0, 2).toUpperCase())
        }
      }
    })
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full flex flex-col transition-all duration-300 bg-slate-900',
          'lg:relative lg:z-auto lg:translate-x-0',
          collapsed ? 'w-16' : 'w-60',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className={cn(
          'flex items-center gap-3 px-4 py-4 border-b border-white/10',
          collapsed && 'justify-center px-2'
        )}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-md">
            <span className="text-white font-bold text-xs">EJ</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm leading-none truncate">Empaques Jheimy</p>
              <p className="text-slate-400 text-xs mt-0.5">ERP Sistema</p>
            </div>
          )}
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href))
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                title={collapsed ? item.label : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 group',
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40'
                    : 'text-slate-400 hover:bg-white/10 hover:text-white',
                  collapsed && 'justify-center px-2'
                )}
              >
                <Icon className={cn('w-5 h-5 flex-shrink-0', isActive ? 'text-white' : 'text-slate-500 group-hover:text-white')} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="border-t border-white/10 p-2 space-y-1">
          {/* User info (when expanded) */}
          {!collapsed && userEmail && (
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-white/5 mb-1">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[10px] font-bold">{userInitials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-medium truncate">{userEmail}</p>
                <p className="text-slate-500 text-[10px]">Administrador</p>
              </div>
            </div>
          )}

          {/* Collapse button — desktop only */}
          <button
            onClick={() => setCollapsed(v => !v)}
            className="hidden lg:flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs text-slate-500 hover:bg-white/10 hover:text-white transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /><span>Colapsar</span></>}
          </button>

          <button
            onClick={handleLogout}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-400 hover:bg-red-500/15 hover:text-red-400 transition-colors',
              collapsed && 'justify-center px-2'
            )}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
