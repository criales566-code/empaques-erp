import { getProducts } from '@/lib/actions/products'
import { SaleForm } from '@/components/sales/SaleForm'
import { PageHeader } from '@/components/ui/page-header'

export const dynamic = 'force-dynamic'

export default async function NewSalePage() {
  const products = await getProducts().catch(() => [])
  const availableProducts = products.filter(p => p.stock > 0)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nueva venta"
        description="Registra una venta y actualiza el inventario automáticamente"
        breadcrumbs={[
          { label: 'Ventas', href: '/sales' },
          { label: 'Nueva venta' },
        ]}
      />
      <SaleForm products={availableProducts} />
    </div>
  )
}
