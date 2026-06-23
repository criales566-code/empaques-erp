import Link from 'next/link'
import { getProducts } from '@/lib/actions/products'
import { ProductsTable } from '@/components/inventory/ProductsTable'
import { Button } from '@/components/ui/button'
import { calculateInventoryValue, getOutOfStock, getLowStock } from '@/lib/utils/calculations'
import { formatCOP } from '@/lib/utils/currency'
import { Plus, Package, PackageX, AlertTriangle, DollarSign } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function InventoryPage() {
  const products = await getProducts().catch(() => [])
  const inventoryValue = calculateInventoryValue(products)
  const outOfStock = getOutOfStock(products)
  const lowStock = getLowStock(products)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Inventario</h1>
          <p className="text-slate-400 text-sm mt-1">{products.length} productos registrados</p>
        </div>
        <Link href="/inventory/new">
          <Button>
            <Plus className="w-4 h-4" />
            Nuevo producto
          </Button>
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl border border-[#2a2a38] bg-[#111118] p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-slate-400">Valor total</span>
          </div>
          <p className="text-lg font-bold text-amber-400">{formatCOP(inventoryValue)}</p>
        </div>
        <div className="rounded-xl border border-[#2a2a38] bg-[#111118] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-4 h-4 text-indigo-400" />
            <span className="text-xs text-slate-400">Total productos</span>
          </div>
          <p className="text-lg font-bold text-white">{products.length}</p>
        </div>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-amber-400/70">Stock bajo</span>
          </div>
          <p className="text-lg font-bold text-amber-400">{lowStock.length}</p>
        </div>
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <PackageX className="w-4 h-4 text-red-400" />
            <span className="text-xs text-red-400/70">Agotados</span>
          </div>
          <p className="text-lg font-bold text-red-400">{outOfStock.length}</p>
        </div>
      </div>

      <ProductsTable products={products} />
    </div>
  )
}
