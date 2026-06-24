'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { CartItem } from '@/lib/types'
import { calculateSaleTotal, calculateSaleProfit } from '@/lib/utils/calculations'

/** Registrar venta (crea sale + sales_items, trigger descuenta stock) */
export async function createSale(
  customerName: string,
  paymentMethod: string,
  items: CartItem[],
  notes?: string,
  saleDiscountAmt = 0
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const total = calculateSaleTotal(items, saleDiscountAmt)
  const profit = calculateSaleProfit(items, saleDiscountAmt)

  // 1. Crear la venta
  const { data: sale, error: saleError } = await supabase
    .from('sales')
    .insert([{
      user_id: user.id,
      customer_name: customerName || 'Cliente general',
      total,
      profit,
      payment_method: paymentMethod,
      notes: notes || null,
    }])
    .select()
    .single()

  if (saleError) throw new Error(saleError.message)

  // 2. Insertar items (trigger descuenta stock automáticamente)
  const saleItems = items.map(item => ({
    sale_id: sale.id,
    product_id: item.product.id,
    quantity: item.quantity,
    unit_price: item.unit_price,
    unit_cost: item.unit_cost,
  }))

  const { error: itemsError } = await supabase
    .from('sales_items')
    .insert(saleItems)

  if (itemsError) throw new Error(itemsError.message)

  revalidatePath('/sales')
  revalidatePath('/inventory')
  revalidatePath('/')

  return sale
}

/** Obtener ventas con items */
export async function getSales(limit?: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  let query = supabase
    .from('sales')
    .select(`
      *,
      sales_items (
        *,
        product:products (name, sku)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (limit) query = query.limit(limit)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data
}

/** Obtener venta individual */
export async function getSaleById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sales')
    .select(`
      *,
      sales_items (
        *,
        product:products (name, sku, image_url)
      )
    `)
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return data
}

/** Eliminar venta (trigger restaura stock) */
export async function deleteSale(id: string) {
  const supabase = await createClient()

  // Primero eliminar items (trigger restaura stock)
  const { error: itemsError } = await supabase
    .from('sales_items')
    .delete()
    .eq('sale_id', id)

  if (itemsError) throw new Error(itemsError.message)

  const { error } = await supabase
    .from('sales')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/sales')
  revalidatePath('/inventory')
  revalidatePath('/')
}

/** Resumen de ventas por mes (últimos 6 meses) */
export async function getMonthlySalesSummary() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const { data, error } = await supabase
    .from('sales')
    .select('total, profit, created_at')
    .eq('user_id', user.id)
    .gte('created_at', sixMonthsAgo.toISOString())
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  return data
}
