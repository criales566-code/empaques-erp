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
          className="fixed inset-0 z-40 bg-black/20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full flex flex-col bg-white transition-all duration-300 ease-out shrink-0 w-[220px]',
          'lg:relative lg:z-auto lg:translate-x-0 lg:border-r lg:border-[#ececec]',
          open ? 'translate-x-0 shadow-xl lg:shadow-none' : '-translate-x-full'
        )}
      >
        {/* Logo — minimalist dots */}
        <div className="h-20 flex items-center justify-between px-6 shrink-0">
          <Link href="/" className="flex items-center gap-2" aria-label="Empaques Jheimy">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-900" />
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-900" />
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-900" />
            </div>
            <span className="text-[13px] font-semibold text-neutral-900 tracking-tight">
              Jheimy
            </span>
          </Link>
          <button
            onClick={onClose}
            aria-label="Cerrar menú"
            className="lg:hidden p-1.5 rounded text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation — pure text, no background pills */}
        <nav className="flex-1 px-6 py-2 space-y-0.5 overflow-y-auto">
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
                className={cn(
                  'group flex items-center gap-3 h-10 text-[14px] transition-colors',
                  isActive
                    ? 'text-neutral-900 font-semibold'
                    : 'text-neutral-500 hover:text-neutral-900 font-medium'
                )}
              >
                <Icon className={cn(
                  'w-[16px] h-[16px] shrink-0 transition-colors',
                  isActive ? 'text-neutral-900' : 'text-neutral-400 group-hover:text-neutral-900'
                )} />
                <span className="truncate">{item.label}</span>
                {isActive && <span className="ml-auto w-1 h-1 rounded-full bg-neutral-900" />}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="shrink-0 px-6 py-6 space-y-4">
          <div className="divider" />

          {userEmail && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                <span className="text-neutral-900 text-[11px] font-semibold tracking-tight">{userInitials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-neutral-900 truncate leading-tight">{userEmail}</p>
                <p className="text-[11px] text-neutral-500 mt-0.5">Administrador</p>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 h-8 text-[13px] font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  )
}
