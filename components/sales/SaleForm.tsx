'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import type { Product, CartItem } from '@/lib/types'
import { createSale } from '@/lib/actions/sales'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatCOP } from '@/lib/utils/currency'
import { calculateSaleTotal, calculateSaleProfit, effectivePrice } from '@/lib/utils/calculations'
import { Search, Plus, Minus, Trash2, ShoppingCart, Package, Loader2, ArrowLeft, Percent, DollarSign } from 'lucide-react'
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
  const [saleDiscountType, setSaleDiscountType] = useState<'pct' | 'amt'>('pct')
  const [saleDiscountValue, setSaleDiscountValue] = useState(0)

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
        discount_pct: 0,
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

  function updateDiscount(productId: string, pct: number) {
    setCart(prev => prev.map(item =>
      item.product.id === productId
        ? { ...item, discount_pct: Math.min(100, Math.max(0, pct)) }
        : item
    ))
  }

  function removeFromCart(productId: string) {
    setCart(prev => prev.filter(item => item.product.id !== productId))
  }

  const itemsTotal = calculateSaleTotal(cart)
  const saleDiscountAmt = saleDiscountType === 'pct'
    ? itemsTotal * (saleDiscountValue / 100)
    : saleDiscountValue
  const finalTotal = calculateSaleTotal(cart, saleDiscountAmt)
  const finalProfit = calculateSaleProfit(cart, saleDiscountAmt)

  async function handleSubmit() {
    if (cart.length === 0) {
      toast.error('Agrega al menos un producto')
      return
    }
    setLoading(true)
    try {
      await createSale(customerName, paymentMethod, cart, notes, saleDiscountAmt)
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
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">Buscar productos</h2>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
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
                className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all text-left group"
              >
                <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <Package className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900 truncate">{product.name}</p>
                  <p className="text-xs text-slate-500">{formatCOP(product.sale_price)} · Stock: {product.stock}</p>
                </div>
                <Plus className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 flex-shrink-0" />
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-2 text-center py-4 text-slate-400 text-sm">No se encontraron productos</div>
            )}
          </div>
        </div>

        {/* Cart */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">
            Carrito ({cart.length} productos)
          </h2>
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
              <ShoppingCart className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm font-medium text-slate-500">El carrito está vacío</p>
              <p className="text-xs text-slate-400 mt-1">Busca y agrega productos arriba</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cart.map(item => {
                const discounted = item.discount_pct > 0
                const effPrice = effectivePrice(item)
                return (
                  <div key={item.product.id} className="rounded-lg bg-white border border-slate-200 overflow-hidden">
                    {/* Row 1: name + delete */}
                    <div className="flex items-center gap-3 px-3 pt-3 pb-1">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{item.product.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">Costo: {formatCOP(item.unit_cost)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-slate-300 hover:text-red-500 transition-colors p-1 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {/* Row 2: qty + price + discount + total */}
                    <div className="flex items-center gap-2 px-3 pb-3 flex-wrap">
                      {/* Quantity */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center text-sm font-bold text-slate-900">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="w-8 h-8 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 flex items-center justify-center text-indigo-600 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      {/* Price */}
                      <div className="flex items-center gap-1 flex-1 min-w-0">
                        <span className="text-xs text-slate-400 whitespace-nowrap shrink-0">$ unit.</span>
                        <input
                          type="number"
                          value={item.unit_price}
                          onChange={e => updatePrice(item.product.id, parseFloat(e.target.value) || 0)}
                          onFocus={e => e.target.select()}
                          className="w-full h-8 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                          min="0"
                        />
                      </div>
                      {/* Discount */}
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-slate-400 shrink-0">% desc.</span>
                        <input
                          type="number"
                          value={item.discount_pct}
                          onChange={e => updateDiscount(item.product.id, parseFloat(e.target.value) || 0)}
                          onFocus={e => e.target.select()}
                          className="w-14 h-8 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400"
                          min="0"
                          max="100"
                        />
                      </div>
                      {/* Line total */}
                      <div className="text-right ml-auto">
                        {discounted && (
                          <p className="text-xs text-slate-400 line-through leading-none mb-0.5">
                            {formatCOP(item.unit_price * item.quantity)}
                          </p>
                        )}
                        <p className={`text-sm font-bold ${discounted ? 'text-amber-600' : 'text-slate-900'}`}>
                          {formatCOP(effPrice * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Checkout */}
      <div className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Datos de la venta</h2>
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
              className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
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
              className="flex w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 resize-none"
            />
          </div>
        </div>

        {/* Order Summary */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Resumen</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Subtotal</span>
              <span className="text-slate-900">{formatCOP(itemsTotal)}</span>
            </div>

            {/* Sale-level discount */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500 whitespace-nowrap">Descuento venta</span>
              <div className="flex-1 flex items-center gap-1">
                <input
                  type="number"
                  value={saleDiscountValue}
                  onChange={e => setSaleDiscountValue(Math.max(0, parseFloat(e.target.value) || 0))}
                  onFocus={e => e.target.select()}
                  className="w-full h-8 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400"
                  min="0"
                />
                <button
                  type="button"
                  onClick={() => setSaleDiscountType(t => t === 'pct' ? 'amt' : 'pct')}
                  className="h-8 w-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors shrink-0"
                  title="Cambiar tipo de descuento"
                >
                  {saleDiscountType === 'pct'
                    ? <Percent className="w-3.5 h-3.5" />
                    : <DollarSign className="w-3.5 h-3.5" />
                  }
                </button>
              </div>
              {saleDiscountAmt > 0 && (
                <span className="text-sm font-medium text-amber-600 whitespace-nowrap">
                  -{formatCOP(saleDiscountAmt)}
                </span>
              )}
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Utilidad estimada</span>
              <span className="text-emerald-600">{formatCOP(finalProfit)}</span>
            </div>
            <div className="border-t border-slate-100 pt-2 flex justify-between">
              <span className="font-semibold text-slate-900">Total</span>
              <span className="font-bold text-xl text-slate-900">{formatCOP(finalTotal)}</span>
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
