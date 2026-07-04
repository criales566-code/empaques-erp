'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Product } from '@/lib/types'
import { deleteProduct } from '@/lib/actions/products'
import { formatCOP } from '@/lib/utils/currency'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { Edit, Trash2, Search, Package, Filter, Plus } from 'lucide-react'
import { toast } from 'sonner'

function getStockBadge(product: Product) {
  if (product.stock === 0) return <Badge variant="destructive">Agotado</Badge>
  if (product.stock <= product.minimum_stock) return <Badge variant="warning">Stock bajo</Badge>
  return <Badge variant="success">En stock</Badge>
}

export function ProductsTable({ products }: { products: Product[] }) {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category).filter(Boolean) as string[])
    return Array.from(cats).sort()
  }, [products])

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchSearch = search === '' ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku?.toLowerCase().includes(search.toLowerCase()) ||
        p.barcode?.toLowerCase().includes(search.toLowerCase())
      const matchCat = categoryFilter === '' || p.category === categoryFilter
      return matchSearch && matchCat
    })
  }, [products, search, categoryFilter])

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    try {
      const result = await deleteProduct(deleteId)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('Producto eliminado')
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al eliminar')
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  return (
    <>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <Input
            placeholder="Buscar por nombre, SKU o código de barras..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 h-11 text-[14px]"
          />
        </div>
        {categories.length > 0 && (
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500 shrink-0" />
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="h-11 min-w-0 flex-1 sm:flex-none rounded-lg border border-slate-200 bg-white px-3 text-[14px] text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
            >
              <option value="">Todas las categorías</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-200 rounded-2xl bg-white">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-[15px] font-semibold text-slate-800">
            {search || categoryFilter ? 'No se encontraron productos' : 'Sin productos aún'}
          </p>
          <p className="text-[13px] text-slate-500 mt-1 mb-4 text-center max-w-xs px-4">
            {search || categoryFilter
              ? 'Intenta con otros términos de búsqueda'
              : 'Comienza agregando tu primer producto al inventario'}
          </p>
          {!search && !categoryFilter && (
            <Link href="/inventory/new">
              <Button size="sm">
                <Plus className="w-3.5 h-3.5" />
                Agregar producto
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-[14px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-5 py-3.5 text-[12px] font-semibold text-slate-600 uppercase tracking-wider">Producto</th>
                  <th className="text-left px-5 py-3.5 text-[12px] font-semibold text-slate-600 uppercase tracking-wider hidden md:table-cell">SKU / Barcode</th>
                  <th className="text-left px-5 py-3.5 text-[12px] font-semibold text-slate-600 uppercase tracking-wider hidden lg:table-cell">Categoría</th>
                  <th className="text-right px-5 py-3.5 text-[12px] font-semibold text-slate-600 uppercase tracking-wider">Precio</th>
                  <th className="text-right px-5 py-3.5 text-[12px] font-semibold text-slate-600 uppercase tracking-wider">Stock</th>
                  <th className="text-left px-5 py-3.5 text-[12px] font-semibold text-slate-600 uppercase tracking-wider">Estado</th>
                  <th className="text-right px-5 py-3.5 text-[12px] font-semibold text-slate-600 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(product => (
                  <tr key={product.id} className="bg-white hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {product.image_url ? (
                          <div className="w-11 h-11 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                            <Image
                              src={product.image_url}
                              alt={product.name}
                              width={44}
                              height={44}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-11 h-11 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                            <Package className="w-5 h-5 text-slate-500" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate max-w-[180px]">{product.name}</p>
                          {product.supplier && (
                            <p className="text-[12px] text-slate-500 truncate mt-0.5">{product.supplier}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <div className="text-[13px] text-slate-600 space-y-0.5">
                        {product.sku && <div><span className="font-medium text-slate-500">SKU:</span> {product.sku}</div>}
                        {product.barcode && <div><span className="font-medium text-slate-500">EAN:</span> {product.barcode}</div>}
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      {product.category && (
                        <Badge variant="outline" className="text-[12px]">{product.category}</Badge>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div>
                        <p className="font-semibold text-slate-900">{formatCOP(product.sale_price)}</p>
                        <p className="text-[12px] text-slate-500 mt-0.5">Costo: {formatCOP(product.cost_price)}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div>
                        <p className="font-semibold text-slate-900">{product.stock}</p>
                        <p className="text-[12px] text-slate-500 mt-0.5">Mín: {product.minimum_stock}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">{getStockBadge(product)}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/inventory/${product.id}`}>
                          <Button variant="ghost" size="icon-sm" title="Editar" aria-label="Editar producto">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => setDeleteId(product.id)}
                          title="Eliminar"
                          aria-label="Eliminar producto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>¿Eliminar producto?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. El producto será eliminado permanentemente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
