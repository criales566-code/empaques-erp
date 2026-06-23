import { getProducts } from '@/lib/actions/products'
import { SaleForm } from '@/components/sales/SaleForm'

export const dynamic = 'force-dynamic'

export default async function NewSalePage() {
  const products = await getProducts().catch(() => [])
  const availableProducts = products.filter(p => p.stock > 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Nueva venta</h1>
        <p className="text-slate-400 text-sm mt-1">Registra una venta y actualiza el inventario automáticamente</p>
      </div>
      <SaleForm products={availableProducts} />
    </div>
  )
}
