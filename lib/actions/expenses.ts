'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

/** Obtener gastos */
export async function getExpenses(limit?: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  let query = supabase
    .from('expenses')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (limit) query = query.limit(limit)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data
}

/** Crear gasto */
export async function createExpense(formData: {
  description: string
  amount: number
  category: string
  notes?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data, error } = await supabase
    .from('expenses')
    .insert([{ ...formData, user_id: user.id }])
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/finances')
  revalidatePath('/')
  return data
}

/** Actualizar gasto */
export async function updateExpense(id: string, formData: {
  description?: string
  amount?: number
  category?: string
  notes?: string
}) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('expenses')
    .update(formData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/finances')
  return data
}

/** Eliminar gasto */
export async function deleteExpense(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/finances')
  revalidatePath('/')
}
