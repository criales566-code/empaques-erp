import { ProductForm } from '@/components/inventory/ProductForm'

export default function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ barcode?: string }>
}) {
  return <NewProductPageClient searchParams={searchParams} />
}

async function NewProductPageClient({
  searchParams,
}: {
  searchParams: Promise<{ barcode?: string }>
}) {
  const params = await searchParams
  return <ProductForm defaultBarcode={params.barcode} />
}
