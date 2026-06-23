'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import type { Product, CartItem } from '@/lib/types'
import { createSale } from '@/lib/actions/sales'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatCOP } from '@/lib/utils/currency'
import { calculateSaleTotal, calculateSaleProfit } from '@/lib/utils/calculations'
import { Search, Plus, Minus, Trash2, ShoppingCart, Package, Loader2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

const PAYMENT_METHODS = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'tarjeta', label: 'Tarjeta' },
  { value: 'credito', label: 'Crédito' },
]

export function SaleForm({ products }: { products: Product[] }) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [customerName, setCustomerName] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('efectivo')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const filtered = useMemo(() => {
    if (!search.trim()) return products.slice(0, 8)
    return products.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode?.toLowerCase().includes(search.toLowerCase())
    ).slice(0, 8)
  }, [products, search])

  function addToCart(product: Product) {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id)
      if (existing) {
        if (existing.quantity >= product.stock) {
          toast.error(`Stock máximo: ${product.stock} unidades`)
          return prev
        }
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, {
        product,
        quantity: 1,
        unit_price: product.sale_price,
        unit_cost: product.cost_price,
      }]
    })
    setSearch('')
  }

  function updateQuantity(productId: string, delta: number) {
    setCart(prev => prev.map(item => {
      if (item.product.id !== productId) return item
      const newQty = item.quantity + delta
      if (newQty < 1) return item
      if (newQty > item.product.stock) {
        toast.error(`Stock máximo: ${item.product.stock} unidades`)
        return item
      }
      return { ...item, quantity: newQty }
    }))
  }

  function updatePrice(productId: string, price: number) {
    setCart(prev => prev.map(item =>
      item.product.id === productId ? { ...item, unit_price: price } : item
    ))
  }

  function removeFromCart(productId: string) {
    setCart(prev => prev.filter(item => item.product.id !== productId))
  }

  const total = calculateSaleTotal(cart)
  const profit = calculateSaleProfit(cart)

  async function handleSubmit() {
    if (cart.length === 0) {
      toast.error('Agrega al menos un producto')
      return
    }
    setLoading(true)
    try {
      await createSale(customerName, paymentMethod, cart, notes)
      toast.success('¡Venta registrada exitosamente!')
      router.push('/sales')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al registrar venta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Product Search */}
      <div className="xl:col-span-2 space-y-4">
        <div className="rounded-xl border border-[#2a2a38] bg-[#111118] p-4">
          <h2 className="text-sm font-semibold text-white mb-3">Buscar productos</h2>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar por nombre, SKU o código de barras..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
            {filtered.map(product => (
              <button
                key={product.id}
                type="button"
                onClick={() => addToCart(product)}
                className="flex items-center gap-3 p-3 rounded-lg border border-[#2a2a38] hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all text-left group"
              >
                <div className="w-8 h-8 rounded bg-[#2a2a38] flex items-center justify-center flex-shrink-0">
                  <Package className="w-4 h-4 text-slate-500 group-hover:text-indigo-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white truncate">{product.name}</p>
                  <p className="text-xs text-slate-400">{formatCOP(product.sale_price)} · Stock: {product.stock}</p>
                </div>
                <Plus className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 flex-shrink-0" />
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-2 text-center py-4 text-slate-500 text-sm">No se encontraron productos</div>
            )}
          </div>
        </div>

        {/* Cart */}
        <div className="rounded-xl border border-[#2a2a38] bg-[#111118] p-4">
          <h2 className="text-sm font-semibold text-white mb-3">
            Carrito ({cart.length} productos)
          </h2>
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-500">
              <ShoppingCart className="w-8 h-8 mb-2 opacity-40" />
              <p className="text-sm">El carrito está vacío</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cart.map(item => (
                <div key={item.product.id} className="flex items-center gap-3 p-3 rounded-lg bg-[#1a1a24] border border-[#2a2a38]">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{item.product.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-400">Precio:</span>
                      <input
                        type="number"
                        value={item.unit_price}
                        onChange={e => updatePrice(item.product.id, parseFloat(e.target.value) || 0)}
                        className="w-28 h-6 rounded bg-[#111118] border border-[#2a2a38] px-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                        min="0"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product.id, -1)}
                      className="w-7 h-7 rounded-md bg-[#2a2a38] hover:bg-[#3a3a50] flex items-center justify-center text-slate-300"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium text-white">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product.id, 1)}
                      className="w-7 h-7 rounded-md bg-[#2a2a38] hover:bg-[#3a3a50] flex items-center justify-center text-slate-300"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="text-right min-w-[80px]">
                    <p className="text-sm font-semibold text-white">{formatCOP(item.unit_price * item.quantity)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-red-400 hover:text-red-300 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Checkout */}
      <div className="space-y-4">
        <div className="rounded-xl border border-[#2a2a38] bg-[#111118] p-4 space-y-4">
          <h2 className="text-sm font-semibold text-white">Datos de la venta</h2>
          <div className="space-y-2">
            <Label>Cliente (opcional)</Label>
            <Input
              placeholder="Cliente general"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Método de pago</Label>
            <select
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-[#2a2a38] bg-[#111118] px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              {PAYMENT_METHODS.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Notas</Label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="Notas adicionales..."
              className="flex w-full rounded-lg border border-[#2a2a38] bg-[#111118] px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
            />
          </div>
        </div>

        {/* Order Summary */}
        <div className="rounded-xl border border-[#2a2a38] bg-[#111118] p-4 space-y-3">
          <h2 className="text-sm font-semibold text-white">Resumen</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Subtotal</span>
              <span className="text-white">{formatCOP(total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Utilidad estimada</span>
              <span className="text-emerald-400">{formatCOP(profit)}</span>
            </div>
            <div className="border-t border-[#2a2a38] pt-2 flex justify-between">
              <span className="font-semibold text-white">Total</span>
              <span className="font-bold text-xl text-white">{formatCOP(total)}</span>
            </div>
          </div>
          <Button
            onClick={handleSubmit}
            className="w-full"
            size="lg"
            disabled={loading || cart.length === 0}
            variant="success"
          >
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Registrando...</>
              : <><ShoppingCart className="w-4 h-4" /> Confirmar venta</>
            }
          </Button>
          <Link href="/sales">
            <Button variant="ghost" className="w-full" size="sm">
              <ArrowLeft className="w-4 h-4" />
              Cancelar
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
