import { ScanBarcode, PackageCheck, PackageX, Clock } from 'lucide-react'

interface Props {
  total: number
  found: number
  notFound: number
  sessionMinutes: number
}

export function ScannerKpiCards({ total, found, notFound, sessionMinutes }: Props) {
  const cards = [
    {
      label: 'Escaneados hoy',
      value: total,
      suffix: '',
      icon: ScanBarcode,
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      description: total === 1 ? '1 escaneo' : `${total} escaneos`,
    },
    {
      label: 'Encontrados',
      value: found,
      suffix: '',
      icon: PackageCheck,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      description: total > 0 ? `${Math.round((found / total) * 100)}% del total` : 'Sin escaneos aún',
    },
    {
      label: 'No encontrados',
      value: notFound,
      suffix: '',
      icon: PackageX,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      description: notFound > 0 ? 'Pendientes de crear' : 'Sin pendientes',
    },
    {
      label: 'Sesión activa',
      value: sessionMinutes,
      suffix: 'min',
      icon: Clock,
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-500',
      description: 'Tiempo desde que iniciaste',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.label}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow duration-150"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-500 truncate">{card.label}</p>
                <div className="flex items-baseline gap-1 mt-1.5">
                  <span className="text-2xl font-bold text-slate-900 tabular-nums leading-none">
                    {card.value}
                  </span>
                  {card.suffix && (
                    <span className="text-sm text-slate-400 font-medium">{card.suffix}</span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1 truncate">{card.description}</p>
              </div>
              <div
                className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center shrink-0`}
              >
                <Icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
