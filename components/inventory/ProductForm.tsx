'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Product, ProductFormData } from '@/lib/types'
import { createProduct, updateProduct } from '@/lib/actions/products'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Save, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

const CATEGORIES = [
  'Empaques', 'Cajas', 'Bolsas', 'Cintas', 'Papel', 'Espuma',
  'Plástico', 'Cartón', 'Accesorios', 'Otros'
]

interface ProductFormProps {
  product?: Product
  defaultBarcode?: string
}

export function ProductForm({ product, defaultBarcode }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<ProductFormData>({
    name: product?.name ?? '',
    sku: product?.sku ?? '',
    barcode: product?.barcode ?? defaultBarcode ?? '',
    description: product?.description ?? '',
    category: product?.category ?? '',
    image_url: product?.image_url ?? '',
    cost_price: product?.cost_price ?? 0,
    sale_price: product?.sale_price ?? 0,
    stock: product?.stock ?? 0,
    minimum_stock: product?.minimum_stock ?? 5,
    supplier: product?.supplier ?? '',
  })

  function handleChange(field: keyof ProductFormData, value: string | number) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const margin = form.sale_price > 0 && form.cost_price > 0
    ? ((form.sale_price - form.cost_price) / form.sale_price * 100).toFixed(1)
    : '0'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error('El nombre del producto es requerido')
      return
    }
    setLoading(true)
    try {
      if (product) {
        await updateProduct(product.id, form)
        toast.success('Producto actualizado')
      } else {
        await createProduct(form)
        toast.success('Producto creado exitosamente')
      }
      router.push('/inventory')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/inventory">
          <Button type="button" variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">
            {product ? 'Editar producto' : 'Nuevo producto'}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {product ? `Editando: ${product.name}` : 'Completa los datos del producto'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-[#2a2a38] bg-[#111118] p-4 space-y-4">
            <h2 className="text-sm font-semibold text-white border-b border-[#2a2a38] pb-2">Información básica</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="name">Nombre del producto *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={e => handleChange('name', e.target.value)}
                  placeholder="Ej: Caja de cartón 30x20x15"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={form.sku ?? ''}
                  onChange={e => handleChange('sku', e.target.value)}
                  placeholder="EJ-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="barcode">Código de barras</Label>
                <Input
                  id="barcode"
                  value={form.barcode ?? ''}
                  onChange={e => handleChange('barcode', e.target.value)}
                  placeholder="7890000000000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <select
                  id="category"
                  value={form.category ?? ''}
                  onChange={e => handleChange('category', e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-[#2a2a38] bg-[#111118] px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  <option value="">Sin categoría</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier">Proveedor</Label>
                <Input
                  id="supplier"
                  value={form.supplier ?? ''}
                  onChange={e => handleChange('supplier', e.target.value)}
                  placeholder="Nombre del proveedor"
                />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <textarea
                  id="description"
                  value={form.description ?? ''}
                  onChange={e => handleChange('description', e.target.value)}
                  placeholder="Descripción del producto..."
                  rows={3}
                  className="flex w-full rounded-lg border border-[#2a2a38] bg-[#111118] px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="image_url">URL de imagen</Label>
                <Input
                  id="image_url"
                  value={form.image_url ?? ''}
                  onChange={e => handleChange('image_url', e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#2a2a38] bg-[#111118] p-4 space-y-4">
            <h2 className="text-sm font-semibold text-white border-b border-[#2a2a38] pb-2">Precios</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cost_price">Precio de costo (COP)</Label>
                <Input
                  id="cost_price"
                  type="number"
                  min="0"
                  step="1"
                  value={form.cost_price}
                  onChange={e => handleChange('cost_price', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sale_price">Precio de venta (COP)</Label>
                <Input
                  id="sale_price"
                  type="number"
                  min="0"
                  step="1"
                  value={form.sale_price}
                  onChange={e => handleChange('sale_price', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label>Margen de ganancia</Label>
                <div className={`flex h-10 items-center px-3 rounded-lg border font-semibold text-sm ${
                  parseFloat(margin) > 0
                    ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400'
                    : 'border-[#2a2a38] bg-[#111118] text-slate-400'
                }`}>
                  {margin}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Stock */}
        <div className="space-y-4">
          <div className="rounded-xl border border-[#2a2a38] bg-[#111118] p-4 space-y-4">
            <h2 className="text-sm font-semibold text-white border-b border-[#2a2a38] pb-2">Stock</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="stock">Stock actual</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  step="1"
                  value={form.stock}
                  onChange={e => handleChange('stock', parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minimum_stock">Stock mínimo</Label>
                <Input
                  id="minimum_stock"
                  type="number"
                  min="0"
                  step="1"
                  value={form.minimum_stock}
                  onChange={e => handleChange('minimum_stock', parseInt(e.target.value) || 0)}
                />
                <p className="text-xs text-slate-500">Recibirás alertas cuando el stock baje de este nivel</p>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
              : <><Save className="w-4 h-4" /> {product ? 'Actualizar' : 'Crear producto'}</>
            }
          </Button>
        </div>
      </div>
    </form>
  )
}
