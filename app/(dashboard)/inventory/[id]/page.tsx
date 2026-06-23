import { notFound } from 'next/navigation'
import { getProductById } from '@/lib/actions/products'
import { ProductForm } from '@/components/inventory/ProductForm'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = await getProductById(id).catch(() => null)

  if (!product) notFound()

  return <ProductForm product={product} />
}
