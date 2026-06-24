import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Package, TrendingUp, ShoppingCart, BarChart3 } from 'lucide-react'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/')
  }

  const features = [
    { icon: Package,     text: 'Control de inventario en tiempo real' },
    { icon: ShoppingCart,text: 'Registro de ventas con escáner' },
    { icon: TrendingUp,  text: 'Análisis de utilidades y gastos' },
    { icon: BarChart3,   text: 'Reportes PDF descargables' },
  ]

  return (
    <div className="min-h-screen flex">
      {/* Left panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-[420px] xl:w-[480px] flex-shrink-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 flex-col justify-between p-10 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/5 rounded-full pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <span className="text-white font-bold text-base">EJ</span>
          </div>
          <div>
            <p className="text-white font-bold text-base leading-none">Empaques Jheimy</p>
            <p className="text-indigo-200 text-sm">Sistema ERP</p>
          </div>
        </div>

        {/* Copy */}
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-white leading-snug">
              Gestiona tu negocio<br />con claridad
            </h2>
            <p className="text-indigo-200 mt-3 text-sm leading-relaxed">
              Inventario, ventas y finanzas en un solo lugar.
            </p>
          </div>
          <div className="space-y-3">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-indigo-100 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-indigo-400 text-xs">© 2025 Empaques Jheimy</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50">
        {/* Mobile logo */}
        <div className="lg:hidden text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-3">
            <span className="text-white font-bold text-lg">EJ</span>
          </div>
          <h1 className="text-lg font-bold text-slate-900">Empaques Jheimy</h1>
          <p className="text-slate-500 text-sm">Sistema ERP</p>
        </div>
        <div className="w-full max-w-sm">
          {children}
        </div>
      </div>
    </div>
  )
}
