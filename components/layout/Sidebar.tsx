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
          setUserInitials(
            parts.length >= 2
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
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-[2px] lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ease-out shrink-0',
          'lg:relative lg:z-auto lg:translate-x-0',
          collapsed ? 'w-[68px]' : 'w-[240px]',
          open ? 'translate-x-0 shadow-2xl lg:shadow-none' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            'h-16 flex items-center border-b border-slate-100 shrink-0',
            collapsed ? 'justify-center px-0' : 'px-4 gap-3'
          )}
        >
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
            <span className="text-white text-[12px] font-bold tracking-tight">EJ</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-slate-900 truncate leading-tight">
                Empaques Jheimy
              </p>
              <p className="text-[12px] text-slate-500 mt-0.5">ERP Sistema</p>
            </div>
          )}
          <button
            onClick={onClose}
            aria-label="Cerrar menú"
            className="lg:hidden ml-auto p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href))
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                title={collapsed ? item.label : undefined}
                className={cn(
                  'flex items-center gap-3 h-10 rounded-lg text-[14px] font-medium transition-all duration-150',
                  collapsed ? 'justify-center px-0 w-full' : 'px-3',
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                <Icon className="w-[18px] h-[18px] shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="shrink-0 border-t border-slate-100 p-2 space-y-1">
          {/* User info */}
          {userEmail && (
            <div
              className={cn(
                'flex items-center gap-3 rounded-lg py-2 cursor-default',
                collapsed ? 'justify-center px-0' : 'px-2'
              )}
            >
              <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center shrink-0">
                <span className="text-white text-[11px] font-bold">{userInitials}</span>
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-slate-900 truncate leading-tight">{userEmail}</p>
                  <p className="text-[12px] text-slate-500 mt-0.5">Administrador</p>
                </div>
              )}
            </div>
          )}

          {/* Collapse toggle — desktop only */}
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="hidden lg:flex w-full items-center gap-3 h-9 rounded-lg text-[13px] font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors px-2"
            title={collapsed ? 'Expandir' : 'Colapsar'}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Colapsar</span>
              </>
            )}
          </button>

          <button
            onClick={handleLogout}
            className={cn(
              'flex w-full items-center gap-3 h-9 rounded-lg text-[13px] font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors',
              collapsed ? 'justify-center px-0' : 'px-2'
            )}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
