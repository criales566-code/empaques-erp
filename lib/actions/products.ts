'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ProductFormData } from '@/lib/types'

/** Obtener todos los productos del usuario */
export async function getProducts() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', user.id)
    .order('name', { ascending: true })

  if (error) throw new Error(error.message)
  return data
}

/** Obtener un producto por ID */
export async function getProductById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return data
}

/** Obtener producto por barcode */
export async function getProductByBarcode(barcode: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', user.id)
    .eq('barcode', barcode)
    .maybeSingle()

  return data
}

/** Crear producto */
export async function createProduct(formData: ProductFormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data, error } = await supabase
    .from('products')
    .insert([{ ...formData, user_id: user.id }])
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/inventory')
  revalidatePath('/')
  return data
}

/** Actualizar producto */
export async function updateProduct(id: string, formData: Partial<ProductFormData>) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .update({ ...formData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/inventory')
  revalidatePath('/')
  return data
}

/** Eliminar producto */
export async function deleteProduct(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/inventory')
  revalidatePath('/')
}

/** Actualizar stock directamente */
export async function updateStock(id: string, newStock: number) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('products')
    .update({ stock: newStock, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/inventory')
}
