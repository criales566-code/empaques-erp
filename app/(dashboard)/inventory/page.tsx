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

  const kpis = [
    {
      label: 'Valor del inventario',
      value: formatCOP(inventoryValue),
      icon: DollarSign,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-500',
      valueColor: 'text-slate-900',
    },
    {
      label: 'Total de productos',
      value: products.length.toString(),
      icon: Package,
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-500',
      valueColor: 'text-slate-900',
    },
    {
      label: 'Stock bajo',
      value: lowStock.length.toString(),
      icon: AlertTriangle,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-500',
      valueColor: lowStock.length > 0 ? 'text-amber-700' : 'text-slate-900',
    },
    {
      label: 'Sin stock',
      value: outOfStock.length.toString(),
      icon: PackageX,
      iconBg: 'bg-red-50',
      iconColor: 'text-red-500',
      valueColor: outOfStock.length > 0 ? 'text-red-600' : 'text-slate-900',
    },
  ]

  return (
    <div className="space-y-7">
      <PageHeader
        title="Inventario"
        description={`${products.length} producto${products.length !== 1 ? 's' : ''} registrado${products.length !== 1 ? 's' : ''}`}
        actions={
          <Link href="/inventory/new">
            <Button className="h-9 px-4 text-sm font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 border-0 shadow-none">
              <Plus className="w-4 h-4" />
              Nuevo producto
            </Button>
          </Link>
        }
      />

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <div
              key={kpi.label}
              className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all duration-150"
            >
              <div className="flex items-start justify-between gap-4 mb-5">
                <p className="text-sm font-medium text-slate-500 leading-snug">{kpi.label}</p>
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${kpi.iconBg}`}
                >
                  <Icon className={`w-[18px] h-[18px] ${kpi.iconColor}`} />
                </div>
              </div>
              <p className={`text-[28px] font-bold tracking-tight leading-none ${kpi.valueColor}`}>
                {kpi.value}
              </p>
            </div>
          )
        })}
      </div>

      <ProductsTable products={products} />
    </div>
  )
}
