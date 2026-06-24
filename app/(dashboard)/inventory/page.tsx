import Link from 'next/link'
import { getProducts } from '@/lib/actions/products'
import { ProductsTable } from '@/components/inventory/ProductsTable'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import { calculateInventoryValue, getOutOfStock, getLowStock } from '@/lib/utils/calculations'
import { formatCOP } from '@/lib/utils/currency'
import { Plus, Package, PackageX, AlertTriangle, DollarSign } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function InventoryPage() {
  const products = await getProducts().catch(() => [])
  const inventoryValue = calculateInventoryValue(products)
  const outOfStock = getOutOfStock(products)
  const lowStock = getLowStock(products)

  const summaryCards = [
    {
      label: 'Valor total',
      value: formatCOP(inventoryValue),
      icon: DollarSign,
      accent: 'bg-amber-500',
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      valueColor: 'text-amber-700',
    },
    {
      label: 'Total productos',
      value: products.length.toString(),
      icon: Package,
      accent: 'bg-indigo-500',
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      valueColor: 'text-slate-900',
    },
    {
      label: 'Stock bajo',
      value: lowStock.length.toString(),
      icon: AlertTriangle,
      accent: 'bg-amber-400',
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      valueColor: lowStock.length > 0 ? 'text-amber-700' : 'text-slate-900',
    },
    {
      label: 'Agotados',
      value: outOfStock.length.toString(),
      icon: PackageX,
      accent: 'bg-red-500',
      iconBg: 'bg-red-50',
      iconColor: 'text-red-600',
      valueColor: outOfStock.length > 0 ? 'text-red-700' : 'text-slate-900',
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventario"
        description={`${products.length} productos registrados`}
        actions={
          <Link href="/inventory/new">
            <Button>
              <Plus className="w-4 h-4" />
              Nuevo producto
            </Button>
          </Link>
        }
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {summaryCards.map(card => {
          const Icon = card.icon
          return (
            <div key={card.label} className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex">
              <div className={`w-1 flex-shrink-0 ${card.accent}`} />
              <div className="flex-1 p-4">
                <div className={`w-8 h-8 rounded-lg ${card.iconBg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-4 h-4 ${card.iconColor}`} />
                </div>
                <p className={`text-xl font-bold ${card.valueColor}`}>{card.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{card.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      <ProductsTable products={products} />
    </div>
  )
}
