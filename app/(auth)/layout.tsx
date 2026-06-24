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

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <span className="text-white font-bold text-xl">EJ</span>
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-none">Empaques Jheimy</p>
              <p className="text-indigo-200 text-sm">Sistema ERP</p>
            </div>
          </div>
        </div>

        {/* Main copy */}
        <div className="relative z-10 space-y-6">
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight">
              Gestiona tu negocio<br />con claridad total
            </h2>
            <p className="text-indigo-200 mt-3 text-base leading-relaxed">
              Inventario, ventas y finanzas en un solo lugar. Todo lo que necesitas para crecer.
            </p>
          </div>

          {/* Feature pills */}
          <div className="space-y-3">
            {[
              { icon: Package, text: 'Control de inventario en tiempo real' },
              { icon: ShoppingCart, text: 'Registro de ventas con escaneo de código' },
              { icon: TrendingUp, text: 'Análisis de utilidades y gastos' },
              { icon: BarChart3, text: 'Reportes PDF descargables' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-indigo-100 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10">
          <p className="text-indigo-300 text-xs">© 2025 Empaques Jheimy · Todos los derechos reservados</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-white">
        {/* Mobile logo */}
        <div className="lg:hidden text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-3 shadow-lg shadow-indigo-200">
            <span className="text-white font-bold text-xl">EJ</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Empaques Jheimy</h1>
          <p className="text-slate-500 text-sm">Sistema ERP</p>
        </div>

        <div className="w-full max-w-sm">
          {children}
        </div>
      </div>
    </div>
  )
}
